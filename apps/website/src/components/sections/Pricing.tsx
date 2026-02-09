import { Check, Github, ArrowRight, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Self-Hosted",
    description: "Free & open source forever. Full power, zero cost.",
    price: "Free",
    period: "",
    highlight: false,
    badge: null,
    comingSoon: false,
    cta: "View on GitHub",
    ctaHref: "https://github.com/notetaiker/notetaiker#installation",
    ctaIcon: Github,
    features: [
      "Unlimited local notes",
      "All AI features (bring your own keys)",
      "Semantic search & knowledge graph",
      "Local AI via Ollama",
      "Docker deployment",
      "Community support",
      "MIT License",
    ],
  },
  {
    name: "Sync",
    description: "Seamless cross-device sync with end-to-end encryption.",
    price: "$1.99",
    period: "/mo",
    highlight: false,
    badge: null,
    comingSoon: true,
    cta: "Get Started",
    ctaHref: "#get-started",
    ctaIcon: ArrowRight,
    features: [
      "Everything in Self-Hosted",
      "Cross-device sync (up to 3 devices)",
      "End-to-end encryption",
      "Real-time conflict resolution",
      "1 month version history",
    ],
  },
  {
    name: "Cloud",
    description: "Encrypted cloud backup with generous storage.",
    price: "$3.99",
    period: "/mo",
    highlight: true,
    badge: "Most Popular",
    comingSoon: true,
    cta: "Get Started",
    ctaHref: "#get-started",
    ctaIcon: ArrowRight,
    features: [
      "Everything in Sync",
      "10 GB encrypted cloud backup",
      "Unlimited devices",
      "6 months version history",
      "Priority support",
    ],
  },
  {
    name: "Cloud Pro",
    description: "Maximum storage and early access to new features.",
    price: "$6.99",
    period: "/mo",
    highlight: false,
    badge: null,
    comingSoon: true,
    cta: "Get Started",
    ctaHref: "#get-started",
    ctaIcon: ArrowRight,
    features: [
      "Everything in Cloud",
      "25 GB encrypted cloud backup",
      "1 year version history",
      "Early access to new features",
    ],
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="border-t py-20 md:py-28">
      <div className="container">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Free forever. Pay only for{" "}
            <span className="text-primary">cloud convenience</span>.
          </h2>
          <p className="text-lg text-muted-foreground">
            NoteTAIker is open source and fully functional self-hosted. Optional
            cloud services add sync, backup, and version history — all with
            end-to-end encryption.
          </p>
        </div>

        <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={cn(
                "relative flex flex-col border bg-background shadow-md transition-shadow hover:shadow-lg",
                plan.highlight &&
                  "border-primary shadow-lg ring-1 ring-primary/20",
              )}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge>{plan.badge}</Badge>
                </div>
              )}

              {/* Coming Soon overlay */}
              {plan.comingSoon && (
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-background/60 backdrop-blur-[2px]">
                  <Badge
                    variant="secondary"
                    className="px-4 py-1.5 text-sm font-semibold shadow-md"
                  >
                    Coming Soon
                  </Badge>
                </div>
              )}

              <CardHeader className="pb-4">
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <CardDescription className="min-h-[2.5rem] text-sm">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1">
                <div className="mb-6">
                  <span className="text-4xl font-bold tracking-tight">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-muted-foreground">{plan.period}</span>
                  )}
                </div>

                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span className="text-sm text-muted-foreground">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                {plan.comingSoon ? (
                  <Button className="w-full" variant="outline" disabled>
                    Coming Soon
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    variant={plan.highlight ? "default" : "outline"}
                    asChild
                  >
                    <a
                      href={plan.ctaHref}
                      target={
                        plan.ctaHref.startsWith("http") ? "_blank" : undefined
                      }
                      rel={
                        plan.ctaHref.startsWith("http")
                          ? "noopener noreferrer"
                          : undefined
                      }
                    >
                      {plan.cta}
                      <plan.ctaIcon className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mx-auto mt-12 flex max-w-xl items-center justify-center gap-2 text-center text-sm text-muted-foreground">
          <Shield className="h-4 w-4 shrink-0 text-primary" />
          <span>
            All paid plans include end-to-end encryption. We never see your
            notes. Self-hosted is always free under the MIT License.
          </span>
        </div>
      </div>
    </section>
  );
}
