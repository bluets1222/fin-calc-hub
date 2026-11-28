import type { MetadataRoute } from "next";
import { LAST_UPDATED } from "@/constants/rates";
import { GUIDES } from "@/data/guides";
import {
  getSubscriptionsData,
  getTopComplexStaticParams,
} from "@/lib/real-estate-data";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticLastMod = new Date(`${LAST_UPDATED}-01T00:00:00+09:00`);

  const [subscriptionsData, topComplexes] = await Promise.all([
    getSubscriptionsData(),
    getTopComplexStaticParams(300),
  ]);

  const dataLastMod = subscriptionsData?.updatedAt
    ? new Date(subscriptionsData.updatedAt)
    : staticLastMod;

  const staticRoutes: Array<{
    path: string;
    lastModified: Date;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
    priority: number;
  }> = [
    { path: "/", lastModified: dataLastMod, changeFrequency: "daily", priority: 1.0 },
    {
      path: "/real-estate/acquisition-tax",
      lastModified: staticLastMod,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      path: "/real-estate/brokerage-fee",
      lastModified: staticLastMod,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      path: "/finance/dsr",
      lastModified: staticLastMod,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      path: "/tax/gift-tax",
      lastModified: staticLastMod,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      path: "/salary/net-pay",
      lastModified: staticLastMod,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      path: "/salary/severance",
      lastModified: staticLastMod,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      path: "/finance/loan-interest",
      lastModified: staticLastMod,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      path: "/finance/savings",
      lastModified: staticLastMod,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      path: "/subscription",
      lastModified: dataLastMod,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      path: "/real-estate",
      lastModified: dataLastMod,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      path: "/guide",
      lastModified: staticLastMod,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      path: "/about",
      lastModified: staticLastMod,
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      path: "/privacy",
      lastModified: staticLastMod,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      path: "/terms",
      lastModified: staticLastMod,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      path: "/contact",
      lastModified: staticLastMod,
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ];

  const guideRoutes: MetadataRoute.Sitemap = GUIDES.map((guide) => ({
    url: `${SITE_URL}/guide/${guide.slug}`,
    lastModified: new Date(guide.updatedAt),
    changeFrequency: "monthly",
    priority: 0.75,
  }));

  const subscriptionRoutes: MetadataRoute.Sitemap = (
    subscriptionsData?.items ?? []
  ).map((sub) => ({
    url: `${SITE_URL}/subscription/${sub.id}`,
    lastModified: dataLastMod,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const complexRoutes: MetadataRoute.Sitemap = topComplexes.map((c) => ({
    url: `${SITE_URL}/real-estate/${encodeURIComponent(c.id)}`,
    lastModified: dataLastMod,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  return [
    ...staticRoutes.map((route) => ({
      url: `${SITE_URL}${route.path}`,
      lastModified: route.lastModified,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...guideRoutes,
    ...subscriptionRoutes,
    ...complexRoutes,
  ];
}
