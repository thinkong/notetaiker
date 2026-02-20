import { ArrowRight, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Hero() {
  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.15),transparent)]" />

      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="secondary" className="mb-6">
            Open Source &middot; Local-First &middot; Privacy-Focused
          </Badge>

          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Capture thoughts.
            <br />
            <span className="text-primary">Let AI organize.</span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground md:text-xl">
            Zero-friction note-taking with local-first AI. Write in Markdown,
            let intelligent agents auto-tag, cluster, and connect your ideas.
            Your data stays on your machine.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild>
              <a href="#get-started">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a
                href="https://github.com/thinkong/notetaiker"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="mr-2 h-4 w-4" />
                View on GitHub
              </a>
            </Button>
          </div>
        </div>

        {/* App Preview */}
        <div className="mx-auto mt-16 max-w-4xl">
          <div className="overflow-hidden rounded-xl border bg-card shadow-2xl">
            <div className="flex items-center gap-2 border-b bg-muted/50 px-4 py-3">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <div className="h-3 w-3 rounded-full bg-green-500" />
              </div>
              <span className="ml-2 text-sm text-muted-foreground">
                notetAIker
              </span>
            </div>
            <div className="p-6">
              <pre className="font-mono text-sm">
                <code className="text-muted-foreground">---</code>
                {"\n"}
                <code className="text-primary">title:</code>
                <code className="text-muted-foreground">
                  {" "}
                  Product Roadmap Meeting
                </code>
                {"\n"}
                <code className="text-primary">tags:</code>
                <code className="text-muted-foreground">
                  {" "}
                  [meeting, product]
                </code>
                {"\n"}
                <code className="text-primary">ai_tags:</code>
                <code className="text-muted-foreground">
                  {" "}
                  [Q1-planning, roadmap, strategy]
                </code>
                {"\n"}
                <code className="text-primary">createdAt:</code>
                <code className="text-muted-foreground"> 2026-02-09</code>
                {"\n"}
                <code className="text-muted-foreground">---</code>
                {"\n\n"}
                <code className="font-bold text-foreground">
                  # Product Roadmap Meeting
                </code>
                {"\n\n"}
                <code className="text-muted-foreground">
                  Discussed priorities for Q1 with the team...
                </code>
                {"\n"}
                <code className="text-muted-foreground">
                  - Feature X: High priority
                </code>
                {"\n"}
                <code className="text-muted-foreground">
                  - Bug fixes: Ongoing
                </code>
                {"\n"}
                <code className="text-muted-foreground">
                  - User research: [[Sarah]] to lead
                </code>
              </pre>
            </div>
          </div>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            AI generates tags, titles, and semantic connections from your
            content automatically
          </p>
        </div>
      </div>
    </section>
  );
}
