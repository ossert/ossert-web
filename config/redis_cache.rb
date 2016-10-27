Sinatra::RedisCache::Config.config do
  redis_conn      Redis.new(:url => ENV.fetch('REDIS_URL'))
  namespace       'sinatra_cache'
  default_expires 3600
  lock_timeout    1
  environments    [:production]
  logger          Logger.new(STDERR)
end
