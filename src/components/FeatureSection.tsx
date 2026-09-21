import { ArrowRight } from "lucide-react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href?: string;
}

function FeatureCard({ icon, title, description, href }: FeatureCardProps) {
  const content = (
    <div className="group p-6 rounded-xl border border-border/50 bg-card/50 hover:border-primary/20 hover:bg-card transition-all duration-300">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 p-2.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-foreground mb-2">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block">
        {content}
      </a>
    );
  }

  return content;
}

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const coreFeatures: Feature[] = [
  {
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 2L2 7L12 12L22 7L12 2Z"
          fill="currentColor"
          fillOpacity="0.3"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M2 17L12 22L22 17"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M2 12L12 17L22 12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Real-Time Data Streaming",
    description:
      "Process and deliver data in real-time with sub-millisecond latency. Built for high-throughput workloads that demand instant insights.",
  },
  {
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
        <path
          d="M12 6V12L16 14"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "99.99% Uptime SLA",
    description:
      "Industry-leading reliability with automatic failover across multiple regions. Your data streams never stop, even when infrastructure fails.",
  },
  {
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
        <path d="M8 21H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M12 17V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    title: "Edge Computing",
    description:
      "Deploy compute closer to your users and data sources. Reduce latency by processing streams at the edge before they reach your core systems.",
  },
  {
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M4 7V17C4 17.5523 4.44772 18 5 18H19C19.5523 18 20 17.5523 20 17V7C20 6.44772 19.5523 6 19 6H5C4.44772 6 4 6.44772 4 7Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9 11H15M9 14H13"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Developer-First APIs",
    description:
      "Clean, intuitive APIs that developers love. SDKs for all major languages with comprehensive documentation and examples.",
  },
  {
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 8V12M12 16H12.01"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Enterprise Security",
    description:
      "SOC 2 Type II certified with end-to-end encryption, role-based access control, and comprehensive audit logging for compliance.",
  },
  {
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M18 20V10M12 20V4M6 20V14M4 12H20"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Auto-Scaling Infrastructure",
    description:
      "Automatically scale from zero to millions of events per second. Pay only for what you use with transparent, predictable pricing.",
  },
];

const advancedFeatures: Feature[] = [
  {
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M3 3L12 12M21 3L12 12M21 21L12 12M3 21L12 12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="2 2"
        />
        <circle cx="12" cy="12" r="3" fill="currentColor" fillOpacity="0.3" />
      </svg>
    ),
    title: "Stream Analytics",
    description:
      "Built-in analytics and aggregation pipelines. Query, transform, and analyze streaming data in real-time with SQL-like syntax.",
  },
  {
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 2L4 6V12C4 17 7.5 21.5 12 22C16.5 21.5 20 17 20 12V6L12 2Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 12L12 14M12 17L12.01 17"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
    title: "Smart Routing",
    description:
      "Intelligent routing rules that direct your data streams based on content, source, priority, or any custom criteria you define.",
  },
  {
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M9 3L5 6.99H2L12 14.99L9 21.01H5V18.01H12V11.01M9 11.01V18.01M22 3L16 11.01H18V18H21.99L14 12L17.99 3H22Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Multi-Cloud Support",
    description:
      "Deploy across any cloud provider. Avoid vendor lock-in with unified management across AWS, GCP, Azure, and on-premise infrastructure.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold tracking-tight text-foreground mb-6">
            Built for scale.{" "}
            <span className="text-primary">Designed for developers.</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Streamscale provides the infrastructure you need to build, deploy,
            and scale real-time data streaming applications without the
            operational overhead.
          </p>
        </div>

        {/* Core Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {coreFeatures.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>

        {/* Advanced Features */}
        <div className="rounded-2xl border border-border/50 bg-card/30 p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {advancedFeatures.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
