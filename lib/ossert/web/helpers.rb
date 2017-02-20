module Ossert
  module Web
    module Helpers
      CONFIG_PATH = File.join(File.dirname(__FILE__), '..', '..', '..', 'public', 'stats.json')
      # <%= include_js "shared" %> # => <script type="text/javascript" src="shared-[hash].js" defer></script>
      # <%= include_styles %> # => <link rel="stylesheet" type="text/css" href="styles-[hash].css">

      def include_js(bundle_name)
        "<script type=\"text/javascript\" src=\"#{js_filename(bundle_name)}\" defer></script>"
      end

      def include_styles
        "<link rel=\"stylesheet\" type=\"text/css\" href=\"#{styles_filename}\">"
      end

      def js_filename(bundle_name)
        config.fetch('bundles').fetch(bundle_name)
      end

      def styles_filename
        config.fetch('css')
      end

      private

      def config
        @config ||= MultiJson.load(IO.read(CONFIG_PATH))
      end
    end
  end
end
