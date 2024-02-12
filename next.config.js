/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'firebasestorage.googleapis.com',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: 'tailwindui.com',
            },
            {
                protocol: 'https',
                hostname: 'raw.githubusercontent.com',
                // port: '',
                // pathname: '/imsoft/The-Gaming-Corps-Blog/main/images/**',
              },
        ],
    }
}

module.exports = nextConfig
