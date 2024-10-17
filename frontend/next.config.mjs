/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "http", // Use 'http' if your local server runs on HTTP
        hostname: "localhost",
        port: "3375", // Specify the port if it's not the default
        pathname: "/api/v1/uploads/profilePics/**", // Allow all paths under this
      },
      {
        protocol: "https",
        hostname: "img.freepik.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;
