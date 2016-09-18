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
        @quarters_start_date = 1.year.ago
        @quarters_end_date = Time.now.utc

        @projects = params[:projects].split(',').map do |name|
          project = Ossert::Project.load_by_name(name)
          return "Project Not Found" unless project

          Ossert::ProjectDecorator.new(project)
        end

        @community_metrics = @projects.first.community_quarter(@quarters_end_date).keys
        @agility_metrics = @projects.first.agility_quarter(@quarters_end_date).keys

        @metric_type = if @community_metrics.include?(params[:metric])
                    :community
                  elsif @agility_metrics.include?(params[:metric])
                    :agility
                  else
                    raise "Metric Not Found"
                  end
        @metric = params[:metric]

        slim :graph_show, layout: false
      end

      get '/total_graph/:metric' do
        @quarters_start_date = Time.now.utc
        @quarters_end_date = 20.years.ago

        @projects = params[:projects].split(',').map do |name|
          project = Ossert::Project.load_by_name(name)
          return "Project Not Found" unless project

          agility_start_date = Time.now.utc
          agility_end_date = 20.years.ago
          community_start_date = Time.now.utc
          community_end_date = 20.years.ago

          project.agility.quarters.fullfill!
          agility_start_date = [project.agility.quarters.start_date, agility_start_date].min
          agility_end_date = [project.agility.quarters.end_date, agility_end_date].max

          project.community.quarters.fullfill!
          community_start_date = [project.community.quarters.start_date, community_start_date].min
          community_end_date = [project.community.quarters.end_date, community_end_date].max

          @quarters_start_date = [@quarters_start_date, agility_start_date, community_start_date].min
          @quarters_end_date = [@quarters_end_date, agility_end_date, community_end_date].max

          Ossert::ProjectDecorator.new(project)
        end

        @community_metrics = @projects.first.community_quarter(@quarters_end_date).keys
        @agility_metrics = @projects.first.agility_quarter(@quarters_end_date).keys

        @metric_type = if @community_metrics.include?(params[:metric])
                    :community
                  elsif @agility_metrics.include?(params[:metric])
                    :agility
                  else
                    raise "Metric Not Found"
                  end
        @metric = params[:metric]

        slim :graph_show, layout: false
      end

      get '/:name' do
        @project = Ossert::Project.load_by_name(params[:name])
        return "Not Found" unless @project

        @analysis_dt = @project.analyze_by_decisision_tree
        @analysis_gr = @project.analyze_by_growing_classifier

        agility_start_date = Time.now.utc
        agility_end_date = 20.years.ago
        community_start_date = Time.now.utc
        community_end_date = 20.years.ago

        @project.agility.quarters.fullfill!
        agility_start_date = [@project.agility.quarters.start_date, agility_start_date].min
        agility_end_date = [@project.agility.quarters.end_date, agility_end_date].max

        @project.community.quarters.fullfill!
        community_start_date = [@project.community.quarters.start_date, community_start_date].min
        community_end_date = [@project.community.quarters.end_date, community_end_date].max

        @quarters_start_date = [agility_start_date, community_start_date].min
        @quarters_end_date = [agility_end_date, community_end_date].max

        @decorated_project = Ossert::ProjectDecorator.new(@project)

        slim :show
      end
    end
  end
end
