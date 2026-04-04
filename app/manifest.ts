import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Da'e & Dawah",
    short_name: "Da'e & Dawah",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    icons: [
      {
        src: "/PWD Logo 192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/PWD Logo 512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    screenshots: [
      {
        src: "/dashboard-mobile.png",
        sizes: "390x844",
        type: "image/png",
        form_factor: "narrow",
      },
      {
        src: "/dashboard-desktop.png",
        sizes: "1280x720",
        type: "image/png",
        form_factor: "wide",
      },
    ],
  };
}
