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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";

export default function PaiementsPage() {
  const [paiements, setPaiements] = useState<any[]>([]);
  const [inscriptions, setInscriptions] = useState<any[]>([]);
  const [newPaiement, setNewPaiement] = useState({
    inscription_id: "",
    montant_total: 0,
    montant_paye: 0,
    est_solde: false,
  });
  const [selectedPaiement, setSelectedPaiement] = useState<any | null>(null);
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [filterEstSolde, setFilterEstSolde] = useState("all"); // "all", "true", "false"
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    await fetchInscriptions();
    await fetchPaiements();
  };

  const fetchPaiements = async () => {
    const { data, error } = await supabase
      .from("paiements")
      .select("*, inscriptions(id, etudiant_id, logiciel_id, etudiants(nom, prenom), logiciels(nom, code_logiciel))");
    if (error) {
      console.error("Error fetching paiements:", error);
    } else {
      setPaiements(data);
    }
  };

  const fetchInscriptions = async () => {
    const { data, error } = await supabase
      .from("inscriptions")
      .select("id, etudiants(nom, prenom), logiciels(nom, code_logiciel)");
    if (error) {
      console.error("Error fetching inscriptions:", error);
    } else {
      setInscriptions(data);
      // Set a default inscription_id if available and newPaiement.inscription_id is empty
      if (data.length > 0 && newPaiement.inscription_id === "") {
        setNewPaiement((prev) => ({ ...prev, inscription_id: data[0].id.toString() }));
      }
    }
  };

  const handleCreate = async () => {
    if (!newPaiement.inscription_id || newPaiement.montant_total <= 0) {
      console.error("Validation Error: Inscription and Montant Total are required and positive.");
      return;
    }

    const { data, error } = await supabase
      .from("paiements")
      .insert([
        {
          inscription_id: parseInt(newPaiement.inscription_id),
          montant_total: newPaiement.montant_total,
          montant_paye: newPaiement.montant_paye,
          est_solde: newPaiement.est_solde,
        },
      ])
      .select("*, inscriptions(id, etudiant_id, logiciel_id, etudiants(nom, prenom), logiciels(nom, code_logiciel))");
    if (error) {
      console.error("Error creating paiement:", error);
      console.error("Supabase error details:", error.message, error.details, error.hint);
    } else if (data) {
      setPaiements([...paiements, data[0]]);
      setCreateDialogOpen(false);
      setNewPaiement({
        inscription_id: inscriptions.length > 0 ? inscriptions[0].id.toString() : "",
        montant_total: 0,
        montant_paye: 0,
        est_solde: false,
      });
    }
  };

  const handleUpdate = async () => {
    if (!selectedPaiement) return;
    if (!selectedPaiement.inscription_id || selectedPaiement.montant_total <= 0) {
      console.error("Validation Error: Inscription and Montant Total are required and positive for update.");
      return;
    }

    const { data, error } = await supabase
      .from("paiements")
      .update({
        inscription_id: parseInt(selectedPaiement.inscription_id),
        montant_total: selectedPaiement.montant_total,
        montant_paye: selectedPaiement.montant_paye,
        est_solde: selectedPaiement.est_solde,
      })
      .eq("id", selectedPaiement.id)
      .select("*, inscriptions(id, etudiant_id, logiciel_id, etudiants(nom, prenom), logiciels(nom, code_logiciel))");
    if (error) {
      console.error("Error updating paiement:", error);
      console.error("Supabase error details:", error.message, error.details, error.hint);
    } else if (data) {
      setPaiements(
        paiements.map((p) => (p.id === selectedPaiement.id ? data[0] : p))
      );
      setEditDialogOpen(false);
      setSelectedPaiement(null);
    }
  };

  const handleDelete = async (id: number) => {
    const { error } = await supabase.from("paiements").delete().eq("id", id);
    if (error) {
      console.error("Error deleting paiement:", error);
    } else {
      setPaiements(paiements.filter((p) => p.id !== id));
    }
  };

  const openEditDialog = (paiement: any) => {
    setSelectedPaiement({
      ...paiement,
      inscription_id: paiement.inscriptions.id,
    });
    setEditDialogOpen(true);
  };

  const filteredAndSearchedPaiements = paiements.filter((paiement) => {
    // Filter by est_solde
    if (filterEstSolde !== "all") {
      const isSolde = filterEstSolde === "true";
      if (paiement.est_solde !== isSolde) {
        return false;
      }
    }

    // Search by student or logiciel name
    if (searchTerm === "") return true;
    const searchLower = searchTerm.toLowerCase();
    const studentName = `${paiement.inscriptions?.etudiants?.nom} ${paiement.inscriptions?.etudiants?.prenom}`.toLowerCase();
    const logicielName = paiement.inscriptions?.logiciels?.nom.toLowerCase();

    return studentName.includes(searchLower) || logicielName.includes(searchLower);
  });

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Gestion des Paiements</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Ajouter Paiement
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un nouveau paiement</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="inscription_id" className="text-right">
                  Inscription
                </Label>
                <Select
                  value={newPaiement.inscription_id}
                  onValueChange={(value) =>
                    setNewPaiement({ ...newPaiement, inscription_id: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Sélectionner une inscription" />
                  </SelectTrigger>
                  <SelectContent>
                    {inscriptions.map((inscription) => (
                      <SelectItem key={inscription.id} value={inscription.id.toString()}>
                        {inscription.etudiants?.nom} {inscription.etudiants?.prenom} -{" "}
                        {inscription.logiciels?.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="montant_total" className="text-right">
                  Montant Total
                </Label>
                <Input
                  id="montant_total"
                  type="number"
                  value={newPaiement.montant_total}
                  onChange={(e) =>
                    setNewPaiement({
                      ...newPaiement,
                      montant_total: parseFloat(e.target.value),
                    })
                  }
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="montant_paye" className="text-right">
                  Montant Payé
                </Label>
                <Input
                  id="montant_paye"
                  type="number"
                  value={newPaiement.montant_paye}
                  onChange={(e) =>
                    setNewPaiement({
                      ...newPaiement,
                      montant_paye: parseFloat(e.target.value),
                    })
                  }
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="est_solde" className="text-right">
                  Soldé
                </Label>
                <Switch
                  id="est_solde"
                  checked={newPaiement.est_solde}
                  onCheckedChange={(checked) =>
                    setNewPaiement({ ...newPaiement, est_solde: checked })
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

      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <Input
          placeholder="Rechercher par étudiant ou logiciel..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Select value={filterEstSolde} onValueChange={setFilterEstSolde}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="true">Soldé</SelectItem>
            <SelectItem value="false">Non Soldé</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Inscription (Étudiant - Logiciel)</TableHead>
            <TableHead>Montant Total</TableHead>
            <TableHead>Montant Payé</TableHead>
            <TableHead>Date Création</TableHead>
            <TableHead>Date Premier Paiement</TableHead>
            <TableHead>Date Dernier Paiement</TableHead>
            <TableHead>Soldé</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAndSearchedPaiements.map((paiement) => (
            <TableRow key={paiement.id}>
              <TableCell>
                {paiement.inscriptions?.etudiants?.nom}{" "}
                {paiement.inscriptions?.etudiants?.prenom} -{" "}
                {paiement.inscriptions?.logiciels?.nom}
              </TableCell>
              <TableCell>{paiement.montant_total}</TableCell>
              <TableCell>{paiement.montant_paye}</TableCell>
              <TableCell>{new Date(paiement.date_creation).toLocaleDateString()}</TableCell>
              <TableCell>
                {paiement.date_premier_paiement ? new Date(paiement.date_premier_paiement).toLocaleDateString() : 'N/A'}
              </TableCell>
              <TableCell>
                {paiement.date_dernier_paiement ? new Date(paiement.date_dernier_paiement).toLocaleDateString() : 'N/A'}
              </TableCell>
              <TableCell>
                <Badge variant={paiement.est_solde ? "default" : "secondary"}>
                  {paiement.est_solde ? "Oui" : "Non"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(paiement)}
                  >
                    Modifier
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(paiement.id)}
                  >
                    Supprimer
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedPaiement && (
        <Dialog open={isEditDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifier le paiement</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_inscription_id" className="text-right">
                  Inscription
                </Label>
                <Select
                  value={selectedPaiement.inscription_id.toString()}
                  onValueChange={(value) =>
                    setSelectedPaiement({ ...selectedPaiement, inscription_id: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Sélectionner une inscription" />
                  </SelectTrigger>
                  <SelectContent>
                    {inscriptions.map((inscription) => (
                      <SelectItem key={inscription.id} value={inscription.id.toString()}>
                        {inscription.etudiants?.nom} {inscription.etudiants?.prenom} -{" "}
                        {inscription.logiciels?.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_montant_total" className="text-right">
                  Montant Total
                </Label>
                <Input
                  id="edit_montant_total"
                  type="number"
                  value={selectedPaiement.montant_total}
                  onChange={(e) =>
                    setSelectedPaiement({
                      ...selectedPaiement,
                      montant_total: parseFloat(e.target.value),
                    })
                  }
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_montant_paye" className="text-right">
                  Montant Payé
                </Label>
                <Input
                  id="edit_montant_paye"
                  type="number"
                  value={selectedPaiement.montant_paye}
                  onChange={(e) =>
                    setSelectedPaiement({
                      ...selectedPaiement,
                      montant_paye: parseFloat(e.target.value),
                    })
                  }
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_est_solde" className="text-right">
                  Soldé
                </Label>
                <Switch
                  id="edit_est_solde"
                  checked={selectedPaiement.est_solde}
                  onCheckedChange={(checked) =>
                    setSelectedPaiement({ ...selectedPaiement, est_solde: checked })
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
