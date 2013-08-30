Package.describe({
  summary: "Require this application to use the ROOT_URL if one is set"
});

Package.on_use(function (api) {
  if (typeof api.export !== 'undefined') {
    api.use('webapp', 'server');
  };

  api.use('underscore', 'server');
  // make sure we come after livedata, so we load after the sockjs
  // server has been instantiated.
  api.use('livedata', 'server');

  api.add_files('canonical_server.js', 'server');
});
