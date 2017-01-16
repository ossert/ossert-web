web: bundle exec puma -t 4:16 -w 2 -C config/puma.rb -e $RACK_ENV -p $PORT
worker: bundle exec sidekiq -c 2 -r ./config/sidekiq.rb
