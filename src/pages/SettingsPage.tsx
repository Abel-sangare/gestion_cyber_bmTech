import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Loader2, Save, Lock } from "lucide-react";

export default function SettingsPage() {
  const { user, profile: initialProfile, loading: authLoading, refetchProfile } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [profile, setProfile] = useState({
    nom: "",
    prenom: "",
    telephone: "",
    adresse: "",
  });
  
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => {
    if (initialProfile) {
      setProfile({
        nom: initialProfile.nom || "",
        prenom: initialProfile.prenom || "",
        telephone: initialProfile.telephone || "",
        adresse: initialProfile.adresse || "",
      });
    }
  }, [initialProfile]);

  const handleUpdateProfile = async () => {
    if (!user) return;
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("utilisateurs")
        .update({
          nom: profile.nom,
          prenom: profile.prenom,
          telephone: profile.telephone,
          adresse: profile.adresse,
        })
        .eq("id", user.id);

      if (error) throw error;
      toast.success("Profil mis à jour avec succès");
      refetchProfile(); // Rafraîchit le profil dans toute l'app
    } catch (error: any) {
      toast.error("Erreur lors de la mise à jour : " + error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setIsUpdating(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (error) throw error;
      toast.success("Mot de passe mis à jour");
      setPasswordData({ newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      toast.error("Erreur : " + error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold">Mon Profil & Paramètres</h2>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profil Personnel */}
        <Card className="shadow-lg rounded-xl border-none bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Save className="h-5 w-5 text-primary" />
              Informations Personnelles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nom">Nom</Label>
                <Input 
                  id="nom" 
                  value={profile.nom} 
                  onChange={(e) => setProfile({...profile, nom: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prenom">Prénom</Label>
                <Input 
                  id="prenom" 
                  value={profile.prenom} 
                  onChange={(e) => setProfile({...profile, prenom: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email (Lecture seule)</Label>
              <Input id="email" value={user?.email || ""} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tel">Téléphone</Label>
              <Input 
                id="tel" 
                value={profile.telephone} 
                onChange={(e) => setProfile({...profile, telephone: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adresse">Adresse</Label>
              <Input 
                id="adresse" 
                value={profile.adresse} 
                onChange={(e) => setProfile({...profile, adresse: e.target.value})}
              />
            </div>
            <Button onClick={handleUpdateProfile} disabled={isUpdating} className="w-full">
              {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Sauvegarder les modifications
            </Button>
          </CardContent>
        </Card>

        {/* Sécurité & Apparence */}
        <div className="space-y-6">
          <Card className="shadow-lg rounded-xl border-none bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                Sécurité
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">Nouveau mot de passe</Label>
                <Input 
                  id="new-password" 
                  type="password" 
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                <Input 
                  id="confirm-password" 
                  type="password" 
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  placeholder="••••••••"
                />
              </div>
              <Button onClick={handleChangePassword} disabled={isUpdating} variant="outline" className="w-full">
                Modifier le mot de passe
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-lg rounded-xl border-none bg-card/50 backdrop-blur-sm">
            <CardHeader><CardTitle className="text-lg">Apparence</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Mode sombre</p>
                  <p className="text-xs text-muted-foreground">Basculer entre le thème clair et sombre</p>
                </div>
                <Switch checked={dark} onCheckedChange={setDark} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
