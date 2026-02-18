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
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";

export default function InscriptionsPage() {
  const [inscriptions, setInscriptions] = useState<any[]>([]);
  const [etudiants, setEtudiants] = useState<any[]>([]);
  const [logiciels, setLogiciels] = useState<any[]>([]);
  const [newInscription, setNewInscription] = useState({
    etudiant_id: "",
    logiciel_id: "",
    statut: "inscrit",
    prix_inscription: 0,
  });
  const [selectedInscription, setSelectedInscription] = useState<any | null>(null);
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    await fetchEtudiants();
    await fetchLogiciels();
    await fetchInscriptions();
  };

  const fetchInscriptions = async () => {
    const { data, error } = await supabase
      .from("inscriptions")
      .select("*, etudiants(id, nom, prenom), logiciels(id, nom, code_logiciel)");
    if (error) {
      console.error("Error fetching inscriptions:", error);
    } else {
      setInscriptions(data);
    }
  };

  const fetchEtudiants = async () => {
    const { data, error } = await supabase.from("etudiants").select("id, nom, prenom");
    if (error) {
      console.error("Error fetching etudiants:", error);
    } else {
      setEtudiants(data);
    }
  };

  const fetchLogiciels = async () => {
    const { data, error } = await supabase.from("logiciels").select("id, nom, code_logiciel");
    if (error) {
      console.error("Error fetching logiciels:", error);
    } else {
      setLogiciels(data);
    }
  };

  const handleCreate = async () => {
    const { data, error } = await supabase
      .from("inscriptions")
      .insert([
        {
          etudiant_id: parseInt(newInscription.etudiant_id),
          logiciel_id: parseInt(newInscription.logiciel_id),
          statut: newInscription.statut,
          prix_inscription: newInscription.prix_inscription,
        },
      ])
      .select("*, etudiants(id, nom, prenom), logiciels(id, nom, code_logiciel)");
    if (error) {
      console.error("Error creating inscription:", error);
    } else if (data) {
      setInscriptions([...inscriptions, data[0]]);
      setCreateDialogOpen(false);
      setNewInscription({
        etudiant_id: "",
        logiciel_id: "",
        statut: "inscrit",
        prix_inscription: 0,
      });
    }
  };

  const handleUpdate = async () => {
    if (!selectedInscription) return;
    const { data, error } = await supabase
      .from("inscriptions")
      .update({
        etudiant_id: parseInt(selectedInscription.etudiant_id),
        logiciel_id: parseInt(selectedInscription.logiciel_id),
        statut: selectedInscription.statut,
        prix_inscription: selectedInscription.prix_inscription,
      })
      .eq("id", selectedInscription.id)
      .select("*, etudiants(id, nom, prenom), logiciels(id, nom, code_logiciel)");
    if (error) {
      console.error("Error updating inscription:", error);
    } else if (data) {
      setInscriptions(
        inscriptions.map((i) => (i.id === selectedInscription.id ? data[0] : i))
      );
      setEditDialogOpen(false);
      setSelectedInscription(null);
    }
  };

  const handleDelete = async (id: number) => {
    const { error } = await supabase.from("inscriptions").delete().eq("id", id);
    if (error) {
      console.error("Error deleting inscription:", error);
    } else {
      setInscriptions(inscriptions.filter((i) => i.id !== id));
    }
  };

  const openEditDialog = (inscription: any) => {
    setSelectedInscription({
      ...inscription,
      etudiant_id: inscription.etudiants.id,
      logiciel_id: inscription.logiciels.id,
    });
    setEditDialogOpen(true);
  };

  const statutOptions = ["inscrit", "termine", "abandon"];

  const filteredInscriptions = inscriptions.filter((i) => {
    if (filter === "all") return true;
    return i.statut === filter;
  });

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Gestion des Inscriptions</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Ajouter Inscription
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter une nouvelle inscription</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="etudiant_id" className="text-right">
                  Étudiant
                </Label>
                <Select
                  value={newInscription.etudiant_id}
                  onValueChange={(value) =>
                    setNewInscription({ ...newInscription, etudiant_id: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Sélectionner un étudiant" />
                  </SelectTrigger>
                  <SelectContent>
                    {etudiants.map((etudiant) => (
                      <SelectItem key={etudiant.id} value={etudiant.id.toString()}>
                        {etudiant.nom} {etudiant.prenom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="logiciel_id" className="text-right">
                  Logiciel
                </Label>
                <Select
                  value={newInscription.logiciel_id}
                  onValueChange={(value) =>
                    setNewInscription({ ...newInscription, logiciel_id: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Sélectionner un logiciel" />
                  </SelectTrigger>
                  <SelectContent>
                    {logiciels.map((logiciel) => (
                      <SelectItem key={logiciel.id} value={logiciel.id.toString()}>
                        {logiciel.nom} ({logiciel.code_logiciel})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="statut" className="text-right">
                  Statut
                </Label>
                <Select
                  value={newInscription.statut}
                  onValueChange={(value) =>
                    setNewInscription({ ...newInscription, statut: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Sélectionner un statut" />
                  </SelectTrigger>
                  <SelectContent>
                    {statutOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="prix_inscription" className="text-right">
                  Prix Inscription
                </Label>
                <Input
                  id="prix_inscription"
                  type="number"
                  value={newInscription.prix_inscription}
                  onChange={(e) =>
                    setNewInscription({
                      ...newInscription,
                      prix_inscription: parseFloat(e.target.value),
                    })
                  }
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreate}>Créer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
        <h2 className="text-xl font-semibold">Inscriptions</h2>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full sm:w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            {statutOptions.map((option) => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Étudiant</TableHead>
            <TableHead>Logiciel</TableHead>
            <TableHead>Date d'Inscription</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Prix Inscription</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredInscriptions.map((inscription) => (
            <TableRow key={inscription.id}>
              <TableCell>{inscription.etudiants?.nom} {inscription.etudiants?.prenom}</TableCell>
              <TableCell>{inscription.logiciels?.nom}</TableCell>
              <TableCell>{new Date(inscription.date_inscription).toLocaleDateString()}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    inscription.statut === "termine"
                      ? "default"
                      : inscription.statut === "abandon"
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {inscription.statut}
                </Badge>
              </TableCell>
              <TableCell>{inscription.prix_inscription}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(inscription)}
                  >
                    Modifier
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(inscription.id)}
                  >
                    Supprimer
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedInscription && (
        <Dialog open={isEditDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifier l'inscription</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_etudiant_id" className="text-right">
                  Étudiant
                </Label>
                <Select
                  value={selectedInscription.etudiant_id.toString()}
                  onValueChange={(value) =>
                    setSelectedInscription({ ...selectedInscription, etudiant_id: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Sélectionner un étudiant" />
                  </SelectTrigger>
                  <SelectContent>
                    {etudiants.map((etudiant) => (
                      <SelectItem key={etudiant.id} value={etudiant.id.toString()}>
                        {etudiant.nom} {etudiant.prenom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_logiciel_id" className="text-right">
                  Logiciel
                </Label>
                <Select
                  value={selectedInscription.logiciel_id.toString()}
                  onValueChange={(value) =>
                    setSelectedInscription({ ...selectedInscription, logiciel_id: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Sélectionner un logiciel" />
                  </SelectTrigger>
                  <SelectContent>
                    {logiciels.map((logiciel) => (
                      <SelectItem key={logiciel.id} value={logiciel.id.toString()}>
                        {logiciel.nom} ({logiciel.code_logiciel})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_statut" className="text-right">
                  Statut
                </Label>
                <Select
                  value={selectedInscription.statut}
                  onValueChange={(value) =>
                    setSelectedInscription({ ...selectedInscription, statut: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Sélectionner un statut" />
                  </SelectTrigger>
                  <SelectContent>
                    {statutOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_prix_inscription" className="text-right">
                  Prix Inscription
                </Label>
                <Input
                  id="edit_prix_inscription"
                  type="number"
                  value={selectedInscription.prix_inscription}
                  onChange={(e) =>
                    setSelectedInscription({
                      ...selectedInscription,
                      prix_inscription: parseFloat(e.target.value),
                    })
                  }
                  className="col-span-3"
                />
              </div>
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
