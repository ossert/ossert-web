module Ossert
  module Web
    class ProjectsSearch
      attr_accessor :on_error

      def initialize(project_name)
        @project_name = project_name
        yield self if block_given?
      end

      def found_any?
        local.any? || suggestions.any?
      end

      def local
        @local ||= Searcher::Local
          .new(@project_name)
          .search(including_projects: suggestions.project_names)
      end

      def suggestions
        @suggestions ||= Searcher::Rubygems
          .new(@project_name, error_handler: on_error)
          .search
      end

      module Searcher
        class Local
          def initialize(project_name)
            @project_name = project_name
          end

          def search(including_projects: [])
            projects = ::Project
              .where('name % ?', @project_name)
              .or(name: including_projects)
              .select(
                Sequel.lit('name'),
                Sequel.lit("name <-> #{::Project.db.literal(@project_name)} AS distance"))
              .order(:distance)
              .limit(Results::LIMIT)
              .to_a

            Results.new(
              projects,
              match_finder: ->(project){ project[:distance].zero? }
            )
          end
        end

        class Rubygems
          API_URL = 'https://rubygems.org/api/v1/search.json'.freeze

          def initialize(project_name, error_handler: nil)
            @project_name = project_name
            @error_handler = error_handler
          end

          def search
            response = Faraday.new.get(API_URL, query: @project_name)

            projects = if response.status == 200
                         JSON.parse(response.body, symbolize_names: true)
                       else
                         []
                       end

            Results.new(
              projects,
              match_finder: ->(project) do
                project[:name].downcase == @project_name.downcase
              end
            )
          rescue Faraday::Error => error
            handle_error(error)
            Results.new([])
          end

          private

          def handle_error(error)
            @error_handler && @error_handler.call(error)
          end
        end
      end

      class Results
        LIMIT = 15

        def initialize(found_projects, match_finder: ->(_){ })
          @found_projects = found_projects.take(LIMIT)
          @match_finder = match_finder
        end

        def any?
          !@found_projects.empty?
        end

        def exact_match
          @exact_match ||= (@found_projects.find(&@match_finder) || {})[:name]
        end

        def matches(except: [])
          project_names - Array(except)
        end

        def project_names
          @found_projects.map { |project| project[:name] }
        end
      end
    end
  end
end
