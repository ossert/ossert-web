set :output, "/home/ossert/ossert/current/log/cron_log.log"

job_type :rake, "cd :path && /usr/bin/envdir /home/ossert/ossert/shared/envdir bundle exec rake :task --silent :output"

every 1.hour do
  rake "ossert:cache:reset"
end

every 1.day do
  rake "ossert:refresh_data"
end
