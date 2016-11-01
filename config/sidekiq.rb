require 'ossert'

SIDEKIQ_REDIS_CONFIGURATION = {
  url: ENV.fetch('REDIS_URL'),
  namespace: 'ossert_sidekiq',
  size: 9
}

Sidekiq.configure_server do |config|
  config.redis = SIDEKIQ_REDIS_CONFIGURATION
  Ossert.init
end

Sidekiq.configure_client do |config|
  config.redis = SIDEKIQ_REDIS_CONFIGURATION
  Ossert.init
end
