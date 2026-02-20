import { useState, useEffect } from "react";
import { PlusCircle, Trash2, Edit, Search } from "lucide-react";
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
import { toast } from "sonner";

export default function PrestationsPage() {
  const [prestations, setPrestations] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPrestation, setCurrentPrestation] = useState({
    id: null,
    nom_prestation: "",
    nom_client: "",
    date: new Date().toISOString().split('T')[0],
    telephone: "",
    prix: 0,
    quantite: 1,
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchPrestations();
  }, []);

  const fetchPrestations = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("prestations")
      .select("*")
      .order("date_creation", { ascending: false });
    
    if (error) {
      console.error("Erreur lors de la récupération des prestations:", error);
      toast.error("Erreur lors du chargement des prestations");
    } else {
      setPrestations(data || []);
    }
    setLoading(false);
  };

  const handleOpenAdd = () => {
    setIsEditing(false);
    setCurrentPrestation({
      id: null,
      nom_prestation: "",
      nom_client: "",
      date: new Date().toISOString().split('T')[0],
      telephone: "",
      prix: 0,
      quantite: 1,
    });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (prestation: any) => {
    setIsEditing(true);
    setCurrentPrestation({
      ...prestation,
      date: prestation.date || new Date().toISOString().split('T')[0],
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!currentPrestation.nom_prestation || !currentPrestation.nom_client || currentPrestation.prix < 0) {
      toast.error("Veuillez remplir les champs obligatoires.");
      return;
    }

    setLoading(true);
    if (isEditing) {
      const { error } = await supabase
        .from("prestations")
        .update({
          nom_prestation: currentPrestation.nom_prestation,
          nom_client: currentPrestation.nom_client,
          date: currentPrestation.date,
          telephone: currentPrestation.telephone,
          prix: currentPrestation.prix,
          quantite: currentPrestation.quantite,
        })
        .eq("id", currentPrestation.id);

      if (error) {
        toast.error("Erreur lors de la modification");
      } else {
        toast.success("Prestation modifiée avec succès");
        fetchPrestations();
        setIsDialogOpen(false);
      }
    } else {
      const { error } = await supabase
        .from("prestations")
        .insert([{
          nom_prestation: currentPrestation.nom_prestation,
          nom_client: currentPrestation.nom_client,
          date: currentPrestation.date,
          telephone: currentPrestation.telephone,
          prix: currentPrestation.prix,
          quantite: currentPrestation.quantite,
        }]);

      if (error) {
        toast.error("Erreur lors de l'ajout");
      } else {
        toast.success("Prestation ajoutée avec succès");
        fetchPrestations();
        setIsDialogOpen(false);
      }
    }
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette prestation ?")) {
      const { error } = await supabase.from("prestations").delete().eq("id", id);
      if (error) {
        toast.error("Erreur lors de la suppression");
      } else {
        toast.success("Prestation supprimée");
        setPrestations(prestations.filter((p) => p.id !== id));
      }
    }
  };

  const filteredPrestations = prestations.filter(p => 
    p.nom_prestation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.nom_client.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredPrestations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPrestations = filteredPrestations.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const totalRevenu = prestations.reduce((acc, curr) => acc + (curr.prix * curr.quantite || 0), 0);

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <h1 className="text-2xl font-bold">Gestion des Prestations</h1>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={handleOpenAdd}>
            <PlusCircle className="mr-2 h-4 w-4" /> Ajouter
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary">Revenu Total Prestations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalRevenu.toLocaleString()} GNF</div>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Prestation</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>Prix Unit.</TableHead>
              <TableHead>Qté</TableHead>
              <TableHead>Total</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={8} className="text-center">Chargement...</TableCell></TableRow>
            ) : paginatedPrestations.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center">Aucune prestation trouvée.</TableCell></TableRow>
            ) : (
              paginatedPrestations.map((prestation) => (
                <TableRow key={prestation.id}>
                  <TableCell className="font-medium">{prestation.nom_prestation}</TableCell>
                  <TableCell>{prestation.nom_client}</TableCell>
                  <TableCell>{new Date(prestation.date).toLocaleDateString()}</TableCell>
                  <TableCell>{prestation.telephone || "-"}</TableCell>
                  <TableCell>{prestation.prix.toLocaleString()} GNF</TableCell>
                  <TableCell>{prestation.quantite}</TableCell>
                  <TableCell className="font-semibold">{(prestation.prix * prestation.quantite).toLocaleString()} GNF</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEdit(prestation)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(prestation.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Modifier la prestation" : "Nouvelle prestation"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nom_p" className="text-right">Prestation</Label>
              <Input
                id="nom_p"
                value={currentPrestation.nom_prestation}
                onChange={(e) => setCurrentPrestation({ ...currentPrestation, nom_prestation: e.target.value })}
                className="col-span-3"
                placeholder="Ex: Maintenance Informatique"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="client" className="text-right">Client</Label>
              <Input
                id="client"
                value={currentPrestation.nom_client}
                onChange={(e) => setCurrentPrestation({ ...currentPrestation, nom_client: e.target.value })}
                className="col-span-3"
                placeholder="Nom du client"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">Date</Label>
              <Input
                id="date"
                type="date"
                value={currentPrestation.date}
                onChange={(e) => setCurrentPrestation({ ...currentPrestation, date: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tel" className="text-right">Téléphone</Label>
              <Input
                id="tel"
                value={currentPrestation.telephone}
                onChange={(e) => setCurrentPrestation({ ...currentPrestation, telephone: e.target.value })}
                className="col-span-3"
                placeholder="Ex: +224 6XX XX XX XX"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="prix" className="text-right">Prix Unit.</Label>
              <Input
                id="prix"
                type="number"
                value={currentPrestation.prix}
                onChange={(e) => setCurrentPrestation({ ...currentPrestation, prix: parseFloat(e.target.value) })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="qte" className="text-right">Quantité</Label>
              <Input
                id="qte"
                type="number"
                value={currentPrestation.quantite}
                onChange={(e) => setCurrentPrestation({ ...currentPrestation, quantite: parseInt(e.target.value) })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Chargement..." : isEditing ? "Enregistrer les modifications" : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
