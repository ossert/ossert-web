namespace :deploy do
  desc 'Start application'
  task :start do
    on roles(:app) do
      sudo '/bin/systemctl start ossert'
    end
  end

  desc 'Stop application'
  task :stop do
    on roles(:app) do
      sudo '/bin/systemctl stop ossert'
    end
  end

  desc 'Restart application'
  task :restart do
    on roles(:app) do
      execute 'sudo /bin/systemctl reload ossert || sudo /bin/systemctl start ossert'
    end
  end

  after :publishing, :restart
end
