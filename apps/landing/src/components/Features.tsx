import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText, Tag, Shield, Database, Zap, Share2 } from "lucide-react";

const features = [
  {
    title: "Atomic Markdown",
    description:
      "Every note is a single markdown file on your disk. No proprietary databases, no lock-in. You own your data forever.",
    icon: FileText,
  },
  {
    title: "AI Auto-tagging",
    description:
      "Our local AI analyzes your notes as you write, suggesting tags and connections automatically. Keep your knowledge base organized without the manual effort.",
    icon: Tag,
  },
  {
    title: "Local-First & Private",
    description:
      "All processing happens on your device. Your thoughts never leave your computer unless you explicitly share them.",
    icon: Shield,
  },
  {
    title: "Graph View",
    description:
      "Visualize the connections between your ideas. See how your knowledge grows and connects over time.",
    icon: Share2,
  },
  {
    title: "Instant Search",
    description:
      "Lightning fast full-text search across all your notes. Find exactly what you're looking for in milliseconds.",
    icon: Zap,
  },
  {
    title: "Standard Storage",
    description:
      "Notes are stored in a simple folder structure. Use Git to version control your second brain or sync with any cloud provider.",
    icon: Database,
  },
];

export function Features() {
  return (
    <section
      id="features"
      className="container space-y-6 bg-slate-50 py-8 dark:bg-transparent md:py-12 lg:py-24"
    >
      <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
        <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
          Features
        </h2>
        <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
          notetAIker combines the simplicity of Markdown with the power of
          modern AI.
        </p>
      </div>
      <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
        {features.map((feature) => (
          <Card
            key={feature.title}
            className="flex flex-col justify-between border-border/50 bg-background/50 backdrop-blur-sm transition-all hover:border-border hover:bg-background hover:shadow-md"
          >
            <CardHeader>
              <feature.icon className="h-10 w-10 text-primary mb-2" />
              <CardTitle>{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                {feature.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
