self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "מיני ישראל";
  const options = {
    body: data.body || "",
    icon: "/favicon/android-chrome-192x192.png",
    badge: "/favicon/favicon-32x32.png",
    dir: "rtl",
    data: { url: data.url || "/" },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(clients.openWindow(url));
});
