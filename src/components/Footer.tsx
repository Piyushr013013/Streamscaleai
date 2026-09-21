import { Github, Linkedin, Twitter, Mail } from "lucide-react";
import { Link } from "react-router";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50 mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 64 64"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="64" height="64" rx="14" fill="#09090B" />
                  <path
                    d="M14 46L32 20L50 46H14Z"
                    fill="#FFFFFF"
                  />
                  <path
                    d="M32 20L32 52"
                    stroke="#FFFFFF"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <path
                    d="M24 30H40"
                    stroke="#09090B"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <span className="text-lg font-semibold tracking-tight text-foreground">
                Streamscale
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-xs">
              The platform for building and scaling real-time data streams
              with ease. Power your applications with reliable, fast, and
              scalable infrastructure.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="size-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Linkedin className="size-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Twitter className="size-5" />
              </a>
              <a
                href="mailto:hello@streamscale.com"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mail className="size-5" />
              </a>
            </div>
          </div>

          {/* Link Columns */}
          {footerLinks.map((column) => (
            <div key={column.title}>
              <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
                {column.title}
              </h4>
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.title}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-border/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; 2026 Streamscale. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              to="#privacy"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="#terms"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              to="#cookies"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

const footerLinks = [
  {
    title: "Platform",
    links: [
      { title: "Overview", href: "#overview" },
      { title: "Features", href: "#features" },
      { title: "Integrations", href: "#integrations" },
      { title: "Pricing", href: "#pricing" },
    ],
  },
  {
    title: "Solutions",
    links: [
      { title: "Developers", href: "#developers" },
      { title: "Enterprises", href: "#enterprises" },
      { title: "Startups", href: "#startups" },
    ],
  },
  {
    title: "Resources",
    links: [
      { title: "Documentation", href: "#docs" },
      { title: "API Reference", href: "#api" },
      { title: "Blog", href: "#blog" },
    ],
  },
  {
    title: "Company",
    links: [
      { title: "About", href: "#about" },
      { title: "Careers", href: "#careers" },
      { title: "Contact", href: "#contact" },
      { title: "Legal", href: "#legal" },
    ],
  },
];
