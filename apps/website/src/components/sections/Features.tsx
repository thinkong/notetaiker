import {
  Zap,
  FileText,
  Tags,
  ShieldCheck,
  Network,
  Search,
  Command,
  Link2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: Zap,
    title: "Sub-100ms Startup",
    description:
      "Zero friction capture. Open the app and start typing instantly. No loading screens, no delays.",
  },
  {
    icon: FileText,
    title: "Atomic Markdown",
    description:
      "Plain Markdown files you own forever. No proprietary formats, no vendor lock-in.",
  },
  {
    icon: Tags,
    title: "AI Auto-Tagging",
    description:
      "Background AI agents analyze your notes and generate relevant tags automatically. Dismiss or keep suggestions.",
  },
  {
    icon: ShieldCheck,
    title: "Fully Local AI",
    description:
      "All AI processing runs locally on your machine via bundled Ollama. No API keys, no cloud calls, fully offline.",
  },
  {
    icon: Network,
    title: "Semantic Knowledge Graph",
    description:
      "Interactive force-directed graph with DBSCAN clustering, tag filtering, local view, and node pinning.",
  },
  {
    icon: Search,
    title: "Semantic Search",
    description:
      "Vector embeddings power similarity-based discovery. Find related notes and surface hidden connections.",
  },
  {
    icon: Command,
    title: "Command Palette",
    description:
      "Power user tools at your fingertips. Quick actions, search, and keyboard-driven navigation via Cmd+K.",
  },
  {
    icon: Link2,
    title: "Related Notes",
    description:
      "Semantic similarity surfaces connections between your notes. Discover related ideas you didn't know existed.",
  },
];

export function Features() {
  return (
    <section id="features" className="border-t bg-muted/30 py-20 md:py-28">
      <div className="container">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Features built for focus
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to capture and organize thoughts, nothing you
            don't.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="border-0 bg-background shadow-md transition-shadow hover:shadow-lg"
            >
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
