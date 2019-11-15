require "ossert/web/version"
require "ossert"
require "ossert/web/projects_search"
require "ossert/web/helpers"
require "sinatra"
require "slim"
require "sass"
require 'sinatra/redis-cache'
require 'ostruct'
require 'oauth2'

::Ossert.init
module Ossert
  module Web
    class Cryptograph
      attr_reader :cipher

      def encrypt(message)
        cipher = OpenSSL::Cipher::Cipher.new("AES256").encrypt
        cipher.pkcs5_keyivgen(
          Digest::SHA2.hexdigest(ENV.fetch("GITHUB_APP_SECRET"))[0...32],
          Digest::SHA2.hexdigest(ENV.fetch("GITHUB_APP_SECRET"))[-9...-1],
        )

        Base64.encode64(cipher.update(message) + cipher.final)
      end

      def decrypt(message)
        cipher = OpenSSL::Cipher::Cipher.new("AES256").decrypt
        cipher.pkcs5_keyivgen(
          Digest::SHA2.hexdigest(ENV.fetch("GITHUB_APP_SECRET"))[0...32],
          Digest::SHA2.hexdigest(ENV.fetch("GITHUB_APP_SECRET"))[-9...-1],
        )

        cipher.update(Base64.decode64(message)) + cipher.final
      end
    end

    class Users < Sequel::Model(:users)
    end

    class Warmup
      attr_reader :popularity_metrics, :maintenance_metrics, :maturity_metrics, :cache

      def self.perform
        warmup = new
        warmup.perform
        warmup
      end

      def perform
        config_root_const = 'CONFIG_ROOT'
        Ossert::Config.send(:remove_const, config_root_const)
        Ossert::Config.const_set(config_root_const, File.join(File.dirname(__FILE__), '..', '..', 'config'))
        Ossert::Config.load(
          :stats, :classifiers_growth, :classifiers_cluster, :translations, :descriptions, :fetchers
        )
        @popularity_metrics = (::Settings['stats']['community']['quarter']['metrics'] +
                              ::Settings['stats']['community']['total']['metrics']).uniq

        @maintenance_metrics = (::Settings['stats']['agility']['quarter']['metrics'] +
                                ::Settings['stats']['agility']['total']['metrics']).uniq

        @maturity_metrics = (::Settings['classifiers_growth']['metrics']['maturity']['last_year'].keys +
                            ::Settings['classifiers_growth']['metrics']['maturity']['total'].keys).uniq

        @cache = Sinatra::RedisCache::Cache.new

        return if ENV.fetch('RACK_ENV', 'test') == 'test'
        ::Ossert::Classifiers.train
      end

      def cache(key, expire_in, &block)
        @cache.do(key, expire_in, -> { yield self })
      end

      def crypto
        Thread.current[:crypto] ||= Cryptograph.new
      end

      def oauth_client
        @oauth_client ||= OAuth2::Client.new(
          ENV.fetch("GITHUB_APP_ID"), ENV.fetch("GITHUB_APP_SECRET"),
          :site => 'https://github.com/login',
          :authorize_url => '/login/oauth/authorize',
          :token_url => '/login/oauth/access_token'
        )
      end
    end

    class SassHandler < Sinatra::Base
      set :views, File.dirname(__FILE__) + '/assets/sass'

      get '/css/*.css' do
        filename = params[:splat].first
        sass filename.to_sym
      end
    end

    class JSHandler < Sinatra::Base
      set :views, File.dirname(__FILE__) + '/assets/js'

      get '/js/*.js' do
        filename = params[:splat].first
        File.read filename
      end
    end

    class App < Sinatra::Base
      set :views, File.dirname(__FILE__) + '/../../views'
      set :public_dir, File.dirname(__FILE__) + '/../../public'
      set :cache_ttl, 2.hours
      set :logging, true
      enable :sessions

      set :warmup, Warmup.perform
      helpers Helpers

      get '/' do
        @warn = session[:warn]
        session[:warn] = nil
        @hide_header_search = true

        erb :index
      end

      get '/cossma/thanks' do
        erb :'cossma/thanks'
      end

      get '/cossma/oauth/callback' do
        begin
          access_token = settings.warmup.oauth_client.get_token(params)
          user_data = JSON.parse(access_token.get('https://api.github.com/user').body)
          secured_token = settings.warmup.crypto.encrypt(access_token.token)

          user = Users.find(login: user_data["login"])
          user ||= Users.create(login: user_data["login"], github_token: secured_token, created_at: Time.now)
          user.update(github_token: secured_token)

          redirect(to("/cossma/thanks"))
        rescue OAuth2::Error => e
          %(<p>Outdated ?code=#{params[:code]}:</p><p>#{$!}</p><p><a href="/cossma/login">Retry</a></p>)
        end
      end

      def oauth_redirect_uri(path = '/cossma/oauth/callback', query = nil)
        uri = URI.parse(request.url)
        uri.path  = path
        uri.query = query
        uri.to_s
      end

      get '/cossma/login' do
        url = settings.warmup.oauth_client.authorize_url(
          :redirect_uri => oauth_redirect_uri,
          :scope => '',
          :client_id => ENV.fetch("GITHUB_APP_ID"),
        )
        puts "Redirecting to URL: #{url.inspect}"
        redirect url
      end

      get '/cossma/auth' do
        erb :'cossma/auth'
      end

      get '/last_year_graph/:metric' do
        fixed_start_date = params.fetch('from', 20.years.ago).to_datetime
        fixed_end_date = params.fetch('to', Time.now.utc).to_datetime

        @quarters_start_date = [1.year.ago, fixed_start_date].max.to_time
        @quarters_end_date = [Time.now.utc, fixed_end_date].min.to_time

        @projects = (params[:projects].to_s.split(',') || []).map do |name|
          project = Ossert::Project.load_by_name(name)
          unless project
            session[:name] = name
            return erb(:not_found)
          end
          project.decorated
        end

        return "No projects loaded" unless @projects.present?

        @metric_type = Ossert::Stats.guess_section_by_metric(params[:metric])
        raise "Metric '#{params[:metric]}' Not Found" if @metric_type == :not_found

        @metric = params[:metric]

        slim :graph_show, layout: false
      end

      get '/search/:name' do
        search_results = ProjectsSearch.new(params[:name]) do |search|
          search.on_error = ->(error){ logger.error "Search error: #{error.message}" }
        end

        erb :search_results, locals: { search_results: search_results }
      end

      get '/suggest/:name' do
        Ossert::Workers::Fetch.perform_async(params[:name])
        return redirect(to(params[:name])) if Ossert::Project.exist?(params[:name])

        session[:warn] = "Trying to get enough information for project <big>\"#{params[:name]}\"</big>..."
        redirect to('/')
      end

      get '/section_graph/:section' do
        raise "Section #{params[:section]} Unkonwn" unless params[:section].in? ["popularity", "maintenance"]
        @section = params[:section]

        @metric_type = @section == "popularity" ? :community : :agility
        @metrics = ::Settings['stats'][@metric_type.to_s]['quarter']['metrics']

        @quarters_start_date = Time.now.utc
        @quarters_end_date = 20.years.ago

        fixed_start_date = params.fetch('from', 20.years.ago).to_datetime
        fixed_end_date = params.fetch('to', Time.now.utc).to_datetime

        @projects = (params[:projects].to_s.split(',') || []).map do |name|
          project = Ossert::Project.load_by_name(name)
          unless project
            session[:name] = name
            return erb(:not_found)
          end

          @quarters_start_date, @quarters_end_date = project.prepare_time_bounds!(
            extended_start: @quarters_start_date,
            extended_end: @quarters_end_date
          )

          project.decorated
        end

        return "No projects loaded" unless @projects.present?

        @quarters_start_date = [@quarters_start_date, fixed_start_date].max.to_time
        @quarters_end_date = [@quarters_end_date, fixed_end_date].min.to_time

        slim :graphs_show, layout: false
      end

      get '/total_graph/:metric' do
        @quarters_start_date = Time.now.utc
        @quarters_end_date = 20.years.ago

        fixed_start_date = params.fetch('from', 20.years.ago).to_datetime
        fixed_end_date = params.fetch('to', Time.now.utc).to_datetime

        @projects = (params[:projects].to_s.split(',') || []).map do |name|
          project = Ossert::Project.load_by_name(name)
          unless project
            session[:name] = name
            return erb(:not_found)
          end

          @quarters_start_date, @quarters_end_date = project.prepare_time_bounds!(
            extended_start: @quarters_start_date,
            extended_end: @quarters_end_date
          )

          project.decorated
        end

        return "No projects loaded" unless @projects.present?

        @quarters_start_date = [@quarters_start_date, fixed_start_date].max.to_time
        @quarters_end_date = [@quarters_end_date, fixed_end_date].min.to_time

        @metric_type = if Ossert::Stats::CommunityQuarter.include?(params[:metric])
                         :community
                       elsif Ossert::Stats::AgilityQuarter.include?(params[:metric])
                         :agility
                       else
                         raise "Metric '#{params[:metric]}' Not Found"
                       end
        @metric = params[:metric]

        slim :graph_show, layout: false
      end

      get '/history/:name' do
        @project = Ossert::Project.load_by_name(params[:name])
        return erb(:not_found) unless @project

        @quarters_start_date, @quarters_end_date = @project.prepare_time_bounds!
        @quarters_start_date = @quarters_start_date.to_time
        @quarters_end_date = @quarters_end_date.to_time

        @decorated_project = @project.decorated

        slim :history
      end

      # FIXME: Missing robots.txt
      get '/robots.txt' do
        ''
      end

      get '/:name' do
        return erb(:not_found) unless Ossert::Project.exist?(params[:name])
        settings.warmup.cache(params[:name], settings.cache_ttl) do |warmup|
          begin
            project = Ossert::Project.load_by_name(params[:name])

            locals = {
              project: project,
              metric_lookup: {},
              metric_history: {},
              popularity_history_size: 0,
              maintenance_history_size: 0,
              maturity_history_size: 0,
              popularity_metrics: warmup.popularity_metrics,
              maintenance_metrics: warmup.maintenance_metrics,
              maturity_metrics: warmup.maturity_metrics
            }
            Ossert::Presenters::Project.with_presenter(project) do |project_decorated|
              (locals[:popularity_metrics]).each do |metric|
                locals[:metric_lookup][metric] = project_decorated.metric_preview(metric)
                locals[:metric_history][metric] = project_decorated.metric_history(metric).take(21).drop(1)
                locals[:popularity_history_size] = [
                  locals[:metric_history][metric].size,
                  locals[:popularity_history_size]
                ].max
              end

              (locals[:maintenance_metrics]).each do |metric|
                locals[:metric_lookup][metric] = project_decorated.metric_preview(metric)
                locals[:metric_history][metric] = project_decorated.metric_history(metric).take(21).drop(1)
                locals[:maintenance_history_size] = [
                  locals[:metric_history][metric].size,
                  locals[:maintenance_history_size]
                ].max
              end

              (locals[:maturity_metrics]).each do |metric|
                locals[:metric_lookup][metric] = project_decorated.metric_preview(metric)
                locals[:metric_history][metric] = project_decorated.metric_history(metric).take(21).drop(1)
                locals[:maturity_history_size] = [
                  locals[:metric_history][metric].size,
                  locals[:maturity_history_size]
                ].max
              end

              locals[:fast_preview_graph] = project_decorated.fast_preview_graph
              locals[:analysis] = project_decorated.grade
            end

            erb :show, locals: locals
          ensure
            project = nil
            locals = nil
            GC.start
          end
        end
      end
    end
  end
end
