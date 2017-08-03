module Ossert
  module Web
    # Public: Search projects by name.
    class ProjectsSearch
      # Public: Gets/Sets the Proc callback for errors' handle,
      #   that should accept one argument.
      attr_accessor :on_error

      # Public: Initialize a ProjectsSearch.
      #
      # project_name - The String project name.
      #
      # Yields the ProjectsSearch.
      def initialize(project_name)
        @project_name = project_name
        yield self if block_given?
      end

      # Public: Check if any project was found.
      # Returns the Boolean.
      def found_any?
        (local.matches + suggestions.matches).any?
      end

      # Public: Local search results.
      # Returns the Results with projects from DB.
      def local
        @local ||= Searcher::Local
          .new(@project_name)
          .search(including_projects: suggestions.matches)
      end

      # Public: Suggestions search results.
      # Returns the Results with projects from Rubygems API.
      def suggestions
        @suggestions ||= Searcher::Rubygems
          .new(@project_name, error_handler: on_error)
          .search
      end

      # Internal: Contains classes for search.
      module Searcher
        # Internal: Search projects in DB.
        class Local
          # Internal: Initialize a Searcher::Local.
          #
          # project_name - The String project name.
          def initialize(project_name)
            @project_name = project_name
          end

          # Internal: Search projects in DB.
          #
          # including_projects - Array of Strings of project names
          #                      which should be included in search results
          #                      (default: empty Array).
          #
          # Returns the Results with found projects.
          def search(including_projects: [])
            projects = ::Project
              .where(Sequel.lit('name % ?', @project_name))
              .or(name: including_projects)
              .select(
                Sequel.lit('name'),
                Sequel.lit("name <-> #{::Project.db.literal(@project_name)}::text AS distance"))
              .order(:distance)
              .limit(Results::LIMIT)
              .to_a

            Results.new(
              projects,
              exact_match_finder: ->(project){ project[:distance].zero? }
            )
          end
        end

        # Internal: Search projects with Rubygems API.
        class Rubygems
          API_URL = 'https://rubygems.org/api/v1/search.json'.freeze

          # Internal: Initialize a Searcher::Rubygems.
          #
          # project_name  - The String project name.
          # error_handler - The Proc for errors' handle (default: no-op lambda).
          def initialize(project_name, error_handler: nil)
            @project_name = project_name
            @error_handler = error_handler || ->(_){ }
          end

          # Internal: Search projects with Rubygems API.
          # Returns the Results with found projects.
          def search
            response = Faraday.new.get(API_URL, query: @project_name)

            projects = if response.status == 200
                         JSON.parse(response.body, symbolize_names: true)
                       else
                         []
                       end

            Results.new(
              projects,
              exact_match_finder: ->(project) do
                project[:name].downcase == @project_name.downcase
              end
            )
          rescue Faraday::Error => error
            @error_handler.call(error)
            Results.new([])
          end
        end
      end

      # Public: Search results.
      class Results
        # Public: Integer number of projects to take.
        LIMIT = 15

        # Public: Initialize a Results.
        #
        # found_projects     - Array of objects that respond to [].
        # exact_match_finder - Proc to find exact match, should accept one argument
        #                      (default: no-op lambda).
        def initialize(found_projects, exact_match_finder: nil)
          @found_projects = found_projects.take(LIMIT)
          @exact_match_finder = exact_match_finder || ->(_){ }
        end

        # Public: Find exact match project name.
        # Returns the String project name or nil if no match found.
        def exact_match
          @exact_match ||= (@found_projects.find(&@exact_match_finder) || {})[:name]
        end

        # Public: All found project names.
        #
        # except - Array of Strings of project names or String project name
        #          that should be removed from results
        #          (default: empty Array).
        #
        # Returns an Array of Strings of project names.
        def matches(except: [])
          project_names - Array(except)
        end

        private

        # Internal: Collect project names.
        # Returns an Array of Strings of project names.
        def project_names
          @project_names ||= @found_projects.map { |project| project[:name] }
        end
      end
    end
  end
end
