import type { MetadataRoute } from "next";

/**
 * Parents should find the admissions page. Nobody should find the staff
 * sign-in, the dashboard, the health check, or the agent API.
 */
export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://alnoor-school-admissions.vercel.app";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/login", "/dashboard", "/health", "/api/"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
