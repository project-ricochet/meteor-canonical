// Based on force-ssl

// Don't do any of this if we don't have a ROOT_URL available to us.
if (process.env.ROOT_URL) {
  // Unfortunately we can't use a connect middleware here since
  // sockjs installs itself prior to all existing listeners
  // (meaning prior to any connect middlewares) so we need to take
  // an approach similar to overshadowListeners in
  // https://github.com/sockjs/sockjs-node/blob/cf820c55af6a9953e16558555a31decea554f70e/src/utils.coffee

  if (typeof WebApp !== 'undefined') {
    var httpServer = WebApp.httpServer;
  } else {
    var httpServer = __meteor_bootstrap__.httpServer;
  };


  var oldHttpServerListeners = httpServer.listeners('request').slice(0);
  httpServer.removeAllListeners('request');
  httpServer.addListener('request', function (req, res) {

    // allow connections if they have been handled w/ ssl already
    // (either by us or by a proxy) OR the connection is entirely over
    // localhost (development mode).
    //
    // Note: someone could trick us into serving over non-ssl by setting
    // x-forwarded-for or x-forwarded-proto. Not much we can do there if
    // we still want to operate behind proxies.

    var remoteAddress =
      req.connection.remoteAddress || req.socket.remoteAddress;
    // Determine if the connection is only over localhost. Both we
    // received it on localhost, and all proxies involved received on
    // localhost.
    var isLocal = ((
      remoteAddress === "127.0.0.1" &&
        (!req.headers['x-forwarded-for'] ||
          _.all(req.headers['x-forwarded-for'].split(','), function (x) {
            return /\s*127\.0\.0\.1\s*/.test(x);
          }))) || process.env.PACKAGE_CANONICAL_DISABLE === "true") && process.env.PACKAGE_CANONICAL_SIMULATE_PRODUCTION !== "true";

    // if we don't have a host header, there's not a lot we can do. We
    // don't know how to redirect them.
    // XXX can we do better here?
    var host = req.headers.host || 'no-host-header';

    // Oh, you think figuring out protocol is straightforward? lol
    // var protocol = req.protocol; // No.

    // Determine if the connection was over SSL at any point. Either we
    // received it as SSL, or a proxy did and translated it for us.
    var isSsl = req.connection.pair ||
      (req.headers['x-forwarded-proto'] &&
        req.headers['x-forwarded-proto'].indexOf('https') !== -1);

    // Pretty naive assumption here (what if it's, I dunno, ftp?), but we don't have much else to go on.
    var protocol = isSsl ? "https" : "http";

    var urlBase = protocol + "://" + host;

    // Determine if the connection was over SSL at any point. Either we
    // received it as SSL, or a proxy did and translated it for us.
    var alreadyCanonical = urlBase === process.env.ROOT_URL;

    if (!isLocal && !alreadyCanonical) {
      // connection is not cool. send a 302 redirect!

      res.writeHead(301, {
        'Location': process.env.ROOT_URL + req.url
      });
      res.end();
      return;
    }

    // connection is OK. Proceed normally.
    var args = arguments;
    _.each(oldHttpServerListeners, function(oldListener) {
      oldListener.apply(httpServer, args);
    });
  });


  // NOTE: this doesn't handle websockets!
  //
  // Websockets come in via the 'upgrade' request. We can override this,
  // however the problem is we're not sure if the websocket is actually
  // encrypted. We don't get x-forwarded-for or x-forwarded-proto on
  // websockets. It's possible the 'sec-websocket-origin' header does
  // what we want, but that's not clear.
  //
  // For now, this package allows raw unencrypted DDP connections over
  // websockets.
}
