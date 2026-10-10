/** @type {import("next").NextConfig} */
const nextConfig = {
  devIndicators: false,
  ...(process.env.ANATO_VERIFY_BUILD === "1" ? { distDir: ".next-verify" } : {}),
  async headers() {
    return [{ source: "/(.*)", headers: [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    ] }];
  },
};

export default nextConfig;
