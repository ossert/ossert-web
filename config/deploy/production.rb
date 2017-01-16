server '95.85.57.30', user: 'ossert', roles: %w{app db web}

set :sidekiq_names, %w(ossert-sidekiq-1 ossert-sidekiq-2)
