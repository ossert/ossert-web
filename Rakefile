require "bundler/gem_tasks"
require "ossert/rake_tasks"

require "bundler"
Bundler.require

require "sinatra"
require 'sinatra/redis-cache'

require "./config/redis_cache"

task :default => :spec

task :clear_redis_cache do
  Sinatra::RedisCache::Cache.new.flush
end

Rake::Task["ossert:cache:reset"].enhance do
  Rake::Task[:clear_redis_cache].invoke
end
