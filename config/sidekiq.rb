require 'ossert'
Ossert.init

SIDEKIQ_REDIS_CONFIGURATION = {
  url: ENV.fetch('REDIS_URL'),
  namespace: 'ossert_sidekiq',
  size: 9
}

Sidekiq.configure_server do |config|
  config.redis = SIDEKIQ_REDIS_CONFIGURATION
end

Sidekiq.configure_client do |config|
  config.redis = SIDEKIQ_REDIS_CONFIGURATION
end
