require "bundler/gem_tasks"
require "ossert/rake_tasks"
require "sequel"

Dir.glob('lib/ossert/web/tasks/*.rake').each { |r| import r }
task :default => :spec
