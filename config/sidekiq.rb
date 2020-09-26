# frozen_string_literal: true
require 'ossert'
require 'dotenv'
Dotenv.load('.env.local', '.env')


SIDEKIQ_REDIS_CONFIGURATION = {
  url: ENV.fetch('REDIS_URL'),
  namespace: 'ossert_sidekiq'
}

Sidekiq.configure_server do |config|
  config.redis = SIDEKIQ_REDIS_CONFIGURATION
end

Sidekiq.configure_client do |config|
  config.redis = SIDEKIQ_REDIS_CONFIGURATION
end
