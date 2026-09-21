import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

function TeamMemberCard({ member, onSelect }: { member: any; onSelect: () => void }) {
  const bgColor = member.avatarColor || "#1E293B";

  return (
    <motion.div whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }} className="cursor-pointer" onClick={onSelect}>
      <Card className="border-border/40 bg-card/50 hover:border-primary/30 transition-all h-full">
        <CardContent className="pt-6 text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full text-white text-2xl font-semibold shadow-md" style={{ backgroundColor: bgColor }}>
            {member.name.charAt(0).toUpperCase()}
          </div>
          <h3 className="font-semibold text-foreground">{member.name}</h3>
          <p className="text-sm text-muted-foreground mt-1">{member.role}</p>
          {member.bio && <p className="text-xs text-muted-foreground mt-3 line-clamp-2 leading-relaxed">{member.bio}</p>}
          {member.linkedin && (
            <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary mt-3 hover:underline">
              <ExternalLink className="size-3" /> LinkedIn
            </a>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function Team() {
  const navigate = useNavigate();
  useAuth(); // Ensure auth context is consumed
  const members = useQuery(api.team.getTeamMembers);
  const [selectedMember, setSelectedMember] = useState<any>(null);

  // Default team data when DB is empty (seeded by initTeam mutation)
  const defaultTeam = [
    { _id: "1", name: "Vivikth Mantha", role: "CEO", bio: "Leading Streamscale's vision and strategy.", linkedin: "", avatarColor: "#10b981", order: 0 },
    { _id: "2", name: "Jaiveer", role: "IT Manager & Board Member", bio: "Oversees technology infrastructure and serves on the board.", linkedin: "", avatarColor: "#1E293B", order: 1 },
    { _id: "3", name: "Akash", role: "Chairman of Board", bio: "Chairman of the board, guiding long-term direction.", linkedin: "", avatarColor: "#3b82f6", order: 2 },
    { _id: "4", name: "Piyush", role: "CTO", bio: "Builds the agents, benchmarks, and infrastructure.", linkedin: "", avatarColor: "#8b5cf6", order: 3 },
    { _id: "5", name: "Zain", role: "Candidate Outreach", bio: "Finds and connects with strong candidates.", linkedin: "", avatarColor: "#ec4899", order: 4 },
    { _id: "6", name: "Roni", role: "General Demo Leader", bio: "Leads demos of Streamscale's platform.", linkedin: "", avatarColor: "#f59e0b", order: 5 },
    { _id: "7", name: "Pranit", role: "Client Relations Manager", bio: "Manages relationships with partner companies.", linkedin: "", avatarColor: "#10b981", order: 6 },
    { _id: "8", name: "Yuva", role: "Recruitment and Demos", bio: "Handles recruitment outreach and runs demos.", linkedin: "", avatarColor: "#06b6d4", order: 7 },
  ];
  const sortedMembers = members && members.length > 0 ? members : defaultTeam;
  const leaders = sortedMembers.filter((m: any) => ["CEO", "Board", "Chairman", "CTO", "IT Manager"].some((r) => m.role.includes(r)));
  const operations = sortedMembers.filter((m: any) => !["CEO", "Board", "Chairman", "CTO", "IT Manager"].some((r) => m.role.includes(r)));

  const handleCardClick = (member: any) => {
    setSelectedMember(member);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/30 bg-background/95 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate("/")} className="gap-1"><ArrowLeft className="size-4" /> Back to home</Button>
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 64 64" fill="none"><rect width="64" height="64" rx="14" fill="#1E293B" /><path d="M14 46L32 20L50 46H14Z" fill="#FFFFFF" /><path d="M32 20L32 52" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" /><path d="M24 30H40" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" /></svg>
              </div>
              <span className="text-base font-medium">Streamscale</span>
            </div>
            <Button variant="ghost" asChild><Link to="/login">Sign in</Link></Button>
          </div>
        </div>
      </header>

      <main className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h1 className="text-3xl md:text-4xl font-semibold mb-3">The team behind Streamscale</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">A small, focused group running benchmarks, placing candidates, and working directly with every partner.</p>
          </div>

          <section id="leadership" className="mb-16">
            <h2 className="text-xl font-semibold mb-2">Leadership</h2>
            <p className="text-sm text-muted-foreground mb-8">Board, CEO, and executive leadership.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {leaders.map((member: any) => <TeamMemberCard key={member._id} member={member} onSelect={() => handleCardClick(member)} />)}
            </div>
          </section>

          <section id="operations" className="mb-16">
            <h2 className="text-xl font-semibold mb-2">Operations</h2>
            <p className="text-sm text-muted-foreground mb-8">Outreach, demos, client relations, and recruitment.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {operations.map((member: any) => <TeamMemberCard key={member._id} member={member} onSelect={() => handleCardClick(member)} />)}
            </div>
          </section>
        </div>
      </main>


    </div>
  );
}
