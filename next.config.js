/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  output: 'standalone',

  // ── TypeORM: ignore optional drivers that don't exist in Next.js ──
  webpack: (config, { isServer }) => {
    if (isServer) {
      // TypeORM tries to import ALL its drivers; we only use Oracle (oracledb).
      // Stub out every driver module TypeORM might try to load that isn't installed.
      config.plugins.push(
        new (require('webpack').IgnorePlugin)({
          resourceRegExp: /^(expo-sqlite|react-native-sqlite-storage|react-native|@sap\/hana-client.*|hdb-pool|mongodb|mysql2|mysql|better-sqlite3|sqlite3|pg-native|pg-query-stream|ioredis|redis|@google-cloud\/spanner|oracledb\/lib\/thin|typeorm-aurora-data-api-driver|sql\.js|cordova-sqlite-storage|NativeScript)$/,
        })
      );
    }
    return config;
  },

  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'zemenbank.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.bankofabyssinia.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'is1-ssl.mzstatic.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'x-next-pathname',
            value: ':path*',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
