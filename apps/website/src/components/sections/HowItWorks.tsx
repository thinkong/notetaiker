import { PenLine, Cpu, Link2, Compass } from "lucide-react";

const steps = [
  {
    icon: PenLine,
    number: "01",
    title: "Capture",
    description:
      "Write anything in Markdown. Notes, ideas, meeting minutes, journal entries. Just start typing.",
  },
  {
    icon: Cpu,
    number: "02",
    title: "Process",
    description:
      "AI agents analyze your notes in the background. Tags, titles, and vector embeddings are generated automatically.",
  },
  {
    icon: Link2,
    number: "03",
    title: "Connect",
    description:
      "Semantic clustering groups related notes using DBSCAN. Your knowledge graph forms itself over time.",
  },
  {
    icon: Compass,
    number: "04",
    title: "Explore",
    description:
      "Navigate your knowledge graph with filtering, local view, and semantic search. Discover connections you didn't know existed.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 md:py-28">
      <div className="container">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            How it works
          </h2>
          <p className="text-lg text-muted-foreground">
            Simple workflow, powerful results. Focus on writing, let AI handle
            the rest.
          </p>
        </div>

        <div className="mx-auto max-w-4xl">
          <div className="relative">
            {/* Connection line */}
            <div className="absolute left-8 top-12 hidden h-[calc(100%-6rem)] w-0.5 bg-gradient-to-b from-primary/50 via-primary/30 to-transparent md:block" />

            <div className="space-y-12">
              {steps.map((step, index) => (
                <div key={step.title} className="relative flex gap-6">
                  {/* Step indicator */}
                  <div className="relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-full border bg-background shadow-sm">
                    <step.icon className="h-7 w-7 text-primary" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-2">
                    <div className="mb-2 flex items-center gap-3">
                      <span className="font-mono text-sm text-primary">
                        {step.number}
                      </span>
                      <h3 className="text-xl font-semibold">{step.title}</h3>
                    </div>
                    <p className="text-muted-foreground">{step.description}</p>

                    {index === 0 && (
                      <div className="mt-4 rounded-lg border bg-muted/50 p-4">
                        <code className="font-mono text-sm">
                          <span className="text-muted-foreground">#</span>{" "}
                          <span className="text-foreground">
                            Quick thought about project architecture...
                          </span>
                        </code>
                      </div>
                    )}

                    {index === 2 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="rounded-md bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-600">
                          Cluster: Architecture
                        </span>
                        <span className="rounded-md bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-600">
                          Cluster: Planning
                        </span>
                        <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                          [[Design Decisions]]
                        </span>
                      </div>
                    )}

                    {index === 3 && (
                      <div className="mt-4 rounded-lg border bg-muted/50 p-4">
                        <div className="flex items-center gap-3 text-sm">
                          <span className="text-muted-foreground">
                            Filter by:
                          </span>
                          <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            #architecture
                          </span>
                          <span className="text-muted-foreground">AND</span>
                          <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            #project
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
