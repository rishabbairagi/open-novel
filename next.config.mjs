/** @type {import('next').NextConfig} */
const nextConfig = {
  // Make sure the markdown content ships with serverless functions (revalidation / ISR).
  outputFileTracingIncludes: { "/**": ["./content/**/*"] },
};
export default nextConfig;
