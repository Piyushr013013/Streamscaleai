import { Github, Linkedin, Twitter, Mail } from "lucide-react";
import { Link } from "react-router";

export function Footer() {
  return (
    <footer className="border-t border-border/30 mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center">
                <svg
                  width="24"
                  height="24"
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
              <span className="text-base font-medium tracking-tight text-foreground">
                Streamscale
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-xs">
              We recruit, build, and test your AI workforce. Real prompts against
              real agents, then we hand back exactly what we found.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="size-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Linkedin className="size-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Twitter className="size-4" />
              </a>
              <a
                href="mailto:hello@streamscale.com"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mail className="size-4" />
              </a>
            </div>
          </div>

          {/* Link Columns */}
          {footerLinks.map((column) => (
            <div key={column.title}>
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-4">
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
        <div className="mt-10 pt-6 border-t border-border/30 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; 2026 Streamscale. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              to="/privacy"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
            <Link
              to="/terms"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

const footerLinks = [
  {
    title: "Service",
    links: [
      { title: "AI Work Diagnostics", href: "/services/ai-work-diagnostics" },
      { title: "Custom Agent Deployment", href: "/services/custom-agent-deployment" },
      { title: "Data Monetization", href: "/services/data-monetization" },
      { title: "Talent & Recruitment", href: "/recruitment" },
    ],
  },
  {
    title: "Industries",
    links: [
      { title: "Software Engineering", href: "/industries/software-engineering" },
      { title: "Legal & Big Law", href: "/industries/legal-big-law" },
      { title: "Medicine & Healthcare", href: "/industries/medicine-healthcare" },
      { title: "Management Consulting", href: "/industries/management-consulting" },
      { title: "Finance & Banking", href: "/industries/finance-banking" },
    ],
  },
  {
    title: "Company",
    links: [
      { title: "About", href: "/about" },
      { title: "Partner with us", href: "/partner" },
      { title: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Resources",
    links: [
      { title: "How it works", href: "#how-it-works" },
      { title: "FAQ", href: "#faq" },
      { title: "Benchmarks", href: "/benchmarks" },
    ],
  },
];
