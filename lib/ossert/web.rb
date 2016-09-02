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

        slim :show
      end
    end
  end
end
