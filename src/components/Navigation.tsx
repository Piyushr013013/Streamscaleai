import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, ArrowRight, ChevronRight } from "lucide-react";
import { Link } from "react-router";

const navLinks = [
  {
    title: "How it works",
    items: [
      {
        title: "The process",
        href: "#how-it-works",
        description: "How a benchmark actually runs",
      },
      {
        title: "What we test",
        href: "#industries",
        description: "The industries we cover",
      },
    ],
  },
  {
    title: "Services",
    items: [
      {
        title: "AI Work Diagnostics",
        href: "#enterprise",
        description: "Map what's automatable",
      },
      {
        title: "Custom Agent Deployment",
        href: "#enterprise",
        description: "Build and deploy agents",
      },
      {
        title: "Data Monetization",
        href: "#enterprise",
        description: "Broker your data to labs",
      },
    ],
  },
  {
    title: "Resources",
    items: [
      {
        title: "Benchmarks",
        href: "#industries",
        description: "See pass rates by industry",
      },
      {
        title: "FAQ",
        href: "#faq",
        description: "Common questions",
      },
    ],
  },
];

export function Navigation() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/30 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center">
              <svg
                width="28"
                height="28"
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="64" height="64" rx="14" fill="#1E293B" />
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
                  stroke="#FFFFFF"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span className="text-base font-medium tracking-tight text-foreground">
              Streamscale
            </span>
          </Link>

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              {navLinks.map((linkGroup) => (
                <NavigationMenuItem key={linkGroup.title}>
                  <NavigationMenuTrigger className={navigationMenuTriggerStyle()}>
                    {linkGroup.title}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-1 py-2 px-3">
                      {linkGroup.items.map((item) => (
                        <li key={item.title}>
                          <NavigationMenuLink
                            asChild
                            className="block select-none space-y-1 rounded-md px-3 py-2 text-sm/6 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <Link to={item.href}>
                              <div className="flex flex-col space-y-0.5">
                                <span className="text-sm font-medium">
                                  {item.title}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {item.description}
                                </span>
                              </div>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign In
            </Link>
            <Button
              asChild
              size="sm"
              className="hidden md:inline-flex gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Link to="/book-demo">
                Book a Demo
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>

            {/* Mobile menu button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="md:hidden border-border hover:bg-accent h-8 w-8"
                >
                  <Menu className="size-4" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[320px]">
                <nav className="flex flex-col gap-6 mt-8">
                  {navLinks.map((linkGroup) => (
                    <div key={linkGroup.title}>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                        {linkGroup.title}
                      </h4>
                      <div className="flex flex-col gap-2">
                        {linkGroup.items.map((item) => (
                          <Link
                            key={item.title}
                            to={item.href}
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-between"
                          >
                            <span>{item.title}</span>
                            <ChevronRight className="size-3.5" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div className="pt-6 border-t border-border/30">
                    <Link
                      to="/login"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Sign In
                    </Link>
                    <Button
                      asChild
                      className="mt-2 w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      <Link to="/book-demo">
                        Book a Demo
                        <ArrowRight className="size-3.5" />
                      </Link>
                    </Button>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
