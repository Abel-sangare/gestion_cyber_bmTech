import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { KeyRound, Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

type Step = "email" | "reset" | "success";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCheckEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // On vérifie dans la table publique 'utilisateurs'
      const { data, error, status } = await supabase
        .from("utilisateurs")
        .select("email")
        .eq("email", email.trim())
        .maybeSingle();

      if (error) {
        console.error("Erreur Supabase:", error);
        if (status === 406 || error.code === "PGRST116") {
          toast.error("Cet e-mail n'est pas enregistré.");
        } else {
          toast.error("Erreur d'accès : Vérifiez les politiques RLS de votre table 'utilisateurs'.");
        }
        return;
      }

      if (!data) {
        toast.error("Cet e-mail n'existe pas dans la base de données.");
        return;
      }

      // Si l'e-mail existe, on envoie le vrai mail de réinitialisation en arrière-plan
      // et on passe à l'interface de changement
      await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin + "/forgot-password",
      });
      
      toast.success("Utilisateur trouvé !");
      setStep("reset");
    } catch (error: any) {
      toast.error("Une erreur imprévue est survenue.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas.");
      return;
    }

    if (password.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    setLoading(true);

    try {
      // Tentative de mise à jour du mot de passe
      // IMPORTANT: Cela ne fonctionnera que si l'utilisateur a une session active
      // ou s'il vient d'un lien de récupération.
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        // Si erreur car pas de session, on explique la méthode standard
        if (error.message.includes("not logged in")) {
          toast.info("Pour des raisons de sécurité, un e-mail de confirmation a été envoyé. Veuillez cliquer sur le lien reçu pour valider le changement.");
          await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + "/forgot-password",
          });
          setStep("success");
        } else {
          throw error;
        }
      } else {
        toast.success("Mot de passe modifié avec succès !");
        setStep("success");
      }
    } catch (error: any) {
      toast.error(error.message || "Erreur lors du changement de mot de passe.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md shadow-lg">
        {step === "email" && (
          <>
            <CardHeader className="space-y-1 text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold">Mot de passe oublié</CardTitle>
              <CardDescription>
                Saisissez votre e-mail pour réinitialiser votre mot de passe
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleCheckEmail}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email professionnel</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="nom@exemple.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Vérifier l'e-mail
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full" 
                  onClick={() => navigate("/login")}
                  type="button"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Retour à la connexion
                </Button>
              </CardFooter>
            </form>
          </>
        )}

        {step === "reset" && (
          <>
            <CardHeader className="space-y-1 text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <KeyRound className="h-6 w-6 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold">Nouveau mot de passe</CardTitle>
              <CardDescription>
                Définissez votre nouveau mot de passe sécurisé
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleResetPassword}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Nouveau mot de passe</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                  <Input 
                    id="confirmPassword" 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required 
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Changer le mot de passe
                </Button>
              </CardFooter>
            </form>
          </>
        )}

        {step === "success" && (
          <>
            <CardHeader className="space-y-1 text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold">Opération réussie</CardTitle>
              <CardDescription>
                Votre demande a été traitée. Si vous avez reçu un e-mail, utilisez-le pour finaliser, sinon vous pouvez vous connecter.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pb-6">
              <p className="text-sm text-muted-foreground">
                Vous pouvez maintenant retourner à la page de connexion.
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => navigate("/login")}>
                Retour à la connexion
              </Button>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;
