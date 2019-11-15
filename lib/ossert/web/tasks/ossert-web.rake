task :clear_redis_cache do
  Sinatra::RedisCache::Cache.new.flush
end

Rake::Task["ossert:cache:reset"].enhance do
  Rake::Task[:clear_redis_cache].invoke
end

task :generate_sitemap do
  require 'rubygems'
  require 'sitemap_generator'

  Ossert.init
  SitemapGenerator::Sitemap.default_host = 'http://ossert.evilmartians.io'
  SitemapGenerator::Sitemap.create do
    add '/', :changefreq => 'daily', :priority => 0.9
    Ossert::Project.yield_all do |project|
      add "/#{project.name}", :changefreq => 'weekly'
    end
  end
  SitemapGenerator::Sitemap.ping_search_engines
end

Rake::Task["db:migrate"].enhance do
  Sequel::Migrator.run(DB, File.expand_path('../../../../db/migrate', __dir__), allow_missing_migration_files: true)
  Rake::Task['db:version'].execute
end
