import { Github, FileText } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-12">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <span className="font-semibold">
              notet<span className="text-primary">AI</span>ker
            </span>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="https://github.com/notetaiker/notetaiker"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <Github className="h-4 w-4" />
              GitHub
            </a>
            <a
              href="https://github.com/notetaiker/notetaiker#readme"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Documentation
            </a>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()}{" "}
            <a
              href="https://blog.a-bba.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 transition-colors hover:text-foreground"
            >
              a-bba.dev
            </a>
            . Open source under MIT License.
          </p>
        </div>
      </div>
    </footer>
  );
}
