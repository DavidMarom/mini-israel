/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingExcludes: {
    "/api/admin/implement-idea": ["./scripts/**"],
  },
};

export default nextConfig;
