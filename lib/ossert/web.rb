require "ossert/web/version"
require "ossert"
require "sinatra"
require "slim"
require "sass"
require 'sinatra/redis-cache'

module Ossert
  module Web
    class Warmup
      attr_reader :popularity_metrics, :maintenance_metrics, :maturity_metrics, :cache

      def self.perform
        warmup = new
        warmup.perform
        warmup
      end

      def perform
        @popularity_metrics = (::Settings['stats']['community']['quarter']['metrics'] +
                              ::Settings['stats']['community']['total']['metrics']).uniq

        @maintenance_metrics = (::Settings['stats']['agility']['quarter']['metrics'] +
                                ::Settings['stats']['agility']['total']['metrics']).uniq

        @maturity_metrics = (::Settings['classifiers']['growth']['metrics']['maturity']['last_year'].keys +
                            ::Settings['classifiers']['growth']['metrics']['maturity']['total'].keys).uniq

        @cache = Sinatra::RedisCache::Cache.new

        ::Ossert.init
        ::Ossert::Classifiers.train
      end

      def cache(key, expire_in, &block)
        @cache.do(key, expire_in, -> { yield self })
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
      enable :sessions

      set :warmup, Warmup.perform
      set :header_search, true

      get '/' do
        @warn = session[:warn]
        session[:warn] = nil
        settings.header_search = false

        erb :index
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
        project = Ossert::Project.load_by_name(params[:name])
        return erb(:not_found) unless project
        redirect to(params[:name])
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
          return "Project '#{name}' Not Found" unless project

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
            @name = name
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

      # FIXME: Missing favicon
      get '/favicon.ico' do
        ''
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
              popularity_metrics: warmup.popularity_metrics,
              maintenance_metrics: warmup.maintenance_metrics,
              maturity_metrics: warmup.maturity_metrics
            }
            Ossert::Presenters::Project.with_presenter(project) do |project_decorated|
              (locals[:popularity_metrics] + locals[:maintenance_metrics] + locals[:maturity_metrics]).each do |metric|
                locals[:metric_lookup][metric] = project_decorated.metric_preview(metric)
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
