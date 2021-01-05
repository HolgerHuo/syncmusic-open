"use strict";
var workboxVersion = "5.1.3";
importScripts("https://storage.googleapis.com/workbox-cdn/releases/".concat(workboxVersion, "/workbox-sw.js")),
    workbox.core.setCacheNameDetails({ prefix: "radio_669_diange" }),
    workbox.core.skipWaiting(),
    workbox.core.clientsClaim(),
    workbox.precaching.precacheAndRoute([
        { revision: "njkfdbshk2q7e89230jksdvgq31843bh", url: "/index.html" },
        { revision: "66646d5031b167545fbdbfd8d78ae3bq", url: "/static/css/style.css" },
        { revision: "bd9588cf39d38517a31f1q8qqe470aff", url: "/static/css/night.css" },
        { revision: "59323d91008ce611e6ece0707qfqd84d", url: "/static/js/app.js" },
        { revision: "89e0f78ebc6426c8ca88ce0a5dc86a1a", url: "/static/js/theme_auto.js" },
        { revision: "7770c57744ed390f8fe9b61214d83b12", url: "/static/images/avatar.png" },
        { revision: "abbf7d07aac53217336f8bae8d789265", url: "/static/images/apple-touch-icon.png" },
        { revision: "a027656d01b1c4f1aba3217077201d96", url: "/static/images/icon-512x512.png" },
        { revision: "76c320fe79e8ea43468b77a66c872183", url: "/static/images/icon-128x128.png" },
        { revision: "f3654d7e814d32915db082787a419a2e", url: "/static/images/icon-72x72.png" },
    ]),
    workbox.precaching.cleanupOutdatedCaches(),
    workbox.routing.registerRoute(
        /\.(?:png|jpg|jpeg|gif|bmp|webp|svg|ico)$/,
        new workbox.strategies.CacheFirst({
            cacheName: "images",
            plugins: [new workbox.expiration.ExpirationPlugin({ maxEntries: 1e3, maxAgeSeconds: 2592e3 }), new workbox.cacheableResponse.CacheableResponsePlugin({ statuses: [0, 200] })],
        })
    ),
    workbox.routing.registerRoute(
        /\.(?:eot|ttf|woff|woff2)$/,
        new workbox.strategies.CacheFirst({ cacheName: "fonts", plugins: [new workbox.expiration.ExpirationPlugin({ maxEntries: 1e3, maxAgeSeconds: 2592e3 }), new workbox.cacheableResponse.CacheableResponsePlugin({ statuses: [0, 200] })] })
    ),
    workbox.routing.registerRoute(/^https:\/\/fonts\.googleapis\.com/, new workbox.strategies.StaleWhileRevalidate({ cacheName: "google-fonts-stylesheets" })),
    workbox.routing.registerRoute(
        /^https:\/\/fonts\.gstatic\.com/,
        new workbox.strategies.CacheFirst({
            cacheName: "google-fonts-webfonts",
            plugins: [new workbox.expiration.ExpirationPlugin({ maxEntries: 1e3, maxAgeSeconds: 2592e3 }), new workbox.cacheableResponse.CacheableResponsePlugin({ statuses: [0, 200] })],
        })
    ),
    workbox.routing.registerRoute(
        /^https:\/\/cdn\.jsdelivr\.net/,
        new workbox.strategies.CacheFirst({
            cacheName: "static-libs",
            plugins: [new workbox.expiration.ExpirationPlugin({ maxEntries: 1e3, maxAgeSeconds: 2592e3 }), new workbox.cacheableResponse.CacheableResponsePlugin({ statuses: [0, 200] })],
        })
    ),
    workbox.googleAnalytics.initialize();