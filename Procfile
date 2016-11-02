web: bundle exec puma -t 4:16 -w 2 -C config/puma.rb -e $RACK_ENV -p $PORT
worker: GITHUB_TOKEN=$GITHUB_TOKEN bundle exec sidekiq -c 1 -r ./config/sidekiq.rb
worker2: GITHUB_TOKEN=$GITHUB_TOKEN2 bundle exec sidekiq -c 1 -r ./config/sidekiq.rb
