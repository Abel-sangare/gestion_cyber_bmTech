import { useState, useEffect, useRef, ChangeEvent } from "react";
import { Plus, Eye, Pencil, Trash2, Search, Loader2, Upload, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid'; // For unique file names
import { createNotification } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface Student {
  id: number;
  matricule: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  adresse?: string;
  date_naissance?: string;
  date_inscription?: string;
  statut: "actif" | "inactif" | "suspendu";
  photo?: string; // URL
  extrait_naissance?: string; // URL
}

const statutBadge = (statut: string) => {
  const map: Record<string, "default" | "secondary" | "destructive"> = {
    actif: "default",
    inactif: "destructive",
    suspendu: "secondary",
  };
  return map[statut] || "secondary";
};

export default function StudentsPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatut, setFilterStatut] = useState("all");
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  
  const emptyStudent: Partial<Student> = {
    matricule: "",
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    adresse: "",
    date_naissance: "",
    statut: "actif",
    photo: "",
    extrait_naissance: "",
  };

  const [currentStudent, setCurrentStudent] = useState<Partial<Student>>(emptyStudent);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [extraitNaissanceFile, setExtraitNaissanceFile] = useState<File | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const extraitNaissanceInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('etudiants')
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error;
      setStudents(data || []);
    } catch (error: any) {
      toast.error("Erreur lors du chargement des étudiants: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file: File, folder: string) => {
    const fileExtension = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const filePath = `${folder}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('photos') // Make sure this bucket exists in Supabase
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw error;
    }
    
    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('photos')
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  };

  const handleSave = async () => {
    if (!currentStudent?.nom || !currentStudent?.prenom || !currentStudent?.email || !currentStudent?.matricule || !currentStudent?.telephone || !currentStudent?.adresse || !currentStudent?.date_naissance || !currentStudent?.statut) {
      toast.error("Le nom, prénom, email, matricule, téléphone, adresse, date de naissance et statut sont obligatoires.");
      return;
    }

    setIsSubmitting(true);
    let photoUrl = currentStudent.photo;
    let extraitNaissanceUrl = currentStudent.extrait_naissance;

    try {
      if (photoFile) {
        toast.info("Téléchargement de la photo...");
        photoUrl = await uploadFile(photoFile, 'photos');
        toast.success("Photo téléchargée avec succès.");
      }
      if (extraitNaissanceFile) {
        toast.info("Téléchargement de l'extrait de naissance...");
        extraitNaissanceUrl = await uploadFile(extraitNaissanceFile, 'extraits');
        toast.success("Extrait de naissance téléchargé avec succès.");
      }

      const studentDataToSave = {
        matricule: currentStudent.matricule,
        nom: currentStudent.nom,
        prenom: currentStudent.prenom,
        email: currentStudent.email,
        telephone: currentStudent.telephone,
        adresse: currentStudent.adresse,
        date_naissance: currentStudent.date_naissance,
        statut: currentStudent.statut || 'actif',
        photo: photoUrl,
        extrait_naissance: extraitNaissanceUrl,
      };

      if (currentStudent.id) {
        const { error } = await supabase
          .from('etudiants')
          .update(studentDataToSave)
          .eq('id', currentStudent.id);
        
        if (error) throw error;
        toast.success("Étudiant mis à jour");
        await createNotification(
          `L'étudiant ${currentStudent.prenom} ${currentStudent.nom} a été mis à jour.`,
          "etudiant",
          user?.id
        );
      } else {
        const { error } = await supabase
          .from('etudiants')
          .insert([studentDataToSave]);
        
        if (error) throw error;
        toast.success("Étudiant ajouté avec succès");
        await createNotification(
          `Nouvel étudiant inscrit : ${currentStudent.prenom} ${currentStudent.nom}.`,
          "etudiant",
          user?.id
        );
      }
      
      setIsDialogOpen(false);
      setPhotoFile(null);
      setExtraitNaissanceFile(null);
      fetchStudents();
    } catch (error: any) {
      console.error("Supabase Error:", error);
      toast.error("Erreur: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    const studentToDelete = students.find(s => s.id === id);
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet étudiant ?")) return;

    try {
      const { error } = await supabase
        .from('etudiants')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success("Étudiant supprimé");
      
      if (studentToDelete) {
        await createNotification(
          `L'étudiant ${studentToDelete.prenom} ${studentToDelete.nom} a été supprimé.`,
          "etudiant",
          user?.id
        );
      }
      fetchStudents();
    } catch (error: any) {
      toast.error("Erreur lors de la suppression: " + error.message);
    }
  };

  const openAddDialog = () => {
    setCurrentStudent(emptyStudent);
    setPhotoFile(null);
    setExtraitNaissanceFile(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (student: Student) => {
    setCurrentStudent({
      ...student,
      date_naissance: student.date_naissance ? student.date_naissance.split('T')[0] : '',
    });
    setPhotoFile(null); // Clear file input on edit
    setExtraitNaissanceFile(null); // Clear file input on edit
    setIsDialogOpen(true);
  };

  const openDetailDialog = (student: Student) => {
    setCurrentStudent(student);
    setIsDetailOpen(true);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, field: 'photo' | 'extrait_naissance') => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (field === 'photo') {
        setPhotoFile(file);
      } else {
        setExtraitNaissanceFile(file);
      }
    } else {
      if (field === 'photo') {
        setPhotoFile(null);
      } else {
        setExtraitNaissanceFile(null);
      }
    }
  };

  const getFilePreviewUrl = (file: File | null) => (file ? URL.createObjectURL(file) : null);

  const filtered = students.filter((s) => {
    const matchSearch = `${s.nom} ${s.prenom} ${s.matricule} ${s.email} ${s.telephone} ${s.adresse}`.toLowerCase().includes(search.toLowerCase());
    const matchStatut = filterStatut === "all" || s.statut === filterStatut;
    return matchSearch && matchStatut;
  });

  // Pagination logic
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStudents = filtered.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold">Étudiants</h2>
        <Button onClick={openAddDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter étudiant
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Rechercher par nom, matricule, email, téléphone ou adresse..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="pl-9" 
          />
        </div>
        <Select value={filterStatut} onValueChange={setFilterStatut}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Statut" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="actif">Actif</SelectItem>
            <SelectItem value="inactif">Inactif</SelectItem>
            <SelectItem value="suspendu">Suspendu</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="shadow-lg rounded-xl overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Matricule</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Prénom</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead className="hidden lg:table-cell">Téléphone</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow key="loading-row">
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span>Chargement des étudiants...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow key="empty-row">
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    <span>Aucun étudiant trouvé</span>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedStudents.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono text-xs">{s.matricule}</TableCell>
                    <TableCell className="font-medium">{s.nom}</TableCell>
                    <TableCell>{s.prenom}</TableCell>
                    <TableCell className="hidden md:table-cell">{s.email}</TableCell>
                    <TableCell className="hidden lg:table-cell">{s.telephone}</TableCell>
                    <TableCell><Badge variant={statutBadge(s.statut)}>{s.statut}</Badge></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openDetailDialog(s)}><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(s)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(s.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <Pagination>
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

      {/* Dialog Formulaire (Ajout/Edition) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg flex flex-col max-h-[calc(100vh-4rem)]"> {/* Added flex-col and max-h */}
          <DialogHeader className="p-6 pb-0"> {/* Added padding to header */}
            <DialogTitle>{currentStudent?.id ? "Modifier l'étudiant" : "Nouvel étudiant"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 p-6 overflow-y-auto flex-grow sm:grid-cols-2"> {/* Added p-6, overflow-y-auto, flex-grow */}
            <div>
              <Label htmlFor="matricule">Matricule</Label>
              <Input 
                id="matricule" 
                value={currentStudent?.matricule || ""} 
                onChange={(e) => setCurrentStudent({...currentStudent, matricule: e.target.value})}
                placeholder="Ex: BM-2024-1234"
                required
              />
            </div>
            <div>
              <Label htmlFor="nom">Nom</Label>
              <Input 
                id="nom" 
                value={currentStudent?.nom || ""} 
                onChange={(e) => setCurrentStudent({...currentStudent, nom: e.target.value})}
                placeholder="Ex: Diallo" 
                required
              />
            </div>
            <div>
              <Label htmlFor="prenom">Prénom</Label>
              <Input 
                id="prenom" 
                value={currentStudent?.prenom || ""} 
                onChange={(e) => setCurrentStudent({...currentStudent, prenom: e.target.value})}
                placeholder="Ex: Mamadou" 
                required
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={currentStudent?.email || ""} 
                onChange={(e) => setCurrentStudent({...currentStudent, email: e.target.value})}
                placeholder="email@exemple.com" 
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Téléphone</Label>
              <Input 
                id="phone" 
                value={currentStudent?.telephone || ""} 
                onChange={(e) => setCurrentStudent({...currentStudent, telephone: e.target.value})}
                placeholder="+224 6XX XX XX XX" 
              />
            </div>
            <div>
              <Label htmlFor="date_naissance">Date de Naissance</Label>
              <Input 
                id="date_naissance" 
                type="date" 
                value={currentStudent?.date_naissance || ""} 
                onChange={(e) => setCurrentStudent({...currentStudent, date_naissance: e.target.value})}
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="adresse">Adresse</Label>
              <Textarea 
                id="adresse" 
                value={currentStudent?.adresse || ""} 
                onChange={(e) => setCurrentStudent({...currentStudent, adresse: e.target.value})}
                placeholder="Adresse complète de l'étudiant" 
              />
            </div>
            {/* Photo Upload */}
            <div>
              <Label htmlFor="photo">Photo</Label>
              <div className="flex items-center space-x-2">
                <Input 
                  id="photo" 
                  type="file" 
                  accept="image/*"
                  ref={photoInputRef}
                  onChange={(e) => handleFileChange(e, 'photo')}
                  className="col-span-3"
                />
                {(currentStudent.photo || photoFile) && (
                  <Button variant="outline" size="icon" onClick={() => {
                    setPhotoFile(null);
                    setCurrentStudent(prev => ({ ...prev, photo: undefined }));
                    if (photoInputRef.current) photoInputRef.current.value = '';
                  }}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {(getFilePreviewUrl(photoFile) || currentStudent.photo) && (
                <div className="mt-2 w-24 h-24 relative">
                  <img 
                    src={getFilePreviewUrl(photoFile) || currentStudent.photo} 
                    alt="Prévisualisation photo" 
                    className="w-full h-full object-cover rounded-md"
                  />
                </div>
              )}
            </div>

            {/* Extrait de Naissance Upload */}
            <div>
              <Label htmlFor="extrait_naissance">Extrait de Naissance</Label>
              <div className="flex items-center space-x-2">
                <Input 
                  id="extrait_naissance" 
                  type="file" 
                  accept="image/*,application/pdf"
                  ref={extraitNaissanceInputRef}
                  onChange={(e) => handleFileChange(e, 'extrait_naissance')}
                  className="col-span-3"
                />
                 {(currentStudent.extrait_naissance || extraitNaissanceFile) && (
                  <Button variant="outline" size="icon" onClick={() => {
                    setExtraitNaissanceFile(null);
                    setCurrentStudent(prev => ({ ...prev, extrait_naissance: undefined }));
                    if (extraitNaissanceInputRef.current) extraitNaissanceInputRef.current.value = '';
                  }}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {(getFilePreviewUrl(extraitNaissanceFile) || currentStudent.extrait_naissance) && (
                <div className="mt-2 w-24 h-24 relative">
                  {extraitNaissanceFile?.type.startsWith('image/') || currentStudent.extrait_naissance?.match(/\.(jpeg|jpg|gif|png|webp|svg)$/) ? (
                    <img 
                      src={getFilePreviewUrl(extraitNaissanceFile) || currentStudent.extrait_naissance} 
                      alt="Prévisualisation extrait de naissance" 
                      className="w-full h-full object-cover rounded-md"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-md text-sm text-gray-500">
                      PDF
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="statut">Statut</Label>
              <Select 
                value={currentStudent?.statut || "actif"} 
                onValueChange={(value) => setCurrentStudent({...currentStudent, statut: value as "actif" | "inactif" | "suspendu"})}
              >
                <SelectTrigger id="statut">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="actif">Actif</SelectItem>
                  <SelectItem value="inactif">Inactif</SelectItem>
                  <SelectItem value="suspendu">Suspendu</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {currentStudent?.id ? "Mettre à jour" : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Détails */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Détails de l'étudiant</DialogTitle>
          </DialogHeader>
          {currentStudent && (
            <div className="space-y-4 pt-4">
              <div className="flex justify-center mb-4">
                {currentStudent.photo ? (
                  <img src={currentStudent.photo} alt="Photo de l'étudiant" className="h-24 w-24 rounded-full object-cover" />
                ) : (
                  <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-3xl font-bold text-primary">
                      {currentStudent.nom?.charAt(0)}{currentStudent.prenom?.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 border-t pt-4">
                <div>
                  <p className="text-sm text-muted-foreground">Matricule</p>
                  <p className="font-mono font-medium">{currentStudent.matricule}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Statut</p>
                  <Badge variant={statutBadge(currentStudent.statut || "actif")}>{currentStudent.statut}</Badge>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Nom complet</p>
                  <p className="font-medium">{currentStudent.prenom} {currentStudent.nom}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium truncate">{currentStudent.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Téléphone</p>
                  <p className="font-medium">{currentStudent.telephone || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date de Naissance</p>
                  <p className="font-medium">{currentStudent.date_naissance ? new Date(currentStudent.date_naissance).toLocaleDateString() : "N/A"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Adresse</p>
                  <p className="font-medium">{currentStudent.adresse || "N/A"}</p>
                </div>
                {currentStudent.photo && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Photo</p>
                    <a href={currentStudent.photo} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline break-all">Voir la photo</a>
                  </div>
                )}
                {currentStudent.extrait_naissance && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Extrait de Naissance</p>
                    <a href={currentStudent.extrait_naissance} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline break-all">Voir l'extrait</a>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Date d'inscription</p>
                  <p className="font-medium">{currentStudent.date_inscription ? new Date(currentStudent.date_inscription).toLocaleDateString() : "N/A"}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="mt-4">
            <Button variant="outline" className="w-full" onClick={() => setIsDetailOpen(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
