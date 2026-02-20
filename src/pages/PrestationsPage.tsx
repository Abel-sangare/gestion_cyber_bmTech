import { useState, useEffect } from "react";
import { PlusCircle, Trash2, Edit, Search, Briefcase, Phone, User, Calendar, DollarSign, Layers } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";

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
    try {
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

        if (error) throw error;
        toast.success("Prestation mise à jour !");
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

        if (error) throw error;
        toast.success("Nouvelle prestation enregistrée !");
      }
      fetchPrestations();
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Voulez-vous vraiment supprimer cette prestation ?")) {
      const { error } = await supabase.from("prestations").delete().eq("id", id);
      if (error) {
        toast.error("Erreur lors de la suppression");
      } else {
        toast.success("Prestation supprimée avec succès");
        setPrestations(prestations.filter((p) => p.id !== id));
      }
    }
  };

  const filteredPrestations = prestations.filter(p => 
    p.nom_prestation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.nom_client.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPrestations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPrestations = filteredPrestations.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const totalRevenu = prestations.reduce((acc, curr) => acc + (curr.prix * curr.quantite || 0), 0);
  const totalActes = prestations.length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Prestations de Services</h1>
          <p className="text-muted-foreground">Gérez et suivez toutes les activités hors formation.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une prestation ou un client..."
              className="pl-9 h-11 border-muted-foreground/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={handleOpenAdd} className="h-11 px-5 gap-2 shadow-sm">
            <PlusCircle className="h-5 w-5" /> Nouveau
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-primary/5 border-primary/10 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" /> Revenu Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{totalRevenu.toLocaleString()} GNF</div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-muted-foreground/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-blue-500" /> Nombre d'actes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalActes}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-muted-foreground/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase flex items-center gap-2">
              <Layers className="h-4 w-4 text-amber-500" /> Moyenne / Prestation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {totalActes > 0 ? Math.round(totalRevenu / totalActes).toLocaleString() : 0} GNF
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table Section */}
      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="font-bold">Prestation</TableHead>
              <TableHead className="font-bold">Client</TableHead>
              <TableHead className="font-bold">Date & Contact</TableHead>
              <TableHead className="font-bold text-center">Qté</TableHead>
              <TableHead className="font-bold">Prix Unitaire</TableHead>
              <TableHead className="font-bold text-right">Total HT</TableHead>
              <TableHead className="text-right font-bold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} className="h-32 text-center text-muted-foreground">Chargement en cours...</TableCell></TableRow>
            ) : paginatedPrestations.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="h-32 text-center text-muted-foreground italic">Aucune donnée trouvée.</TableCell></TableRow>
            ) : (
              paginatedPrestations.map((p) => (
                <TableRow key={p.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-semibold py-4">{p.nom_prestation}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{p.nom_client}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="mr-1 h-3 w-3" /> {new Date(p.date).toLocaleDateString()}
                      </div>
                      {p.telephone && (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Phone className="mr-1 h-3 w-3" /> {p.telephone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="rounded-full px-3">{p.quantite}</Badge>
                  </TableCell>
                  <TableCell>{p.prix.toLocaleString()} GNF</TableCell>
                  <TableCell className="text-right font-bold text-primary">{(p.prix * p.quantite).toLocaleString()} GNF</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => handleOpenEdit(p)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(p.id)}>
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

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination className="pt-2">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1); }} className={currentPage === 1 ? "pointer-events-none opacity-50" : ""} />
            </PaginationItem>
            {[...Array(totalPages)].map((_, i) => (
              <PaginationItem key={i + 1}>
                <PaginationLink href="#" isActive={currentPage === i + 1} onClick={(e) => { e.preventDefault(); handlePageChange(i + 1); }}>{i + 1}</PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext href="#" onClick={(e) => { e.preventDefault(); handlePageChange(currentPage + 1); }} className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Form Dialog - MODERN STYLING */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-6 bg-primary text-primary-foreground">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Briefcase className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-xl">{isEditing ? "Modifier la Prestation" : "Nouvelle Prestation"}</DialogTitle>
                <p className="text-primary-foreground/80 text-xs mt-1">Remplissez les informations ci-dessous pour enregistrer le service.</p>
              </div>
            </div>
          </DialogHeader>
          
          <div className="p-6 grid gap-6 bg-background">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nom_p" className="text-sm font-semibold flex items-center gap-1.5">
                   Service / Prestation <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="nom_p"
                    value={currentPrestation.nom_prestation}
                    onChange={(e) => setCurrentPrestation({ ...currentPrestation, nom_prestation: e.target.value })}
                    className="focus-visible:ring-primary border-muted-foreground/20"
                    placeholder="Ex: Maintenance système"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="client" className="text-sm font-semibold flex items-center gap-1.5">
                   Client <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="client"
                  value={currentPrestation.nom_client}
                  onChange={(e) => setCurrentPrestation({ ...currentPrestation, nom_client: e.target.value })}
                  className="focus-visible:ring-primary border-muted-foreground/20"
                  placeholder="Nom du client"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="text-sm font-semibold flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" /> Date du service
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={currentPrestation.date}
                  onChange={(e) => setCurrentPrestation({ ...currentPrestation, date: e.target.value })}
                  className="focus-visible:ring-primary border-muted-foreground/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tel" className="text-sm font-semibold flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" /> Contact Client
                </Label>
                <Input
                  id="tel"
                  value={currentPrestation.telephone}
                  onChange={(e) => setCurrentPrestation({ ...currentPrestation, telephone: e.target.value })}
                  className="focus-visible:ring-primary border-muted-foreground/20"
                  placeholder="Ex: 6XX XX XX XX"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-muted/30 border border-dashed border-muted-foreground/20">
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="prix" className="text-sm font-semibold">Prix Unitaire (GNF)</Label>
                    <Input
                      id="prix"
                      type="number"
                      value={currentPrestation.prix}
                      onChange={(e) => setCurrentPrestation({ ...currentPrestation, prix: parseFloat(e.target.value) })}
                      className="bg-background border-muted-foreground/20 h-10 font-bold text-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="qte" className="text-sm font-semibold">Quantité</Label>
                    <Input
                      id="qte"
                      type="number"
                      value={currentPrestation.quantite}
                      onChange={(e) => setCurrentPrestation({ ...currentPrestation, quantite: parseInt(e.target.value) })}
                      className="bg-background border-muted-foreground/20 h-10 font-bold"
                    />
                  </div>
               </div>
               <div className="mt-4 pt-3 border-t border-muted-foreground/10 flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">MONTANT TOTAL ESTIMÉ :</span>
                  <span className="text-lg font-black text-primary">{(currentPrestation.prix * currentPrestation.quantite).toLocaleString()} GNF</span>
               </div>
            </div>
          </div>
          
          <DialogFooter className="p-6 bg-muted/20 border-t flex gap-2">
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="px-6">Annuler</Button>
            <Button onClick={handleSubmit} disabled={loading} className="px-8 shadow-md">
              {loading ? "Traitement..." : isEditing ? "Sauvegarder les changements" : "Enregistrer la prestation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
