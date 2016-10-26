web: bundle exec puma -w 2 -C config/puma.rb -e $RACK_ENV -p $PORT
worker: GITHUB_TOKEN=$GITHUB_TOKEN bundle exec sidekiq -c 6 -r ./config/sidekiq.rb
