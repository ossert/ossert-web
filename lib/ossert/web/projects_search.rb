module Ossert
  module Web
    module ProjectsSearch
      module_function

      def by_name(name)
        TotalSearchResults.new(
          Searcher::Local.new(name),
          Searcher::Rubygems.new(name)
        )
      end

      class TotalSearchResults
        def initialize(local_searcher, suggestions_searcher)
          @local_searcher = local_searcher
          @suggestions_searcher = suggestions_searcher
        end

        def found_any?
          any_local_results? || any_suggestions_results?
        end

        def exact_match
          local_results.exact_match_project_name
        end

        def project_names
          local_results.project_names - [exact_match]
        end

        def suggestions
          suggestions_results.project_names - local_results.project_names
        end

        def suggestion_match
          suggestions_results.exact_match_project_name
        end

        private

        def local_results
          @local_results ||= @local_searcher.search(suggestions_results.project_names)
        end

        def suggestions_results
          @suggestions_results ||= @suggestions_searcher.search
        end

        def any_local_results?
          local_results.any?
        end

        def any_suggestions_results?
          suggestions_results.any?
        end
      end

      module Searcher
        class Local
          def initialize(project_name)
            @project_name = project_name
          end

          def search(suggestions_project_names = [])
            projects = ::Project
              .where('name % ?', @project_name)
              .or(name: suggestions_project_names)
              .select(
                Sequel.lit('name'),
                Sequel.lit("name <-> #{::Project.db.literal(@project_name)} as distance"))
              .order(:distance)
              .limit(Results::LIMIT)
              .to_a

            Results::Local.new(projects, @project_name)
          end
        end

        class Rubygems
          API_URL = 'https://rubygems.org/api/v1/search.json'.freeze

          def initialize(project_name)
            @project_name = project_name
          end

          def search
            response = Faraday.new.get(API_URL, query: @project_name)

            if response.status == 200
              Results::Rubygems.new(
                JSON.parse(response.body, symbolize_names: true),
                @project_name
              )
            else
              Results::Blank.new
            end
          rescue Faraday::Error
            Results::Blank.new
          end
        end
      end

      module Results
        LIMIT = 15
        class Base
          def initialize(found_projects, project_name)
            @found_projects = found_projects.take(LIMIT)
            @project_name = project_name
          end

          def any?
            !@found_projects.empty?
          end

          def project_names
            @found_projects.map { |project| project[:name] }
          end

          def exact_match_project_name
            exact_match && exact_match[:name]
          end
        end

        class Local < Base
          private

          def exact_match
            @exact_match ||= @found_projects.find do |project|
              project[:distance].zero?
            end
          end
        end

        class Rubygems < Base
          private

          # TODO not so reliable
          def exact_match
            @exact_match ||= @found_projects.find do |project|
              project[:name] == @project_name.downcase
            end
          end
        end

        class Blank < Base
          def initialize(*)
            @found_projects = []
          end
        end
      end
    end
  end
end
