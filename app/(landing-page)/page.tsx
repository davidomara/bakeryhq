import { FeatureGrid } from "@/components/features";
import { Hero } from "@/components/hero";
import { PricingGrid } from "@/components/pricing";
import { stackServerApp } from "@/stack";
import {
  CakeSlice,
  Calculator,
  ClipboardCheck,
  FileSpreadsheet,
  LineChart,
  Users,
} from "lucide-react";

export default async function IndexPage() {
  const project = await stackServerApp.getProject();
  if (!project.config.clientTeamCreationEnabled) {
    return (
      <div className="w-full min-h-96 flex items-center justify-center">
        <div className="max-w-xl gap-4">
          <p className="font-bold text-xl">Setup Required</p>
          <p className="">
            {
              "To start using this project, please enable client-side team creation in the Stack Auth dashboard (Project > Team Settings). This message will disappear once the feature is enabled."
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Hero
        capsuleText="Bake smarter. Price with confidence."
        capsuleLink="/#features"
        title="Bakery costing that turns recipes into profit"
        subtitle="Build accurate ingredient costs, price products and wedding cakes, and track monthly profit in one clean workspace."
        primaryCtaText="Start free"
        primaryCtaLink={stackServerApp.urls.signUp}
        secondaryCtaText="See how it works"
        secondaryCtaLink="/#pricing"
      />

      <div id="features" />
      <FeatureGrid
        title="Purpose-built for bakery costing"
        subtitle="Everything you need to price confidently and keep margins healthy."
        items={[
          {
            icon: <Calculator className="h-12 w-12" />,
            title: "Accurate ingredient costing",
            description: "Normalize units, track packaging and labor, and see real unit costs.",
          },
          {
            icon: <ClipboardCheck className="h-12 w-12" />,
            title: "Pricing recommendations",
            description: "Markup, target profit, and margin tools with auto‑recommended pricing.",
          },
          {
            icon: <CakeSlice className="h-12 w-12" />,
            title: "Wedding cake quotes",
            description: "Multi‑tier costing with add‑ons and print‑ready client quotes.",
          },
          {
            icon: <LineChart className="h-12 w-12" />,
            title: "Monthly profit view",
            description: "Track revenue, COGS, and margin per month and channel.",
          },
          {
            icon: <FileSpreadsheet className="h-12 w-12" />,
            title: "Export to Excel",
            description: "Share costing sheets and summaries with one‑click exports.",
          },
          {
            icon: <Users className="h-12 w-12" />,
            title: "Teams & roles",
            description: "Invite staff and keep pricing work organized by team.",
          },
        ]}
      />

      <div id="pricing" />
      <PricingGrid
        title="Simple pricing"
        subtitle="Start free and upgrade when you need more coverage."
        items={[
          {
            title: "Starter",
            price: "Free",
            description: "For home bakers and new shops.",
            features: [
              "Product costing templates",
              "Basic pricing guidance",
              "Wedding cake quotes",
              "Export to Excel",
            ],
            buttonText: "Start free",
            buttonHref: stackServerApp.urls.signUp,
          },
          {
            title: "Growth",
            price: "UGX 29,000",
            description: "For growing bakeries and teams.",
            features: [
              "Team workspaces",
              "Sales & profit summary",
              "Custom pricing defaults",
              "Priority support",
            ],
            buttonText: "Upgrade to Growth",
            isPopular: true,
            buttonHref: stackServerApp.urls.signUp,
          },
          {
            title: "Studio",
            price: "Custom",
            description: "For multi‑location bakeries.",
            features: [
              "Multiple teams",
              "Advanced reporting",
              "Dedicated onboarding",
              "Custom integrations",
            ],
            buttonText: "Talk to sales",
            buttonHref: stackServerApp.urls.signUp,
          },
        ]}
      />
    </>
  );
}
