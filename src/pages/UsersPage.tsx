import { useState, useEffect } from "react";
import { Plus, Eye, Pencil, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import { toast } from "sonner";

interface User {
  id: string; // Supabase auth user IDs are strings (UUID)
  nom: string;
  prenom: string;
  email: string;
  role: "admin" | "admin_junior"; // Updated to match SQL schema
  actif: boolean;
  telephone?: string;
  adresse?: string;
  date_creation?: string;
}

const roleBadge = (role: string) => {
  const map: Record<string, string> = {
    admin: "bg-primary/10 text-primary",
    admin_junior: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300", // New style for admin_junior
  };
  return map[role] || "";
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const emptyUser: Partial<User> = { 
    nom: "", 
    prenom: "", 
    email: "", 
    mot_de_passe: "", // For creation
    role: "admin", 
    actif: true 
  };
  const [currentUser, setCurrentUser] = useState<Partial<User>>(emptyUser);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch users from our custom 'utilisateurs' table
      const { data, error } = await supabase
        .from("utilisateurs")
        .select("*")
        .order("nom", { ascending: true }); // Order by nom for better display
      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      toast.error("Erreur lors du chargement des utilisateurs: " + error.message);
      console.error("Supabase Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentUser.nom || !currentUser.prenom || !currentUser.email || !currentUser.role) {
      toast.error("Veuillez remplir les champs obligatoires (Nom, Prénom, Email, Rôle)");
      return;
    }

    setIsSubmitting(true);
    try {
      if (currentUser.id) {
        // --- Edition d'un utilisateur existant ---
        // 1. Mettre à jour notre table 'utilisateurs'
        const { error: dbError } = await supabase
          .from("utilisateurs")
          .update({
            nom: currentUser.nom,
            prenom: currentUser.prenom,
            email: currentUser.email,
            role: currentUser.role,
            actif: currentUser.actif,
            telephone: currentUser.telephone,
            adresse: currentUser.adresse,
          })
          .eq("id", currentUser.id);
        if (dbError) throw dbError;

        // 2. Mettre à jour l'email dans Supabase Auth si modifié
        // NOTE: supabase.auth.admin.updateUserById requires a Service Role Key.
        // If not configured, this will fail with RLS errors.
        const originalUser = users.find(u => u.id === currentUser.id);
        if (originalUser && originalUser.email !== currentUser.email) {
          const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
            currentUser.id,
            { email: currentUser.email }
          );
          if (authError) {
            console.warn("Could not update user email in Supabase Auth:", authError.message);
            toast.warning("Email utilisateur mis à jour dans la base de données, mais pas dans Supabase Auth (permissions?)");
          }
        }
        
        toast.success("Utilisateur mis à jour");

      } else {
        // --- Création d'un nouvel utilisateur ---
        if (!currentUser.mot_de_passe || currentUser.mot_de_passe.length < 6) {
          toast.error("Le mot de passe est obligatoire et doit contenir au moins 6 caractères.");
          return;
        }

        // 1. Créer l'utilisateur dans Supabase Auth
        // NOTE: supabase.auth.admin.createUser requires a Service Role Key.
        // If not configured, this will fail with RLS errors.
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: currentUser.email,
          password: currentUser.mot_de_passe,
          email_confirm: true, // Auto-confirm email
        });

        if (authError) throw authError;
        if (!authUser?.user?.id) throw new Error("Supabase Auth user ID not returned.");

        // 2. Insérer les détails dans notre table 'utilisateurs'
        const { error: dbError } = await supabase.from("utilisateurs").insert([{
          id: authUser.user.id, // Use the ID from Supabase Auth
          nom: currentUser.nom,
          prenom: currentUser.prenom,
          email: currentUser.email,
          role: currentUser.role,
          actif: currentUser.actif,
          telephone: currentUser.telephone,
          adresse: currentUser.adresse,
        }]);
        if (dbError) throw dbError;
        
        toast.success("Utilisateur créé avec succès");
      }

      setIsDialogOpen(false);
      fetchUsers(); // Refresh data
    } catch (error: any) {
      console.error("Supabase Operation Error:", error);
      toast.error("Erreur: " + error.message + (error.status === 401 ? " (Vérifiez les permissions ou la clé de service Supabase)" : ""));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible et supprimera l'utilisateur de l'authentification Supabase et de la base de données.")) return;

    setIsSubmitting(true);
    try {
      // 1. Supprimer l'utilisateur de Supabase Auth
      // NOTE: supabase.auth.admin.deleteUser requires a Service Role Key.
      // If not configured, this will fail with RLS errors.
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
      // We don't throw error if user not found in auth, as they might have been deleted manually
      if (authError && authError.message !== "User not found") {
        console.warn("Could not delete user from Supabase Auth:", authError.message);
        toast.warning("Utilisateur supprimé de la base de données, mais pas de Supabase Auth (permissions?)");
      }

      // 2. Supprimer l'utilisateur de notre table 'utilisateurs'
      const { error: dbError } = await supabase
        .from("utilisateurs")
        .delete()
        .eq("id", userId);
      if (dbError) throw dbError;

      toast.success("Utilisateur supprimé");
      fetchUsers();
    } catch (error: any) {
      console.error("Supabase Operation Error:", error);
      toast.error("Erreur lors de la suppression: " + error.message + (error.status === 401 ? " (Vérifiez les permissions ou la clé de service Supabase)" : ""));
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAddDialog = () => {
    setCurrentUser(emptyUser);
    setIsDialogOpen(true);
  };

  const openEditDialog = (user: User) => {
    setCurrentUser({
      ...user,
      mot_de_passe: "", // Clear password field for edit, never display existing
    });
    setIsDialogOpen(true);
  };

  const openDetailDialog = (user: User) => {
    setCurrentUser(user);
    setIsDetailOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Gestion des Utilisateurs</h2>
        <Button onClick={openAddDialog}>
          <Plus className="mr-2 h-4 w-4" />Ajouter utilisateur
        </Button>
      </div>

      <Card className="shadow-lg rounded-xl">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <Loader2 className="animate-spin mx-auto h-6 w-6" />
                    Chargement...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Aucun utilisateur trouvé
                  </TableCell>
                </TableRow>
              ) : (
                users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>{u.nom} {u.prenom}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${roleBadge(u.role)}`}>
                        {u.role}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={u.actif ? "default" : "secondary"}>
                        {u.actif ? "Actif" : "Inactif"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openDetailDialog(u)}><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(u)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(u.id)}><Trash2 className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog Formulaire */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{currentUser.id ? "Modifier l'utilisateur" : "Nouvel utilisateur"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 pt-2 sm:grid-cols-2">
            <div>
              <Label>Nom</Label>
              <Input value={currentUser.nom || ""} onChange={(e) => setCurrentUser(prev => ({ ...prev, nom: e.target.value }))} />
            </div>
            <div>
              <Label>Prénom</Label>
              <Input value={currentUser.prenom || ""} onChange={(e) => setCurrentUser(prev => ({ ...prev, prenom: e.target.value }))} />
            </div>
            <div className="sm:col-span-2">
              <Label>Email</Label>
              <Input type="email" value={currentUser.email || ""} onChange={(e) => setCurrentUser(prev => ({ ...prev, email: e.target.value }))} />
            </div>
            {!currentUser.id && ( // Only show password for new user creation
              <div className="sm:col-span-2">
                <Label>Mot de passe</Label>
                <Input 
                  type="password" 
                  value={currentUser.mot_de_passe || ""} 
                  onChange={(e) => setCurrentUser(prev => ({ ...prev, mot_de_passe: e.target.value }))} 
                  placeholder="Minimum 6 caractères"
                />
                <p className="text-xs text-muted-foreground mt-1">Le mot de passe ne sera pas affiché ni modifiable par la suite.</p>
              </div>
            )}
            <div>
              <Label>Rôle</Label>
              <Select value={currentUser.role || "admin"} onValueChange={(v) => setCurrentUser(prev => ({ ...prev, role: v as User["role"] }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="admin_junior">Admin Junior</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Actif</Label>
              <Select value={currentUser.actif ? "true" : "false"} onValueChange={(v) => setCurrentUser(prev => ({ ...prev, actif: v === "true" }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Actif</SelectItem>
                  <SelectItem value="false">Inactif</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Additional fields for user (telephone, adresse) */}
            <div>
              <Label>Téléphone</Label>
              <Input value={currentUser.telephone || ""} onChange={(e) => setCurrentUser(prev => ({ ...prev, telephone: e.target.value }))} />
            </div>
            <div>
              <Label>Adresse</Label>
              <Input value={currentUser.adresse || ""} onChange={(e) => setCurrentUser(prev => ({ ...prev, adresse: e.target.value }))} />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {currentUser.id ? "Mettre à jour" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Détails */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Détails utilisateur</DialogTitle></DialogHeader>
          {currentUser && (
            <div className="space-y-4 pt-4">
              <p><strong>ID Auth Supabase:</strong> {currentUser.id}</p> {/* Display Supabase Auth ID */}
              <p><strong>Nom complet:</strong> {currentUser.nom} {currentUser.prenom}</p>
              <p><strong>Email:</strong> {currentUser.email}</p>
              <p><strong>Rôle:</strong> {currentUser.role}</p>
              <p><strong>Statut:</strong> {currentUser.actif ? "Actif" : "Inactif"}</p>
              <p><strong>Téléphone:</strong> {currentUser.telephone || "N/A"}</p>
              <p><strong>Adresse:</strong> {currentUser.adresse || "N/A"}</p>
              <p><strong>Créé le:</strong> {currentUser.date_creation ? new Date(currentUser.date_creation).toLocaleDateString() : "N/A"}</p>
            </div>
          )}
          <DialogFooter className="mt-4">
            <Button variant="outline" className="w-full" onClick={() => setIsDetailOpen(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
