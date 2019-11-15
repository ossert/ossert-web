# coding: utf-8
lib = File.expand_path('../lib', __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)
require 'ossert/web/version'

Gem::Specification.new do |spec|
  spec.name          = "ossert-web"
  spec.version       = Ossert::Web::VERSION
  spec.authors       = ["Sergey Dolganov"]
  spec.email         = ["sclinede@gmail.com"]

  spec.summary       = %q{Ossert project web app}
  spec.description   = %q{Ossert project web app}
  spec.homepage      = "https://bitbucket.org/sclinede/ossert-web"
  spec.license       = "MIT"

  # Prevent pushing this gem to RubyGems.org. To allow pushes either set the 'allowed_push_host'
  # to allow pushing to a single host or delete this section to allow pushing to any host.
  if spec.respond_to?(:metadata)
    spec.metadata['allowed_push_host'] = "TODO: Set to 'http://mygemserver.com'"
  else
    raise "RubyGems 2.0 or newer is required to protect against public gem pushes."
  end

  spec.files         = `git ls-files -z`.split("\x0").reject { |f| f.match(%r{^(test|spec|features)/}) }
  spec.bindir        = "exe"
  spec.executables   = spec.files.grep(%r{^exe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]

  spec.add_runtime_dependency "sinatra"
  spec.add_runtime_dependency "puma"
  spec.add_runtime_dependency "dotenv"
  spec.add_runtime_dependency "sinatra-redis-cache"
  spec.add_runtime_dependency "erubis"
  spec.add_runtime_dependency "slim"
  spec.add_runtime_dependency "sass"
  spec.add_runtime_dependency "rake", "~> 10.0"
  spec.add_runtime_dependency "faraday"
  spec.add_runtime_dependency "pry"

  spec.add_development_dependency "sitemap_generator"
  spec.add_development_dependency "bundler", "~> 2.0.2"
  spec.add_development_dependency "rspec", "~> 3.0"
end
