require "bundler/gem_tasks"
require "ossert/rake_tasks"
require "sequel"

require "bundler"
Bundler.require

require "sinatra"
require 'sinatra/redis-cache'

require "./config/redis_cache"

Dir.glob('lib/ossert/web/tasks/*.rake').each { |r| import r }
task :default => :spec
