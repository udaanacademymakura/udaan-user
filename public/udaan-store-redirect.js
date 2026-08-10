/*
 * Udaan — store fallback for deep links.
 *
 * When the app IS installed, the OS intercepts the URL and this script never
 * runs: Android App Links and iOS Universal Links open the app before the
 * browser loads anything. So if this code executes on a deep-linkable path,
 * the app is almost certainly missing — send the visitor to the store instead
 * of showing them a web page they did not ask for.
 *
 * Host this on BOTH udaanacademy.com.np and app.udaanacademy.com.np.
 * See README.md in this folder for how to include it.
 */
(function () {
  'use strict';

  var IOS_APP_ID = '6745884242';
  var ANDROID_PACKAGE = 'com.udaan.Shaikshik.kendra';

  var APP_STORE_URL = 'https://apps.apple.com/app/id' + IOS_APP_ID;
  var PLAY_STORE_URL =
    'https://play.google.com/store/apps/details?id=' + ANDROID_PACKAGE;

  /*
   * Path prefixes the app can actually open.
   *
   * Keep in sync with the three other lists:
   *   - android/app/src/main/AndroidManifest.xml   (android:pathPrefix)
   *   - well_known/apple-app-site-association      (components)
   *   - lib/core/deeplink/deeplink_navigation.dart (DeepLinkParser.parse)
   *
   * Anything not listed here is an ordinary web page — leave it alone.
   */
  var APP_PATHS = [
    '/auth',
    '/gorkhapatra',
    '/course',
    '/courses',
    '/home',
    '/explore',
    '/package',
    '/my-learning',
    '/downloads',
    '/offline',
    '/test',
    '/tests',
    '/live-class',
    '/notice',
    '/discussion',
    '/support',
    '/daily-quiz',
    '/free-material',
    '/notification',
    '/saved',
    '/search',
    '/calendar',
    '/profile',
    '/contact',
    '/about',
    '/terms',
    '/privacy'
  ];

  var SESSION_KEY = 'udaan_store_redirect';

  function isDeepLinkablePath(pathname) {
    var path = String(pathname || '').toLowerCase();
    for (var i = 0; i < APP_PATHS.length; i++) {
      if (path.indexOf(APP_PATHS[i]) === 0) return true;
    }
    return false;
  }

  function alreadyTried(path) {
    // Redirect at most once per path per session, so a visitor who comes back
    // from the store is not trapped in a loop and can read the web page.
    try {
      if (window.sessionStorage.getItem(SESSION_KEY) === path) return true;
      window.sessionStorage.setItem(SESSION_KEY, path);
    } catch (e) {
      /* private mode / storage disabled — redirecting once is still fine */
    }
    return false;
  }

  function run() {
    // Escape hatch, matching the `no_app=1` exclude rule in the AASA file:
    // https://udaanacademy.com.np/gorkhapatra/14?no_app=1 always stays on web.
    if (/[?&]no_app=1(&|$)/.test(window.location.search)) return;

    if (!isDeepLinkablePath(window.location.pathname)) return;

    var ua = navigator.userAgent || '';
    var isAndroid = /Android/i.test(ua);
    // iPadOS 13+ reports itself as a Mac, so check for touch as well.
    var isIOS =
      /iPad|iPhone|iPod/i.test(ua) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    // Desktop keeps the website. Only mobile has an app to fall back to.
    if (!isAndroid && !isIOS) return;

    if (alreadyTried(window.location.pathname)) return;

    if (isAndroid) {
      /*
       * Android intent URL: Chrome tries to open the app first and, only if it
       * is missing, follows browser_fallback_url to the Play Store. This also
       * rescues the in-app browser case (Facebook/Instagram webviews) where
       * App Link verification never fires, so an installed app still wins.
       */
      var intentUrl =
        'intent://' +
        window.location.host +
        window.location.pathname +
        window.location.search +
        '#Intent;scheme=https;package=' +
        ANDROID_PACKAGE +
        ';S.browser_fallback_url=' +
        encodeURIComponent(PLAY_STORE_URL) +
        ';end';

      window.location.replace(intentUrl);
      return;
    }

    /*
     * iOS has no equivalent of browser_fallback_url, and probing the
     * `udaan://` scheme pops a "Cannot Open Page" alert when the app is
     * absent. Since a Universal Link would already have opened the app,
     * reaching this point means it is not installed — go straight to the
     * App Store.
     */
    window.location.replace(APP_STORE_URL);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
