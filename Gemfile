source 'https://rubygems.org'

gem 'decisiontree', github: 'sclinede/decisiontree'
gem 'sawyer', github: 'sclinede/sawyer'
gem 'kmeans-clusterer', github: 'gbuesing/kmeans-clusterer'
gem "ossert", github: 'ossert/ossert', branch: 'feat/metric-charts'
gem 'whenever'

group :development do
  gem 'capistrano'
  gem 'capistrano-ext'
  gem 'capistrano_colors'
  gem 'capistrano-rbenv'
  gem 'capistrano-bundler'
  gem 'capistrano-friday'
end

group :test, :development do
  gem 'vcr'
  gem 'webmock'
  gem 'capybara'
  gem 'poltergeist'
  gem 'capybara-screenshot'
end

# Specify your gem's dependencies in ossert-web.gemspec
gemspec
