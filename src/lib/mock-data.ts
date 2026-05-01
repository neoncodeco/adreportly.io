// Mock data used until Facebook OAuth is wired and a Facebook App is configured.
// Mirrors the shape returned by the Graph API.

export const mockSpendTrend = Array.from({ length: 30 }, (_, i) => {
  const day = new Date();
  day.setDate(day.getDate() - (29 - i));
  const seed = Math.sin(i * 1.7) * 0.5 + 0.5;
  return {
    date: day.toISOString().slice(0, 10),
    label: day.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    spend: Math.round(8000 + seed * 18000 + Math.random() * 4000),
    results: Math.round(4000 + seed * 14000 + Math.random() * 3000),
  };
});

export const mockTopCampaigns = [
  {
    id: "c1",
    code: "C",
    name: "Conversions – Eid Sale 2024",
    spend: 147073,
    color: "primary" as const,
  },
  {
    id: "c2",
    code: "B",
    name: "Brand Awareness – Winter Collection",
    spend: 137070,
    color: "muted" as const,
  },
  {
    id: "c3",
    code: "L",
    name: "Lead Generation – Contact Form",
    spend: 129747,
    color: "dark" as const,
  },
];

export const mockRecentCampaigns = [
  {
    id: "1",
    code: "C",
    name: "Conversions – Eid Sale 2024",
    accounts: 2,
    spend: 147072.87,
    results: 801,
    roas: 6.55,
    status: "active" as const,
  },
  {
    id: "2",
    code: "B",
    name: "Brand Awareness – Winter Collection",
    accounts: 1,
    spend: 137070.37,
    results: 874,
    roas: 6.02,
    status: "active" as const,
  },
  {
    id: "3",
    code: "L",
    name: "Lead Generation – Contact Form",
    accounts: 3,
    spend: 129747.04,
    results: 936,
    roas: 5.78,
    status: "paused" as const,
  },
  {
    id: "4",
    code: "T",
    name: "Traffic – Blog Promotion",
    accounts: 1,
    spend: 48230.5,
    results: 2104,
    roas: 3.42,
    status: "active" as const,
  },
  {
    id: "5",
    code: "V",
    name: "Video Views – Product Launch",
    accounts: 2,
    spend: 92110.2,
    results: 18453,
    roas: 4.18,
    status: "completed" as const,
  },
];

export const mockClients = [
  {
    id: "client-1",
    initials: "FA",
    name: "Fashion House BD",
    organization: "Fashion House Limited",
    email: "client@fashionhouse.bd",
    accounts: 1,
    status: "active" as const,
    last_login: null as string | null,
  },
  {
    id: "client-2",
    initials: "TE",
    name: "Tech Store BD",
    organization: "Tech Store Bangladesh",
    email: "client@techstore.bd",
    accounts: 1,
    status: "active" as const,
    last_login: null as string | null,
  },
];

export const totalSpend = mockSpendTrend.reduce((s, d) => s + d.spend, 0);
