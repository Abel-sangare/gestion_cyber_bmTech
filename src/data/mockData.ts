// Mock data for BMTech Admin Dashboard

export interface Student {
  id: number;
  matricule: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  statut: "actif" | "inactif" | "diplômé";
  photo?: string;
}

export interface User {
  id: number;
  nom: string;
  email: string;
  role: "Admin" | "Super Admin" | "Enseignant";
  statut: "actif" | "inactif";
}

export interface Formation {
  id: number;
  nom: string;
  duree: string;
  prix: number;
  inscrits: number;
  description: string;
}

export interface Inscription {
  id: number;
  etudiant: string;
  formation: string;
  date: string;
  statut: "En cours" | "Validée" | "Annulée";
  prix: number;
}

export interface Paiement {
  id: number;
  etudiant: string;
  formation: string;
  montantTotal: number;
  montantPaye: number;
  resteAPayer: number;
  statut: "Soldé" | "Non soldé";
}

export interface EmploiTemps {
  id: number;
  formation: string;
  enseignant: string;
  jour: string;
  horaire: string;
  salle: string;
}

export const students: Student[] = [
  { id: 1, matricule: "BM-2024-001", nom: "Diallo", prenom: "Mamadou", email: "mamadou.diallo@email.com", telephone: "+224 622 11 22 33", statut: "actif" },
  { id: 2, matricule: "BM-2024-002", nom: "Camara", prenom: "Aissatou", email: "aissatou.camara@email.com", telephone: "+224 655 44 55 66", statut: "actif" },
  { id: 3, matricule: "BM-2024-003", nom: "Barry", prenom: "Ibrahima", email: "ibrahima.barry@email.com", telephone: "+224 628 77 88 99", statut: "inactif" },
  { id: 4, matricule: "BM-2024-004", nom: "Bah", prenom: "Fatoumata", email: "fatoumata.bah@email.com", telephone: "+224 664 00 11 22", statut: "diplômé" },
  { id: 5, matricule: "BM-2024-005", nom: "Sow", prenom: "Ousmane", email: "ousmane.sow@email.com", telephone: "+224 621 33 44 55", statut: "actif" },
  { id: 6, matricule: "BM-2024-006", nom: "Keita", prenom: "Mariama", email: "mariama.keita@email.com", telephone: "+224 657 66 77 88", statut: "actif" },
  { id: 7, matricule: "BM-2024-007", nom: "Condé", prenom: "Mohamed", email: "mohamed.conde@email.com", telephone: "+224 622 99 00 11", statut: "inactif" },
  { id: 8, matricule: "BM-2024-008", nom: "Touré", prenom: "Kadiatou", email: "kadiatou.toure@email.com", telephone: "+224 666 22 33 44", statut: "actif" },
];

export const users: User[] = [
  { id: 1, nom: "Admin Principal", email: "admin@bmtech.com", role: "Super Admin", statut: "actif" },
  { id: 2, nom: "Jean Dupont", email: "jean.dupont@bmtech.com", role: "Admin", statut: "actif" },
  { id: 3, nom: "Marie Martin", email: "marie.martin@bmtech.com", role: "Enseignant", statut: "actif" },
  { id: 4, nom: "Pierre Durand", email: "pierre.durand@bmtech.com", role: "Enseignant", statut: "inactif" },
  { id: 5, nom: "Sophie Bernard", email: "sophie.bernard@bmtech.com", role: "Admin", statut: "actif" },
];

export const formations: Formation[] = [
  { id: 1, nom: "Développement Web Full Stack", duree: "6 mois", prix: 1500000, inscrits: 24, description: "HTML, CSS, JavaScript, React, Node.js, bases de données" },
  { id: 2, nom: "Python & Data Science", duree: "4 mois", prix: 1200000, inscrits: 18, description: "Python, Pandas, Machine Learning, Visualisation" },
  { id: 3, nom: "Administration Réseau", duree: "3 mois", prix: 900000, inscrits: 15, description: "Cisco, Linux, Sécurité réseau, Cloud" },
  { id: 4, nom: "Design UI/UX", duree: "3 mois", prix: 800000, inscrits: 12, description: "Figma, Adobe XD, Prototypage, Design Thinking" },
  { id: 5, nom: "Cybersécurité", duree: "5 mois", prix: 1400000, inscrits: 10, description: "Ethical Hacking, Pentest, Sécurité offensive" },
  { id: 6, nom: "Bureautique Avancée", duree: "2 mois", prix: 500000, inscrits: 30, description: "Word, Excel avancé, PowerPoint, Access" },
];

