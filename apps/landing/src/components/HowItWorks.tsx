import { Badge } from "@/components/ui/badge";

const steps = [
  {
    step: "01",
    title: "Capture",
    description:
      "Write your thoughts in standard Markdown. Use the editor to quickly jot down ideas, meeting notes, or daily journals.",
  },
  {
    step: "02",
    title: "Analyze",
    description:
      "The local AI engine runs in the background. It reads your note, understands the context, and extracts key concepts.",
  },
  {
    step: "03",
    title: "Connect",
    description:
      "Tags and links are automatically suggested. Accept them to weave your new note into your existing knowledge graph instantly.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="container py-8 md:py-12 lg:py-24">
      <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
        <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
          How it Works
        </h2>
        <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
          A seamless workflow designed to keep you in the flow state.
        </p>
      </div>
      <div className="mx-auto grid max-w-5xl items-center gap-10 py-12 md:grid-cols-3 lg:gap-12">
        {steps.map((item) => (
          <div
            key={item.step}
            className="flex flex-col items-center text-center md:items-start md:text-left"
          >
            <Badge
              variant="outline"
              className="mb-4 h-10 w-10 items-center justify-center rounded-full text-lg font-bold border-primary/20 bg-primary/5 text-primary"
            >
              {item.step}
            </Badge>
            <h3 className="text-xl font-bold">{item.title}</h3>
            <p className="mt-2 text-muted-foreground">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
