import { Shield, HardDrive, Wifi, Lock, Container } from "lucide-react";

const privacyFeatures = [
  {
    icon: HardDrive,
    title: "100% Local Storage",
    description:
      "Notes, embeddings, and indexes all stored locally. Nothing leaves your machine.",
  },
  {
    icon: Wifi,
    title: "Offline Capable",
    description:
      "Works completely offline with Ollama for local AI processing.",
  },
  {
    icon: Container,
    title: "Self-Hosted Docker",
    description:
      "Deploy with Docker Compose in one command. Full control over your infrastructure.",
  },
  {
    icon: Lock,
    title: "No Cloud Lock-in",
    description: "Your files, your format. Export or migrate anytime.",
  },
  {
    icon: Shield,
    title: "Zero Tracking",
    description: "No analytics, no telemetry, no data collection whatsoever.",
  },
];

export function Privacy() {
  return (
    <section id="privacy" className="border-t bg-muted/30 py-20 md:py-28">
      <div className="container">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            {/* Content */}
            <div>
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Your notes are <span className="text-primary">truly yours</span>
              </h2>
              <p className="mb-8 text-lg text-muted-foreground">
                notetAIker is built on a simple principle: your data belongs to
                you. We don't host your notes, we don't see your notes, and we
                never will.
              </p>

              <div className="space-y-4">
                {privacyFeatures.map((feature) => (
                  <div key={feature.title} className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual */}
            <div className="relative">
              <div className="rounded-xl border bg-card p-6 shadow-lg">
                <div className="mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-500" />
                  <span className="font-medium text-green-600">
                    Privacy First Architecture
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                    <span className="text-sm">Data Location</span>
                    <span className="font-mono text-sm text-primary">
                      ~/notes/
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                    <span className="text-sm">File Format</span>
                    <span className="font-mono text-sm text-primary">
                      .md (Markdown)
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                    <span className="text-sm">Embeddings</span>
                    <span className="font-mono text-sm text-primary">
                      SQLite (local)
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                    <span className="text-sm">AI Provider</span>
                    <span className="font-mono text-sm text-primary">
                      Ollama (local)
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                    <span className="text-sm">Deployment</span>
                    <span className="font-mono text-sm text-primary">
                      Docker Compose
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                    <span className="text-sm">Cloud Required</span>
                    <span className="font-mono text-sm text-green-600">No</span>
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -right-4 -top-4 -z-10 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
              <div className="absolute -bottom-4 -left-4 -z-10 h-32 w-32 rounded-full bg-primary/5 blur-3xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
