import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-xl font-semibold">Paramètres</h2>

      <Card className="shadow-lg rounded-xl">
        <CardHeader><CardTitle className="text-base">Profil administrateur</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div><Label>Nom</Label><Input defaultValue="Admin Principal" /></div>
          <div><Label>Email</Label><Input defaultValue="admin@bmtech.com" /></div>
          <div><Label>Mot de passe</Label><Input type="password" defaultValue="••••••••" /></div>
          <Button>Sauvegarder</Button>
        </CardContent>
      </Card>

      <Card className="shadow-lg rounded-xl">
        <CardHeader><CardTitle className="text-base">Apparence</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Mode sombre</p>
              <p className="text-sm text-muted-foreground">Basculer entre le thème clair et sombre</p>
            </div>
            <Switch checked={dark} onCheckedChange={setDark} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
