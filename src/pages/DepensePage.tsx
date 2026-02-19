import { useState, useEffect } from "react";
import { PlusCircle, Trash2 } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function DepensePage() {
  const [depenses, setDepenses] = useState<any[]>([]);
  const [newDepense, setNewDepense] = useState({
    nom_depense: "",
    motif: "",
    somme: 0,
  });
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchDepenses();
  }, []);

  const fetchDepenses = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("depenses")
      .select("*")
      .order("date_creation", { ascending: false });
    
    if (error) {
      console.error("Erreur lors de la récupération des dépenses:", error);
    } else {
      setDepenses(data || []);
    }
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!newDepense.nom_depense || newDepense.somme <= 0) {
      alert("Veuillez remplir le nom et une somme valide.");
      return;
    }

    const { data, error } = await supabase
      .from("depenses")
      .insert([newDepense])
      .select();

    if (error) {
      console.error("Erreur lors de la création de la dépense:", error);
    } else if (data) {
      setDepenses([data[0], ...depenses]);
      setCreateDialogOpen(false);
      setNewDepense({ nom_depense: "", motif: "", somme: 0 });
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette dépense ?")) {
      const { error } = await supabase.from("depenses").delete().eq("id", id);
      if (error) {
        console.error("Erreur lors de la suppression:", error);
      } else {
        setDepenses(depenses.filter((d) => d.id !== id));
      }
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(depenses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDepenses = depenses.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const totalSomme = depenses.reduce((acc, curr) => acc + (curr.somme || 0), 0);

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Gestion des Dépenses</h1>

        <Dialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Ajouter Dépense
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enregistrer une nouvelle dépense</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nom" className="text-right">Nom</Label>
                <Input
                  id="nom"
                  value={newDepense.nom_depense}
                  onChange={(e) => setNewDepense({ ...newDepense, nom_depense: e.target.value })}
                  className="col-span-3"
                  placeholder="Ex: Fournitures bureau"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="motif" className="text-right">Motif</Label>
                <Input
                  id="motif"
                  value={newDepense.motif}
                  onChange={(e) => setNewDepense({ ...newDepense, motif: e.target.value })}
                  className="col-span-3"
                  placeholder="Raison de la dépense"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="somme" className="text-right">Somme</Label>
                <Input
                  id="somme"
                  type="number"
                  value={newDepense.somme}
                  onChange={(e) => setNewDepense({ ...newDepense, somme: parseFloat(e.target.value) })}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreate}>Enregistrer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total des Dépenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSomme.toLocaleString()} GNF</div>
          </CardContent>
        </Card>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom Dépense</TableHead>
            <TableHead>Motif</TableHead>
            <TableHead>Somme</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow><TableCell colSpan={5} className="text-center">Chargement...</TableCell></TableRow>
          ) : paginatedDepenses.length === 0 ? (
            <TableRow><TableCell colSpan={5} className="text-center">Aucune dépense enregistrée.</TableCell></TableRow>
          ) : (
            paginatedDepenses.map((depense) => (
              <TableRow key={depense.id}>
                <TableCell className="font-medium">{depense.nom_depense}</TableCell>
                <TableCell>{depense.motif}</TableCell>
                <TableCell>{depense.somme.toLocaleString()} GNF</TableCell>
                <TableCell>{new Date(depense.date_creation).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(depense.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                href="#" 
                onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1); }}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            {[...Array(totalPages)].map((_, i) => (
              <PaginationItem key={i + 1}>
                <PaginationLink 
                  href="#" 
                  isActive={currentPage === i + 1}
                  onClick={(e) => { e.preventDefault(); handlePageChange(i + 1); }}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext 
                href="#" 
                onClick={(e) => { e.preventDefault(); handlePageChange(currentPage + 1); }}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
