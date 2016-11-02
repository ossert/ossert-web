before_fork do
  require 'puma_worker_killer'

  PumaWorkerKiller.config do |config|
    config.ram           = 1024 # mb
    config.frequency     = 5    # seconds
    config.percent_usage = 0.80
    config.rolling_restart_frequency = 2 * 3600 # 2 hours in seconds
    config.reaper_status_logs = (ENV['PUMA_MEMORY_STATUS'].to_i > 0)
  end
  PumaWorkerKiller.start
end
