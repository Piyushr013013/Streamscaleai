import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, Trash2, ExternalLink, User, Edit2 } from "lucide-react";
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

function MemberDetailDialog({ member, onClose, onUpdate }: { member: any; onClose: () => void; onUpdate: (data: any) => void }) {
  const [name, setName] = useState(member.name);
  const [role, setRole] = useState(member.role);
  const [bio, setBio] = useState(member.bio || "");
  const [linkedin, setLinkedin] = useState(member.linkedin || "");
  const [avatarColor, setAvatarColor] = useState(member.avatarColor || "#1E293B");
  const [updating, setUpdating] = useState(false);
  const { userId } = useAuth();
  const updateMutation = useMutation(api.team.updateTeamMember);

  const handleSave = async () => {
    setUpdating(true);
    try {
      await updateMutation({ memberId: member._id, name, role, bio: bio || undefined, linkedin: linkedin || undefined, avatarColor: avatarColor || undefined, updatedBy: userId as any });
      onUpdate({ name, role, bio, linkedin, avatarColor });
      onClose();
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><User className="size-4" /> Edit {member.name}</CardTitle>
          <CardDescription>Update this team member's details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2"><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="space-y-2"><Label>Role</Label><Input value={role} onChange={(e) => setRole(e.target.value)} /></div>
          <div className="space-y-2"><Label>Bio <span className="text-muted-foreground text-xs font-normal">(optional)</span></Label><Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} placeholder="Brief background..." /></div>
          <div className="space-y-2"><Label>LinkedIn URL <span className="text-muted-foreground text-xs font-normal">(optional)</span></Label><Input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/..." /></div>
          <div className="space-y-2"><Label>Avatar color</Label><div className="flex gap-2 flex-wrap">{["#1E293B","#3b82f6","#8b5cf6","#ec4899","#f59e0b","#10b981","#06b6d4","#f43f5e"].map((c) => (<button key={c} onClick={() => setAvatarColor(c)} className={`w-8 h-8 rounded-full border-2 transition-transform ${avatarColor === c ? "border-white scale-110" : "border-transparent"}`} style={{ backgroundColor: c }} />))}</div></div>
          <div className="flex gap-2 pt-2"><Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button><Button onClick={handleSave} disabled={updating} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">{updating ? "Saving..." : "Save changes"}</Button></div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Team() {
  const navigate = useNavigate();
  const { userId, role, isAuthenticated } = useAuth();
  const isAdmin = Boolean(isAuthenticated && role === "admin");
  const members = useQuery(api.team.getTeamMembers);
  const addMember = useMutation(api.team.addTeamMember);
  const deleteMember = useMutation(api.team.deleteTeamMember);

  const [viewingMember, setViewingMember] = useState<any>(null);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [message, setMessage] = useState("");

  const [newMember, setNewMember] = useState({ name: "", role: "", bio: "", linkedin: "", avatarColor: "#1E293B", order: 0 });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addMember({ ...newMember, addedBy: userId as any });
      setMessage(`${newMember.name} added to the team.`);
      setNewMember({ name: "", role: "", bio: "", linkedin: "", avatarColor: "#1E293B", order: 0 });
      setShowAddForm(false);
    } catch (err) { setMessage(err instanceof Error ? err.message : "Failed to add member."); }
  };

  const handleDelete = async (member: any) => {
    if (!window.confirm(`Remove ${member.name} from the team?`)) return;
    try {
      await deleteMember({ memberId: member._id, deletedBy: userId as any });
      setMessage(`${member.name} removed.`);
    } catch (err) { setMessage(err instanceof Error ? err.message : "Failed to remove member."); }
  };

  const handleMemberUpdate = (data: any) => { setMessage(`${data.name} updated.`); setViewingMember(null); setEditingMember(null); };

  const sortedMembers = members ?? [];
  const leaders = sortedMembers.filter((m: any) => ["CEO", "Board", "Chairman", "CTO", "IT Manager"].some((r) => m.role.includes(r)));
  const operations = sortedMembers.filter((m: any) => !["CEO", "Board", "Chairman", "CTO", "IT Manager"].some((r) => m.role.includes(r)));

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

          {message && <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">{message}</div>}

          <section id="leadership" className="mb-16">
            <h2 className="text-xl font-semibold mb-2">Leadership</h2>
            <p className="text-sm text-muted-foreground mb-8">Board, CEO, and executive leadership.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {leaders.map((member: any) => <TeamMemberCard key={member._id} member={member} onSelect={() => setViewingMember(member)} />)}
            </div>
          </section>

          <section id="operations" className="mb-16">
            <h2 className="text-xl font-semibold mb-2">Operations</h2>
            <p className="text-sm text-muted-foreground mb-8">Outreach, demos, client relations, and recruitment.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {operations.map((member: any) => <TeamMemberCard key={member._id} member={member} onSelect={() => setViewingMember(member)} />)}
            </div>
          </section>

          {isAdmin && (
            <Card className="mb-8 border-primary/30 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Plus className="size-4" /> {showAddForm ? "Add team member" : "Add a team member"}</CardTitle>
                <CardDescription>Only admins can add or remove people from the team.</CardDescription>
              </CardHeader>
              <CardContent>
                {showAddForm ? (
                  <form onSubmit={handleAdd} className="grid gap-4 max-w-lg">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1"><Label>Name</Label><Input value={newMember.name} onChange={(e) => setNewMember({ ...newMember, name: e.target.value })} required /></div>
                      <div className="space-y-1"><Label>Role</Label><Input value={newMember.role} onChange={(e) => setNewMember({ ...newMember, role: e.target.value })} required /></div>
                    </div>
                    <div className="space-y-1"><Label>Bio <span className="text-muted-foreground text-xs font-normal">(optional)</span></Label><Textarea value={newMember.bio} onChange={(e) => setNewMember({ ...newMember, bio: e.target.value })} rows={2} /></div>
                    <div className="space-y-1"><Label>LinkedIn URL <span className="text-muted-foreground text-xs font-normal">(optional)</span></Label><Input value={newMember.linkedin} onChange={(e) => setNewMember({ ...newMember, linkedin: e.target.value })} /></div>
                    <div className="flex gap-2"><Button type="button" variant="outline" onClick={() => setShowAddForm(false)} className="flex-1">Cancel</Button><Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">Add member</Button></div>
                  </form>
                ) : (
                  <Button onClick={() => setShowAddForm(true)} className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"><Plus className="size-4" /> Add team member</Button>
                )}
              </CardContent>
            </Card>
          )}

          {isAdmin && members && members.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Manage team</CardTitle><CardDescription>Edit details or remove members. Changes appear on the public team page.</CardDescription></CardHeader>
              <CardContent className="space-y-3">
                {members.map((member: any) => (
                  <div key={member._id} className="flex items-center justify-between rounded-lg border border-border/30 p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-full text-white text-sm font-semibold" style={{ backgroundColor: member.avatarColor || "#1E293B" }}>{member.name.charAt(0)}</div>
                      <div><p className="font-medium">{member.name}</p><p className="text-sm text-muted-foreground">{member.role}</p></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setEditingMember(member)} className="gap-1"><Edit2 className="size-3.5" /> Edit</Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(member)} className="gap-1 text-red-600 hover:bg-red-50"><Trash2 className="size-3.5" /> Remove</Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {viewingMember && <MemberDetailDialog member={viewingMember} onClose={() => setViewingMember(null)} onUpdate={handleMemberUpdate} />}
      {editingMember && <MemberDetailDialog member={editingMember} onClose={() => setEditingMember(null)} onUpdate={handleMemberUpdate} />}
    </div>
  );
}
