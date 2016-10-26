# config.ru
require 'ossert'
require './lib/ossert/web'
require './config/sidekiq'

Bundler.require

Ossert::Classifiers.train
run Ossert::Web::App
