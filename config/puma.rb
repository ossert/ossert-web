before_fork do
  require 'puma_worker_killer'

  PumaWorkerKiller.config do |config|
    config.ram           = 1024 # mb
    config.frequency     = 5    # seconds
    config.percent_usage = 0.98
    config.rolling_restart_frequency = 1800 # 30 min in seconds
  end
  PumaWorkerKiller.start
end
