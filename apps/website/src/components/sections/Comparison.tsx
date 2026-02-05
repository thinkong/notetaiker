import { Check, X, Minus } from "lucide-react";

type CellValue = "yes" | "no" | "partial" | string;

interface ComparisonRow {
  feature: string;
  notetaiker: CellValue;
  notion: CellValue;
  obsidian: CellValue;
  roam: CellValue;
}

const comparisonData: ComparisonRow[] = [
  {
    feature: "Data Ownership",
    notetaiker: "yes",
    notion: "no",
    obsidian: "yes",
    roam: "no",
  },
  {
    feature: "Local AI Option",
    notetaiker: "yes",
    notion: "no",
    obsidian: "partial",
    roam: "no",
  },
  {
    feature: "Standard Markdown",
    notetaiker: "yes",
    notion: "no",
    obsidian: "yes",
    roam: "no",
  },
  {
    feature: "Sub-100ms Startup",
    notetaiker: "yes",
    notion: "no",
    obsidian: "partial",
    roam: "no",
  },
  {
    feature: "AI Auto-Tagging",
    notetaiker: "yes",
    notion: "partial",
    obsidian: "no",
    roam: "no",
  },
  {
    feature: "Open Source",
    notetaiker: "yes",
    notion: "no",
    obsidian: "no",
    roam: "no",
  },
];

function CellContent({ value }: { value: CellValue }) {
  if (value === "yes") {
    return (
      <span className="flex items-center justify-center">
        <Check className="h-5 w-5 text-green-500" />
      </span>
    );
  }
  if (value === "no") {
    return (
      <span className="flex items-center justify-center">
        <X className="h-5 w-5 text-red-400" />
      </span>
    );
  }
  if (value === "partial") {
    return (
      <span className="flex items-center justify-center">
        <Minus className="h-5 w-5 text-yellow-500" />
      </span>
    );
  }
  return <span className="text-sm text-muted-foreground">{value}</span>;
}

export function Comparison() {
  return (
    <section className="py-20 md:py-28">
      <div className="container">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            How we compare
          </h2>
          <p className="text-lg text-muted-foreground">
            See how notetAIker stacks up against other popular note-taking apps.
          </p>
        </div>

        <div className="mx-auto max-w-4xl overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="py-4 pr-4 text-left font-medium">Feature</th>
                <th className="px-4 py-4 text-center font-medium">
                  <span className="text-primary">notetAIker</span>
                </th>
                <th className="px-4 py-4 text-center font-medium text-muted-foreground">
                  Notion
                </th>
                <th className="px-4 py-4 text-center font-medium text-muted-foreground">
                  Obsidian
                </th>
                <th className="px-4 py-4 text-center font-medium text-muted-foreground">
                  Roam
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((row, index) => (
                <tr
                  key={row.feature}
                  className={
                    index < comparisonData.length - 1 ? "border-b" : ""
                  }
                >
                  <td className="py-4 pr-4 text-sm">{row.feature}</td>
                  <td className="bg-primary/5 px-4 py-4">
                    <CellContent value={row.notetaiker} />
                  </td>
                  <td className="px-4 py-4">
                    <CellContent value={row.notion} />
                  </td>
                  <td className="px-4 py-4">
                    <CellContent value={row.obsidian} />
                  </td>
                  <td className="px-4 py-4">
                    <CellContent value={row.roam} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Comparison based on default configurations.{" "}
          <span className="inline-flex items-center gap-1">
            <Check className="h-3 w-3 text-green-500" /> Yes
          </span>{" "}
          <span className="inline-flex items-center gap-1">
            <Minus className="h-3 w-3 text-yellow-500" /> Partial
          </span>{" "}
          <span className="inline-flex items-center gap-1">
            <X className="h-3 w-3 text-red-400" /> No
          </span>
        </p>
      </div>
    </section>
  );
}
