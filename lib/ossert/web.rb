require "ossert/web/version"
require "ossert"
require "sinatra"
require "slim"

module Ossert
  module Web
    class App < Sinatra::Base
      get '/' do
        slim :index
      end

      get '/:name' do
        @project = Ossert::Project.load_by_name(params[:name])
        @analysis_dt = @project.analyze_by_decisision_tree
        @analysis_gr = @project.analyze_by_growing_classifier
        slim :show
      end
    end
  end
end
