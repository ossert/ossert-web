module.exports.assetsTransform = data => JSON.stringify(Object.keys(data.assetsByChunkName).reduce((result, bundle) => {
  const bundleChunks = Array.isArray(data.assetsByChunkName[bundle])
    ? data.assetsByChunkName[bundle]
    : [data.assetsByChunkName[bundle]];

  const jsAssets = bundleChunks.filter(filterByExt('js'));
  const cssAssets = bundleChunks.filter(filterByExt('css'));

  if (jsAssets.length) {
    result.bundles[bundle] = jsAssets[0];
  }

  if (cssAssets.length) {
    result.css = cssAssets[0];
  }

  return result;
}, { bundles: {}, css: null }));


function filterByExt(ext) {
  return value => (new RegExp(`\\.${ext}$`)).test(value);
}
