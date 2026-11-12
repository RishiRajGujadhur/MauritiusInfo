const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '/MauritiusInfo';

export default {
  output: 'export',
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  experimental: {
    optimizePackageImports: ['@radix-ui/themes', '@radix-ui/react-icons'],
  },
};
