/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración para hosting estático
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
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
  // Headers removidos para export estático
  // Optimizaciones para producción
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  async rewrites() {
    return [
      {
        source: "/api/config/:path*",
        destination: "http://localhost:3002/api/config/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
