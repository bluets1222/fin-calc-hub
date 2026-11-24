import type { MetadataRoute } from "next";
import { GUIDES } from "@/data/guides";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: Array<{
    path: string;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
    priority: number;
  }> = [
    { path: "/", changeFrequency: "weekly", priority: 1.0 },
    {
      path: "/real-estate/acquisition-tax",
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      path: "/real-estate/brokerage-fee",
      changeFrequency: "monthly",
      priority: 0.9,
    },
    { path: "/finance/dsr", changeFrequency: "monthly", priority: 0.9 },
    { path: "/tax/gift-tax", changeFrequency: "monthly", priority: 0.9 },
    { path: "/salary/net-pay", changeFrequency: "monthly", priority: 0.9 },
    { path: "/salary/severance", changeFrequency: "monthly", priority: 0.9 },
    {
      path: "/finance/loan-interest",
      changeFrequency: "monthly",
      priority: 0.9,
    },
    { path: "/finance/savings", changeFrequency: "monthly", priority: 0.9 },
    { path: "/subscription", changeFrequency: "daily", priority: 0.9 },
    { path: "/real-estate", changeFrequency: "daily", priority: 0.9 },
    { path: "/guide", changeFrequency: "weekly", priority: 0.8 },
    { path: "/about", changeFrequency: "yearly", priority: 0.5 },
    { path: "/privacy", changeFrequency: "yearly", priority: 0.4 },
    { path: "/terms", changeFrequency: "yearly", priority: 0.4 },
    { path: "/contact", changeFrequency: "yearly", priority: 0.5 },
  ];

  const guideRoutes: MetadataRoute.Sitemap = GUIDES.map((guide) => ({
    url: `${SITE_URL}/guide/${guide.slug}`,
    lastModified: new Date(guide.updatedAt),
    changeFrequency: "monthly",
    priority: 0.75,
  }));

  return [
    ...staticRoutes.map((route) => ({
      url: `${SITE_URL}${route.path}`,
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...guideRoutes,
  ];
}
