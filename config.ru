# config.ru
require 'ossert'
require './lib/ossert/web'
require './config/sidekiq'
require './config/redis_cache'

Bundler.require

run Ossert::Web::App
