namespace :sidekiq do
  desc 'Sidekiq should stop accepting new tasks.'
  task :quiet do
    on roles(:app) do
      execute "#{fetch(:rbenv_path)}/bin/rbenv exec bundle exec sidekiqctl quiet #{current_path}/tmp/pids/sidekiq-1.pid || true"
    end
  end

  desc 'Start Sidekiq'
  task :start do
    on roles(:app) do
      sudo '/bin/systemctl start ossert-sidekiq-1'
    end
  end

  desc 'Stop Sidekiq'
  task :stop do
    on roles(:app) do
      sudo '/bin/systemctl stop ossert-sidekiq-1'
    end
  end

  desc 'Restart Sidekiq'
  task :restart do
    on roles(:app) do
      sudo '/bin/systemctl restart ossert-sidekiq-1'
    end
  end

  desc 'Force kill Sidekiq'
  task :kill do
    on roles(:app) do
      sudo '/bin/systemctl kill ossert-sidekiq-1'
    end
  end
end