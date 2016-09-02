# config.ru
require 'ossert'
require './lib/ossert/web'

Bundler.require

Ossert::Classifiers.train
run Ossert::Web::App
