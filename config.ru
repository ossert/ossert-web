# config.ru
require 'dotenv'
Dotenv.load('.env.local', '.env')

require 'sequel'
Bundler.require

require 'ossert'
require './lib/ossert/web'
require './config/sidekiq'
require './config/redis_cache'

require "sinatra"
require 'sinatra/redis-cache'

run Ossert::Web::App
