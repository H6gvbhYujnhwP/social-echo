/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  
  async rewrites() {
    return [
      {
        source: '/admin73636',
        destination: '/admin',
      },
      {
        source: '/admin73636/signin',
        destination: '/admin/signin',
      },
      {
        source: '/admin73636/:path*',
        destination: '/admin/:path*',
      },
    ];
  },
}
