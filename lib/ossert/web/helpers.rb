module Ossert
  module Web
    module Helpers
      PUBLIC_PATH = File.join(File.dirname(__FILE__), '..', '..', '..', 'public')
      ASSETS_MAPPING_PATH = File.join(PUBLIC_PATH, 'assets-mapping.json')
      MANIFEST_PATH = File.join(PUBLIC_PATH, 'manifest.json')
      # <%= include_js "shared" %> # => <script type="text/javascript" src="shared-[hash].js" defer></script>
      # <%= include_styles %> # => <link rel="stylesheet" type="text/css" href="styles-[hash].css">

      def include_js(bundle_name)
        "<script type=\"text/javascript\" src=\"/#{js_filename(bundle_name)}\" defer></script>"
      end

      def include_styles
        "<link rel=\"stylesheet\" type=\"text/css\" href=\"/#{styles_filename}\">"
      end

      def js_filename(bundle_name)
        assets.fetch('bundles').fetch(bundle_name)
      end

      def styles_filename
        assets.fetch('css')
      end

      private

      def assets
        @config ||= MultiJson.load(IO.read(ASSETS_MAPPING_PATH))
      end

      def inline_manifest
        return unless File.exist?(MANIFEST_PATH)

        "<script type=\"text/javascript\">window.webpackManifest = #{IO.read(MANIFEST_PATH)};</script>"
      end
    end
  end
end
