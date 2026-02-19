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

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { createNotification } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

export default function FormationsPage() {
  const { user } = useAuth();
  const [logiciels, setLogiciels] = useState<any[]>([]);
  const [newLogiciel, setNewLogiciel] = useState({
    code_logiciel: "",
    nom: "",
    description: "",
    duree: "indefini",
    prix: 0,
  });
  const [selectedLogiciel, setSelectedLogiciel] = useState<any | null>(null);
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchLogiciels();
  }, []);

  const fetchLogiciels = async () => {
    const { data, error } = await supabase.from("logiciels").select("*");
    if (error) {
      console.error("Error fetching logiciels:", error);
    } else {
      setLogiciels(data);
    }
  };

  const handleCreate = async () => {
    const { data, error } = await supabase
      .from("logiciels")
      .insert([newLogiciel])
      .select();
    if (error) {
      console.error("Error creating logiciel:", error);
    } else if (data) {
      setLogiciels([...logiciels, data[0]]);
      setCreateDialogOpen(false);
      setNewLogiciel({
        code_logiciel: "",
        nom: "",
        description: "",
        duree: "indefini",
        prix: 0,
      });

      // Notification
      await createNotification(
        `Nouvelle formation ajoutée : ${data[0].nom}.`,
        "formation",
        user?.id
      );
    }
  };

  const handleUpdate = async () => {
    if (!selectedLogiciel) return;
    const { data, error } = await supabase
      .from("logiciels")
      .update(selectedLogiciel)
      .eq("id", selectedLogiciel.id)
      .select();
    if (error) {
      console.error("Error updating logiciel:", error);
    } else if (data) {
      setLogiciels(
        logiciels.map((l) => (l.id === selectedLogiciel.id ? data[0] : l))
      );
      setEditDialogOpen(false);
      setSelectedLogiciel(null);

      // Notification
      await createNotification(
        `Formation ${data[0].nom} mise à jour.`,
        "formation",
        user?.id
      );
    }
  };

  const handleDelete = async (id: number) => {
    const logicielToDelete = logiciels.find(l => l.id === id);
    const { error } = await supabase.from("logiciels").delete().eq("id", id);
    if (error) {
      console.error("Error deleting logiciel:", error);
    } else {
      setLogiciels(logiciels.filter((l) => l.id !== id));
      
      // Notification
      if (logicielToDelete) {
        await createNotification(
          `Formation supprimée : ${logicielToDelete.nom}.`,
          "formation",
          user?.id
        );
      }
    }
  };

  const openEditDialog = (logiciel: any) => {
    setSelectedLogiciel(logiciel);
    setEditDialogOpen(true);
  };

  const dureeOptions = [
    "1semaine",
    "2semaines",
    "3semaines",
    "1mois",
    "2mois",
    "3mois",
    "indefini",
  ];

  // Pagination logic
  const totalPages = Math.ceil(logiciels.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLogiciels = logiciels.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Gestion des Logiciels</h1>

        <Dialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un Logiciel
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un nouveau logiciel</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="code_logiciel" className="text-right">
                  Code
                </Label>
                <Input
                  id="code_logiciel"
                  value={newLogiciel.code_logiciel}
                  onChange={(e) =>
                    setNewLogiciel({ ...newLogiciel, code_logiciel: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nom" className="text-right">
                  Nom
                </Label>
                <Input
                  id="nom"
                  value={newLogiciel.nom}
                  onChange={(e) =>
                    setNewLogiciel({ ...newLogiciel, nom: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Input
                  id="description"
                  value={newLogiciel.description}
                  onChange={(e) =>
                    setNewLogiciel({ ...newLogiciel, description: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="duree" className="text-right">
                  Durée
                </Label>
                <Select
                  value={newLogiciel.duree}
                  onValueChange={(value) =>
                    setNewLogiciel({ ...newLogiciel, duree: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selectionner une durée" />
                  </SelectTrigger>
                  <SelectContent>
                    {dureeOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="prix" className="text-right">
                  Prix
                </Label>
                <Input
                  id="prix"
                  type="number"
                  value={newLogiciel.prix}
                  onChange={(e) =>
                    setNewLogiciel({
                      ...newLogiciel,
                      prix: parseFloat(e.target.value),
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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Nom</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Durée</TableHead>
            <TableHead>Prix</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedLogiciels.map((logiciel) => (
            <TableRow key={logiciel.id}>
              <TableCell>{logiciel.code_logiciel}</TableCell>
              <TableCell>{logiciel.nom}</TableCell>
              <TableCell>{logiciel.description}</TableCell>
              <TableCell>{logiciel.duree}</TableCell>
              <TableCell>{logiciel.prix}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(logiciel)}>
                    Modifier
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(logiciel.id)}>
                    Supprimer
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
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

      {selectedLogiciel && (
        <Dialog open={isEditDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifier le logiciel</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_code_logiciel" className="text-right">
                  Code
                </Label>
                <Input
                  id="edit_code_logiciel"
                  value={selectedLogiciel.code_logiciel}
                  onChange={(e) =>
                    setSelectedLogiciel({
                      ...selectedLogiciel,
                      code_logiciel: e.target.value,
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_nom" className="text-right">
                  Nom
                </Label>
                <Input
                  id="edit_nom"
                  value={selectedLogiciel.nom}
                  onChange={(e) =>
                    setSelectedLogiciel({ ...selectedLogiciel, nom: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_description" className="text-right">
                  Description
                </Label>
                <Input
                  id="edit_description"
                  value={selectedLogiciel.description}
                  onChange={(e) =>
                    setSelectedLogiciel({
                      ...selectedLogiciel,
                      description: e.target.value,
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_duree" className="text-right">
                  Durée
                </Label>
                <Select
                  value={selectedLogiciel.duree}
                  onValueChange={(value) =>
                    setSelectedLogiciel({ ...selectedLogiciel, duree: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selectionner une durée" />
                  </SelectTrigger>
                  <SelectContent>
                    {dureeOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_prix" className="text-right">
                  Prix
                </Label>
                <Input
                  id="edit_prix"
                  type="number"
                  value={selectedLogiciel.prix}
                  onChange={(e) =>
                    setSelectedLogiciel({
                      ...selectedLogiciel,
                      prix: parseFloat(e.target.value),
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
