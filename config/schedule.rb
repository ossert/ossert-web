set :output, "/home/ossert/ossert/current/log/cron_log.log"

every 10.minutes do
  rake "ossert:cache:reset"
end

every 1.day do
  rake "ossert:refresh_data"
end
