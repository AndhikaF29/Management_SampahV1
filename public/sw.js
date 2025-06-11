// Service Worker untuk Aplikasi Manajemen Sampah
// File ini dibuat untuk menghindari error 404 ketika browser mencari service worker

self.addEventListener('install', function (event) {
    console.log('Service Worker installing...');
    // Skip waiting untuk mengaktifkan service worker langsung
    self.skipWaiting();
});

self.addEventListener('activate', function (event) {
    console.log('Service Worker activating...');
    // Claim semua clients yang ada
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function (event) {
    // Untuk saat ini, tidak melakukan apa-apa dengan fetch events
    // Bisa dikembangkan nanti untuk caching strategies
});