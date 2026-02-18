import { useState, useEffect } from "react";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";

export default function SchedulePage() {
  const [emploisTemps, setEmploisTemps] = useState<any[]>([]);
  const [logiciels, setLogiciels] = useState<any[]>([]);
  // Removed enseignants state as per user request
  const [newEmploiTemps, setNewEmploiTemps] = useState({
    logiciel_id: "",
    // Removed enseignant_id
    jour_semaine: "lundi",
    heure_debut: "",
    heure_fin: "",
    // Removed salle
  });
  const [selectedEmploiTemps, setSelectedEmploiTemps] = useState<any | null>(null);
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);

  const joursSemaineOptions = [
    "lundi",
    "mardi",
    "mercredi",
    "jeudi",
    "vendredi",
    "samedi",
    "dimanche",
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    await fetchLogiciels();
    // Removed fetchEnseignants as per user request
    await fetchEmploisTemps();
  };

  const fetchEmploisTemps = async () => {
    const { data, error } = await supabase
      .from("emplois_temps")
      .select("*, logiciels(id, nom)"); // Removed utilisateurs join
    if (error) {
      console.error("Error fetching emplois du temps:", error);
    } else {
      setEmploisTemps(data);
    }
  };

  const fetchLogiciels = async () => {
    const { data, error } = await supabase.from("logiciels").select("id, nom");
    if (error) {
      console.error("Error fetching logiciels:", error);
    } else {
      setLogiciels(data);
      // Initialize newEmploiTemps.logiciel_id if it's empty and logiciels are available
      if (data.length > 0 && newEmploiTemps.logiciel_id === "") {
        setNewEmploiTemps((prev) => ({ ...prev, logiciel_id: data[0].id.toString() }));
      }
    }
  };

  // Removed fetchEnseignants as per user request

  const handleCreate = async () => {
    // Basic validation for required fields
    if (!newEmploiTemps.logiciel_id || !newEmploiTemps.heure_debut || !newEmploiTemps.heure_fin) {
      console.error("Validation Error: Logiciel, Heure début, and Heure fin are required.");
      // Optionally show a user-friendly error message
      return;
    }

    const { data, error } = await supabase
      .from("emplois_temps")
      .insert([
        {
          logiciel_id: parseInt(newEmploiTemps.logiciel_id),
          // Removed enseignant_id
          jour_semaine: newEmploiTemps.jour_semaine,
          heure_debut: newEmploiTemps.heure_debut,
          heure_fin: newEmploiTemps.heure_fin,
          // Removed salle
        },
      ])
      .select("*, logiciels(id, nom)"); // Removed utilisateurs join
    if (error) {
      console.error("Error creating emploi du temps:", error);
      console.error("Supabase error details:", error.message, error.details, error.hint);
    } else if (data) {
      setEmploisTemps([...emploisTemps, data[0]]);
      setCreateDialogOpen(false);
      setNewEmploiTemps({
        logiciel_id: logiciels.length > 0 ? logiciels[0].id.toString() : "", // Reset with a default if available
        // Removed enseignant_id
        jour_semaine: "lundi",
        heure_debut: "",
        heure_fin: "",
        // Removed salle
      });
    }
  };

  const handleUpdate = async () => {
    if (!selectedEmploiTemps) return;

    // Basic validation for required fields in edit mode
    if (!selectedEmploiTemps.logiciel_id || !selectedEmploiTemps.heure_debut || !selectedEmploiTemps.heure_fin) {
      console.error("Validation Error: Logiciel, Heure début, and Heure fin are required for update.");
      // Optionally show a user-friendly error message
      return;
    }

    const { data, error } = await supabase
      .from("emplois_temps")
      .update({
        logiciel_id: parseInt(selectedEmploiTemps.logiciel_id),
        // Removed enseignant_id
        jour_semaine: selectedEmploiTemps.jour_semaine,
        heure_debut: selectedEmploiTemps.heure_debut,
        heure_fin: selectedEmploiTemps.heure_fin,
        // Removed salle
      })
      .eq("id", selectedEmploiTemps.id)
      .select("*, logiciels(id, nom)"); // Removed utilisateurs join
    if (error) {
      console.error("Error updating emploi du temps:", error);
      console.error("Supabase error details:", error.message, error.details, error.hint);
    } else if (data) {
      setEmploisTemps(
        emploisTemps.map((et) => (et.id === selectedEmploiTemps.id ? data[0] : et))
      );
      setEditDialogOpen(false);
      setSelectedEmploiTemps(null);
    }
  };

  const handleDelete = async (id: number) => {
    const { error } = await supabase.from("emplois_temps").delete().eq("id", id);
    if (error) {
      console.error("Error deleting emploi du temps:", error);
    } else {
      setEmploisTemps(emploisTemps.filter((et) => et.id !== id));
    }
  };

  const openEditDialog = (emploiTemps: any) => {
    setSelectedEmploiTemps({
      ...emploiTemps,
      logiciel_id: emploiTemps.logiciels.id,
      // Removed enseignant_id
    });
    setEditDialogOpen(true);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Gestion des Emplois du Temps</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Ajouter Emploi du Temps
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un nouvel emploi du temps</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="logiciel_id" className="text-right">
                  Logiciel
                </Label>
                <Select
                  value={newEmploiTemps.logiciel_id}
                  onValueChange={(value) =>
                    setNewEmploiTemps({ ...newEmploiTemps, logiciel_id: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Sélectionner un logiciel" />
                  </SelectTrigger>
                  <SelectContent>
                    {logiciels.map((logiciel) => (
                      <SelectItem key={logiciel.id} value={logiciel.id.toString()}>
                        {logiciel.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Removed Enseignant field */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="jour_semaine" className="text-right">
                  Jour de la semaine
                </Label>
                <Select
                  value={newEmploiTemps.jour_semaine}
                  onValueChange={(value) =>
                    setNewEmploiTemps({ ...newEmploiTemps, jour_semaine: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Sélectionner un jour" />
                  </SelectTrigger>
                  <SelectContent>
                    {joursSemaineOptions.map((jour) => (
                      <SelectItem key={jour} value={jour}>
                        {jour}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="heure_debut" className="text-right">
                  Heure de début
                </Label>
                <Input
                  id="heure_debut"
                  type="time"
                  value={newEmploiTemps.heure_debut}
                  onChange={(e) =>
                    setNewEmploiTemps({ ...newEmploiTemps, heure_debut: e.target.value })
                  }
                  className="col-span-3"
                  required // Added required for validation
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="heure_fin" className="text-right">
                  Heure de fin
                </Label>
                <Input
                  id="heure_fin"
                  type="time"
                  value={newEmploiTemps.heure_fin}
                  onChange={(e) =>
                    setNewEmploiTemps({ ...newEmploiTemps, heure_fin: e.target.value })
                  }
                  className="col-span-3"
                  required // Added required for validation
                />
              </div>
              {/* Removed Salle field */}
            </div>
            <DialogFooter>
              <Button onClick={handleCreate}>Créer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Logiciel</TableHead>
            {/* Removed Enseignant TableHead */}
            <TableHead>Jour de la semaine</TableHead>
            <TableHead>Heure début</TableHead>
            <TableHead>Heure fin</TableHead>
            {/* Removed Salle TableHead */}
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {emploisTemps.map((emploiTemps) => (
            <TableRow key={emploiTemps.id}>
              <TableCell>{emploiTemps.logiciels?.nom}</TableCell>
              {/* Removed Enseignant TableCell */}
              <TableCell>{emploiTemps.jour_semaine}</TableCell>
              <TableCell>{emploiTemps.heure_debut}</TableCell>
              <TableCell>{emploiTemps.heure_fin}</TableCell>
              {/* Removed Salle TableCell */}
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(emploiTemps)}
                  >
                    Modifier
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(emploiTemps.id)}
                  >
                    Supprimer
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedEmploiTemps && (
        <Dialog open={isEditDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifier l'emploi du temps</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_logiciel_id" className="text-right">
                  Logiciel
                </Label>
                <Select
                  value={selectedEmploiTemps.logiciel_id.toString()}
                  onValueChange={(value) =>
                    setSelectedEmploiTemps({ ...selectedEmploiTemps, logiciel_id: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Sélectionner un logiciel" />
                  </SelectTrigger>
                  <SelectContent>
                    {logiciels.map((logiciel) => (
                      <SelectItem key={logiciel.id} value={logiciel.id.toString()}>
                        {logiciel.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Removed Enseignant field */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_jour_semaine" className="text-right">
                  Jour de la semaine
                </Label>
                <Select
                  value={selectedEmploiTemps.jour_semaine}
                  onValueChange={(value) =>
                    setSelectedEmploiTemps({ ...selectedEmploiTemps, jour_semaine: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Sélectionner un jour" />
                  </SelectTrigger>
                  <SelectContent>
                    {joursSemaineOptions.map((jour) => (
                      <SelectItem key={jour} value={jour}>
                        {jour}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_heure_debut" className="text-right">
                  Heure de début
                </Label>
                <Input
                  id="edit_heure_debut"
                  type="time"
                  value={selectedEmploiTemps.heure_debut}
                  onChange={(e) =>
                    setSelectedEmploiTemps({ ...selectedEmploiTemps, heure_debut: e.target.value })
                  }
                  className="col-span-3"
                  required // Added required for validation
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_heure_fin" className="text-right">
                  Heure de fin
                </Label>
                <Input
                  id="edit_heure_fin"
                  type="time"
                  value={selectedEmploiTemps.heure_fin}
                  onChange={(e) =>
                    setSelectedEmploiTemps({ ...selectedEmploiTemps, heure_fin: e.target.value })
                  }
                  className="col-span-3"
                  required // Added required for validation
                />
              </div>
              {/* Removed Salle field */}
            </div>
            <DialogFooter>
              <Button onClick={handleUpdate}>Sauvegarder</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
