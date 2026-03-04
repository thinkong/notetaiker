import { ArrowRight, Github, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section
      id="get-started"
      className="relative overflow-hidden border-t bg-muted/30 py-20 md:py-28"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_120%,rgba(99,102,241,0.15),transparent)]" />

      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to take control of your notes?
          </h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Semantic search, knowledge graphs, AI tagging — all running locally
            on your machine. Download the desktop app and join developers,
            researchers, and thinkers who value privacy and productivity.
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
                <Star className="mr-2 h-4 w-4" />
                Star on GitHub
              </a>
            </Button>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Github className="h-4 w-4" />
            <span>Open source under MIT License</span>
          </div>
        </div>
      </div>
    </section>
  );
}