export const inscriptions: Inscription[] = [
  { id: 1, etudiant: "Mamadou Diallo", formation: "Développement Web Full Stack", date: "2024-09-15", statut: "Validée", prix: 1500000 },
  { id: 2, etudiant: "Aissatou Camara", formation: "Python & Data Science", date: "2024-09-20", statut: "Validée", prix: 1200000 },
  { id: 3, etudiant: "Ibrahima Barry", formation: "Administration Réseau", date: "2024-10-01", statut: "Annulée", prix: 900000 },
  { id: 4, etudiant: "Fatoumata Bah", formation: "Design UI/UX", date: "2024-08-10", statut: "Validée", prix: 800000 },
  { id: 5, etudiant: "Ousmane Sow", formation: "Cybersécurité", date: "2024-10-05", statut: "En cours", prix: 1400000 },
  { id: 6, etudiant: "Mariama Keita", formation: "Développement Web Full Stack", date: "2024-10-10", statut: "En cours", prix: 1500000 },
  { id: 7, etudiant: "Mohamed Condé", formation: "Bureautique Avancée", date: "2024-09-25", statut: "Validée", prix: 500000 },
  { id: 8, etudiant: "Kadiatou Touré", formation: "Python & Data Science", date: "2024-10-12", statut: "En cours", prix: 1200000 },
];

export const paiements: Paiement[] = [
  { id: 1, etudiant: "Mamadou Diallo", formation: "Développement Web Full Stack", montantTotal: 1500000, montantPaye: 1500000, resteAPayer: 0, statut: "Soldé" },
  { id: 2, etudiant: "Aissatou Camara", formation: "Python & Data Science", montantTotal: 1200000, montantPaye: 800000, resteAPayer: 400000, statut: "Non soldé" },
  { id: 3, etudiant: "Fatoumata Bah", formation: "Design UI/UX", montantTotal: 800000, montantPaye: 800000, resteAPayer: 0, statut: "Soldé" },
  { id: 4, etudiant: "Ousmane Sow", formation: "Cybersécurité", montantTotal: 1400000, montantPaye: 700000, resteAPayer: 700000, statut: "Non soldé" },
  { id: 5, etudiant: "Mariama Keita", formation: "Développement Web Full Stack", montantTotal: 1500000, montantPaye: 500000, resteAPayer: 1000000, statut: "Non soldé" },
  { id: 6, etudiant: "Mohamed Condé", formation: "Bureautique Avancée", montantTotal: 500000, montantPaye: 500000, resteAPayer: 0, statut: "Soldé" },
];

export const emploiTemps: EmploiTemps[] = [
  { id: 1, formation: "Développement Web Full Stack", enseignant: "Marie Martin", jour: "Lundi", horaire: "08:00 - 12:00", salle: "Salle A1" },
  { id: 2, formation: "Développement Web Full Stack", enseignant: "Marie Martin", jour: "Mercredi", horaire: "14:00 - 18:00", salle: "Salle A1" },
  { id: 3, formation: "Python & Data Science", enseignant: "Pierre Durand", jour: "Mardi", horaire: "08:00 - 12:00", salle: "Salle B2" },
  { id: 4, formation: "Python & Data Science", enseignant: "Pierre Durand", jour: "Jeudi", horaire: "14:00 - 18:00", salle: "Salle B2" },
  { id: 5, formation: "Administration Réseau", enseignant: "Sophie Bernard", jour: "Lundi", horaire: "14:00 - 18:00", salle: "Labo Réseau" },
  { id: 6, formation: "Design UI/UX", enseignant: "Jean Dupont", jour: "Vendredi", horaire: "08:00 - 12:00", salle: "Salle C3" },
  { id: 7, formation: "Cybersécurité", enseignant: "Sophie Bernard", jour: "Mercredi", horaire: "08:00 - 12:00", salle: "Labo Sécu" },
  { id: 8, formation: "Bureautique Avancée", enseignant: "Jean Dupont", jour: "Mardi", horaire: "14:00 - 18:00", salle: "Salle D4" },
];

export const revenueData = [
  { mois: "Jan", revenus: 4200000 },
  { mois: "Fév", revenus: 3800000 },
  { mois: "Mar", revenus: 5100000 },
  { mois: "Avr", revenus: 4700000 },
  { mois: "Mai", revenus: 5500000 },
  { mois: "Jun", revenus: 4900000 },
  { mois: "Jul", revenus: 3200000 },
  { mois: "Aoû", revenus: 2800000 },
  { mois: "Sep", revenus: 6200000 },
  { mois: "Oct", revenus: 5800000 },
  { mois: "Nov", revenus: 6500000 },
  { mois: "Déc", revenus: 5400000 },
];

export const inscriptionsByFormation = [
  { formation: "Web Full Stack", inscrits: 24 },
  { formation: "Python & DS", inscrits: 18 },
  { formation: "Réseau", inscrits: 15 },
  { formation: "UI/UX", inscrits: 12 },
  { formation: "Cybersécurité", inscrits: 10 },
  { formation: "Bureautique", inscrits: 30 },
];
