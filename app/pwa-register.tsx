"use client";

import { useEffect } from "react";

export default function PwaRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      let hasReloadedForController = false;

      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          registration.update().catch(() => {
            // ignore update check failures
          });

          navigator.serviceWorker.addEventListener("controllerchange", () => {
            if (hasReloadedForController) return;
            hasReloadedForController = true;
            window.location.reload();
          });

          console.log("Service Worker registered");
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });
    }
  }, []);

  return null;
}
