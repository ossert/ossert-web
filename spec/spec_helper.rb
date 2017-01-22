$LOAD_PATH.unshift File.expand_path('../../lib', __FILE__)

ENV['TEST'] = '1'

require 'sequel'
require 'ossert'

require 'multi_json'
require 'rspec'
require 'webmock/rspec'
require 'base64'

require 'vcr'
VCR.configure do |c|
  c.configure_rspec_metadata!

  c.filter_sensitive_data('<<GITHUB_TOKEN>>') do
    env_token_for :github
  end

  c.filter_sensitive_data('<<SO_TOKEN>>') do
    env_token_for :so
  end

  c.ignore_request do |request|
    !request.headers['X-Vcr-Test-Repo-Setup'].nil?
  end

  c.default_cassette_options = {
    serialize_with: :json,
    # TODO: Track down UTF-8 issue and remove
    preserve_exact_body_bytes: true,
    decode_compressed_response: true,
    record: ENV['TRAVIS'] ? :none : :once
  }
  c.cassette_library_dir = 'spec/cassettes'
  c.hook_into :webmock
end

TEST_CONFIG_ROOT = File.join(File.dirname(__FILE__), '..', 'tmp', 'config')
DB_URL = ENV.fetch('TEST_DATABASE_URL')

RSpec.configure do |config|
  config.raise_errors_for_deprecations!
  config.before(:suite) do
    FileUtils.mkdir_p(TEST_CONFIG_ROOT)
    FileUtils.cp_r("#{Ossert::Config::CONFIG_ROOT}/.", TEST_CONFIG_ROOT)

    config_root_const = 'CONFIG_ROOT'
    Ossert::Config.send(:remove_const, config_root_const)
    Ossert::Config.const_set(config_root_const, TEST_CONFIG_ROOT)
    Ossert::Config.load(
      :stats, :classifiers_growth, :classifiers_cluster, :translations, :descriptions
    )

    Ossert.init(DB_URL)

    db = Sequel.connect(DB_URL)
    db.run('TRUNCATE TABLE projects;')
    db.run('TRUNCATE TABLE exceptions;')
    db.run('TRUNCATE TABLE classifiers;')

    init_projects

    threads = []
    threads << Thread.new do
      VCR.use_cassette 'fetch_a_project' do
        Ossert::Project.fetch_all(@a_project, 'ClassA')
      end
    end
    threads << Thread.new do
      VCR.use_cassette 'fetch_b_project' do
        Ossert::Project.fetch_all(@b_project, 'ClassB')
      end
    end
    threads << Thread.new do
      VCR.use_cassette 'fetch_c_project' do
        Ossert::Project.fetch_all(@c_project, 'ClassC')
      end
    end
    threads << Thread.new do
      VCR.use_cassette 'fetch_d_project' do
        Ossert::Project.fetch_all(@d_project, 'ClassD')
      end
    end
    threads << Thread.new do
      VCR.use_cassette 'fetch_e_project' do
        Ossert::Project.fetch_all(@e_project, 'ClassE')
      end
    end
    threads.each(&:join)
  end
  config.before(:all) do
    init_projects
  end
  config.after(:suite) do
    db = Sequel.connect(DB_URL)
    db.run('TRUNCATE TABLE projects;')
  end
end

require 'ossert/web'
require 'capybara/rspec'
require 'capybara/poltergeist'
require 'capybara-screenshot/rspec'

Capybara.javascript_driver = :poltergeist
Capybara.app = Ossert::Web::App

def init_projects
  @projects = [
    @a_project = 'multi_json',
    @b_project = 'rake',
    @c_project = 'scientist',
    @d_project = 'dry-web',
    @e_project = 'reifier'
  ]
end

def env_token_for(source)
  ENV.fetch "#{source}_TOKEN".upcase, 'x' * 40
end
