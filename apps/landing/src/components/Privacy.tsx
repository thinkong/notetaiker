import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

export function Privacy() {
  return (
    <section
      id="privacy"
      className="border-t bg-muted/40 py-12 md:py-24 lg:py-32"
    >
      <div className="container flex flex-col items-center gap-4 text-center">
        <div className="rounded-full bg-primary/10 p-4 text-primary">
          <Lock className="h-10 w-10" />
        </div>
        <h2 className="font-heading text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">
          Your Data stays on Your Device
        </h2>
        <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
          We believe your thoughts are private. notetAIker runs completely
          locally. There are no tracking cookies, no analytics, and no data
          mining. The AI models run on your machine or through API keys you
          control.
        </p>
        <Button variant="outline" className="mt-4" asChild>
          <a
            href="https://github.com/anthropics/claude-code"
            target="_blank"
            rel="noreferrer"
          >
            Review the Code
          </a>
        </Button>
      </div>
    </section>
  );
}
