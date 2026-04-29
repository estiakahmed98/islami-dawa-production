import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ইসলামি দাওয়াহ ইনস্টিটিউট বাংলাদেশ",
    short_name: "ইসলামি দাওয়াহ ইনস্টিটিউট",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      {
        src: "/icons/pwd-logo-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/pwd-logo-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    screenshots: [
      {
        src: "/icons/dashboard-mobile.png",
        sizes: "390x844",
        type: "image/png",
        form_factor: "narrow",
      },
      {
        src: "/icons/dashboard-desktop.png",
        sizes: "1280x720",
        type: "image/png",
        form_factor: "wide",
      },
    ],
  };
}
