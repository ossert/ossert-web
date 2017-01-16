# config valid only for current version of Capistrano
lock '3.7.0'

set :application, 'ossert'
set :repo_url, 'git@github.com:ossert/ossert-web.git'

 set :ssh_options, {
   forward_agent: true
 }

# Default branch is :master
set :branch, `git rev-parse --abbrev-ref HEAD`.chomp

# Default deploy_to directory is /var/www/my_app_name
set :deploy_to, '/home/ossert/ossert'

# Default value for :format is :airbrussh.
# set :format, :airbrussh

# You can configure the Airbrussh format using :format_options.
# These are the defaults.
# set :format_options, command_output: true, log_file: "log/capistrano.log", color: :auto, truncate: :auto

# Default value for :pty is false
set :pty, true

# Default value for linked_dirs is []
append :linked_dirs, 'log', 'tmp/pids', 'tmp/cache', 'public/system'

# Default value for keep_releases is 5
set :keep_releases, 5

set :scm, :git

set :rbenv_type, :user
set :rbenv_ruby, '2.3.3'

before 'deploy:started',  'sidekiq:quiet'
before 'deploy:starting', 'friday:check'
after  'deploy:restart',  'sidekiq:restart'
after  'deploy:start',    'sidekiq:start'