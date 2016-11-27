module Ossert
  module Web
    module ProjectsSearch
      def by_name(name)
        ::Project.where('name % ?', name)
                 .select(
                   Sequel.lit('name'),
                   Sequel.lit("name <-> #{::Project.db.literal(name)} as distance"))
                 .order(2)
                 .limit(10)
                 .map(:name)
      end
      module_function :by_name
    end
  end
end
