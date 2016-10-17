require "ossert/web/version"
require "ossert"
require "sinatra"
require "slim"
require "sass"


module Ossert
  module Web
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

      get '/' do
        slim :index
      end

      get '/last_year_graph/:metric' do
        fixed_start_date = params.fetch('from', 20.years.ago).to_datetime
        fixed_end_date = params.fetch('to', Time.now.utc).to_datetime

        @quarters_start_date = [1.year.ago, fixed_start_date].max
        @quarters_end_date = [Time.now.utc, fixed_end_date].min

        @projects = params[:projects].split(',').map do |name|
          project = Ossert::Project.load_by_name(name)
          return "Project '#{name}' Not Found" unless project
          project.decorated
        end

        @community_metrics = @projects.first.community_quarter(@quarters_end_date).keys
        @agility_metrics = @projects.first.agility_quarter(@quarters_end_date).keys

        @metric_type = if @community_metrics.include?(params[:metric])
                         :community
                       elsif @agility_metrics.include?(params[:metric])
                         :agility
                       else
                         raise "Metric '#{params[:metric]}' Not Found"
                       end
        @metric = params[:metric]

        slim :graph_show, layout: false
      end

      get '/total_graph/:metric' do
        @quarters_start_date = Time.now.utc
        @quarters_end_date = 20.years.ago

        fixed_start_date = params.fetch('from', 20.years.ago).to_datetime
        fixed_end_date = params.fetch('to', Time.now.utc).to_datetime

        @projects = params[:projects].split(',').map do |name|
          project = Ossert::Project.load_by_name(name)
          return "Project '#{name}' Not Found" unless project

          @quarters_start_date, @quarters_end_date = project.prepare_time_bounds!(
            extended_start: @quarters_start_date,
            extended_end: @quarters_end_date
          )

          project.decorated
        end

        @quarters_start_date = [@quarters_start_date, fixed_start_date].max
        @quarters_end_date = [@quarters_end_date, fixed_end_date].min

        @community_metrics = @projects.first.community_quarter(@quarters_end_date).keys
        @agility_metrics = @projects.first.agility_quarter(@quarters_end_date).keys

        @metric_type = if @community_metrics.include?(params[:metric])
                         :community
                       elsif @agility_metrics.include?(params[:metric])
                         :agility
                       else
                         raise "Metric '#{params[:metric]}' Not Found"
                       end
        @metric = params[:metric]

        slim :graph_show, layout: false
      end

      get '/history/:name' do
        @project = Ossert::Project.load_by_name(params[:name])
        return "Project '#{params[:name]}' Not Found" unless @project

        @quarters_start_date, @quarters_end_date = @project.prepare_time_bounds!
        @decorated_project = @project.decorated

        slim :history
      end

      get '/:name' do
        @project = Ossert::Project.load_by_name(params[:name])
        return "Not Found" unless @project

        @analysis_gr = @project.analyze_by_growing_classifier

        @quarters_start_date, @quarters_end_date = @project.prepare_time_bounds!
        @decorated_project = @project.decorated

        slim :show
      end
    end
  end
end
