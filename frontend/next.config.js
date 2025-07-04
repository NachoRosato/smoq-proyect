/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración para Node.js en Hostinger
  output: "standalone",
  trailingSlash: true,
  images: {
    domains: [
      "localhost",
      "images.unsplash.com",
      "picsum.photos",
      "via.placeholder.com",
      "placehold.co",
      "loremflickr.com",
      "source.unsplash.com",
    ],
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Configurar archivos estáticos
  async headers() {
    return [
      {
        source: "/assets/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  // Optimizaciones para producción
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
};

module.exports = nextConfig;
