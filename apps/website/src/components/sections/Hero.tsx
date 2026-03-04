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
              <a href="#download">
                Download Now
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
        <div className="mx-auto mt-16 max-w-5xl">
          <div className="overflow-hidden rounded-xl border shadow-2xl">
            <img
              src="/assets/screenshot.png"
              alt="notetAIker desktop application showing the note editor, AI-generated tags, and note history sidebar"
              className="w-full"
              width={1920}
              height={1080}
              loading="eager"
            />
          </div>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            AI generates tags, titles, and semantic connections from your
            content automatically — all running locally on your machine
          </p>
        </div>
      </div>
    </section>
  );
}
