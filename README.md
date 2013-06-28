Canonical URLs for Meteor
================

This package was inspired by the `force-ssl` package that comes with Meteor. Whereas force-ssl only forwards your site to https if your site visitor goes to http, meteor-canonical will forward to whatever url you want - in particlar, to www.yoursite.com if someone visits just yoursite.com. This is important for your SEO because you don't want your site/content being found at both www and non-www. 

**Note: Unless you pass [additional options](#additional-options), it does nothing locally.**

The difference is that it redirects the user to the site's `ROOT_URL`, if set, should they access the site from any other URL to which it responds.

`ROOT_URL` should follow the format given in the Meteor documentation: for example, `http://example.com` or `https://example.com`.

This means you can get the functionality of `force-ssl` in addition if your `ROOT_URL`'s protocol is `https`.

**This package does nothing if you have no `ROOT_URL` set. If you do, however, it *must* be a fully-qualified URL. If you omit the `http://` or `https://`, it will break your site.**

## Additional options (environment variables)</h2>

Run `meteor` in the following style to use these:

`PACKAGE_CANONICAL_DISABLE=true meteor`

Change the `VARIABLE=value` parts before `meteor` to use different environment variables. You can also set the `ROOT_URL` for Meteor this way. Separate different environment variables with a space.

`PACKAGE_CANONICAL_DISABLE`: Set to `true` to never redirect anyone.

`PACKAGE_CANONICAL_SIMULATE_REMOTE`: Set to `true` if you want to test that the package is working *locally*. You will have to set up another way to access your app; for example, you might edit your `hosts` file. If this variable is set, then `canonical` will redirect to the `ROOT_URL` when you access your local app via the alternate URL. You will also want to set `ROOT_URL` when you run `meteor`, as illustrated above.
