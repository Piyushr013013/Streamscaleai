import { Link, useNavigate } from "react-router";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

const defaultTeam = [
  { _id: "default-ceo", name: "Vivikth Mantha", role: "CEO", bio: "Leading Streamscale's vision and strategy.", linkedin: "", avatarColor: "#10b981", order: 0 },
  { _id: "default-jaiveer", name: "Jaiveer", role: "IT Manager & Board Member", bio: "Oversees technology infrastructure and serves on the board.", linkedin: "", avatarColor: "#1E293B", order: 1 },
  { _id: "default-akash", name: "Akash", role: "Chairman of Board", bio: "Chairman of the board, guiding long-term direction.", linkedin: "", avatarColor: "#3b82f6", order: 2 },
  { _id: "default-piyush", name: "Piyush", role: "CTO", bio: "Builds the agents, benchmarks, and infrastructure.", linkedin: "", avatarColor: "#8b5cf6", order: 3 },
  { _id: "default-zain", name: "Zain", role: "Candidate Outreach", bio: "Finds and connects with strong candidates.", linkedin: "", avatarColor: "#ec4899", order: 4 },
  { _id: "default-roni", name: "Roni", role: "General Demo Leader", bio: "Leads demos of Streamscale's platform.", linkedin: "", avatarColor: "#f59e0b", order: 5 },
  { _id: "default-pranit", name: "Pranit", role: "Client Relations Manager", bio: "Manages relationships with partner companies.", linkedin: "", avatarColor: "#10b981", order: 6 },
  { _id: "default-yuva", name: "Yuva", role: "Recruitment and Demos", bio: "Handles recruitment outreach and runs demos.", linkedin: "", avatarColor: "#06b6d4", order: 7 },
];

function TeamMemberCard({ member }: { member: (typeof defaultTeam)[number] | any }) {
  return (
    <motion.div whileHover={{ y: -4 }} className="h-full">
      <Card className="h-full border-border/40 bg-card/50 transition-all hover:border-primary/30">
        <CardContent className="pt-6 text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full text-2xl font-semibold text-white shadow-md" style={{ backgroundColor: member.avatarColor || "#1E293B" }}>
            {member.name.charAt(0).toUpperCase()}
          </div>
          <h3 className="font-semibold text-foreground">{member.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{member.role}</p>
          {member.email && (
            <a href={`mailto:${member.email}`} className="mt-1 block text-xs text-primary hover:underline">
              {member.email}
            </a>
          )}
          {member.bio && <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-muted-foreground">{member.bio}</p>}
          {member.linkedin && <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs text-primary hover:underline"><ExternalLink className="size-3" /> LinkedIn</a>}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function Team() {
  const navigate = useNavigate();
  const members = useQuery(api.team.getTeamMembers);
  const sortedMembers = members && members.length > 0 ? members : defaultTeam;
  const leadershipTerms = ["CEO", "Board", "Chairman", "CTO", "IT Manager"];
  const isLeadership = (member: any) => leadershipTerms.some((term) => member.role.includes(term));
  const leaders = sortedMembers.filter(isLeadership);
  const operations = sortedMembers.filter((member: any) => !isLeadership(member));

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/30 bg-background/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Button variant="ghost" onClick={() => navigate("/")} className="gap-1"><ArrowLeft className="size-4" /> Back to home</Button>
          <div className="flex items-center gap-2"><div className="flex size-6 items-center justify-center rounded-md bg-slate-800 text-xs font-bold text-white">S</div><span className="text-base font-medium">Streamscale</span></div>
          <Button variant="ghost" asChild><Link to="/login">Sign in</Link></Button>
        </div>
      </header>
      <main className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center"><h1 className="mb-3 text-3xl font-semibold md:text-4xl">The team behind Streamscale</h1><p className="mx-auto max-w-2xl text-lg text-muted-foreground">A focused group running benchmarks, placing candidates, and working directly with every partner.</p></div>
          <section id="leadership" className="mb-16"><h2 className="mb-2 text-xl font-semibold">Leadership</h2><p className="mb-8 text-sm text-muted-foreground">Board, CEO, and executive leadership.</p><div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">{leaders.map((member: any) => <TeamMemberCard key={member._id} member={member} />)}</div></section>
          <section id="operations" className="mb-16"><h2 className="mb-2 text-xl font-semibold">Operations</h2><p className="mb-8 text-sm text-muted-foreground">Outreach, demos, client relations, and recruitment.</p><div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">{operations.map((member: any) => <TeamMemberCard key={member._id} member={member} />)}</div></section>
        </div>
      </main>
    </div>
  );
}
