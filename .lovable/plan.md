

# BMTech Admin Dashboard

## Vue d'ensemble
Un tableau de bord administratif moderne et professionnel pour le centre de formation informatique BMTech. Interface SaaS premium avec thème bleu/blanc/gris clair, entièrement responsive et prête à être connectée à un backend Django.

---

## Layout Principal

### Sidebar fixe à gauche
- Logo BMTech en haut
- Navigation avec icônes Lucide : Dashboard, Utilisateurs, Étudiants, Logiciels, Inscriptions, Emplois du temps, Paiements, Paramètres
- Élément actif mis en surbrillance en bleu
- Réductible en mode mini (icônes uniquement)

### Topbar supérieure
- Titre de la page courante
- Icône de notification avec badge compteur
- Avatar administrateur avec menu déroulant (Profil, Déconnexion)
- Bouton toggle sidebar sur mobile

---

## Pages

### 1. Dashboard (Page d'accueil)
- **4 cartes KPI** : Étudiants total, Inscriptions total, Revenus totaux, Paiements en attente — avec icônes colorées et variation en pourcentage
- **Graphique des revenus mensuels** (courbe via Recharts)
- **Graphique des inscriptions par formation** (barres via Recharts)
- **Tableau des inscriptions récentes** (5 dernières)

### 2. Gestion des Utilisateurs
- Tableau avec colonnes : Nom, Email, Rôle (Admin/Super Admin/Enseignant), Statut
- Badges colorés par rôle
- Actions : Voir, Modifier, Supprimer
- Bouton "Ajouter utilisateur" + modal de création

### 3. Gestion des Étudiants
- Barre de recherche + filtres par statut
- Tableau avec : Matricule, Nom, Prénom, Email, Téléphone, Statut (badge), Actions
- Bouton "Ajouter étudiant" ouvrant un modal avec formulaire complet (infos personnelles, upload photo, extrait de naissance)
- Pagination intégrée

### 4. Logiciels (Formations)
- Grille de cards modernes avec : Nom de la formation, Durée, Prix, nombre d'inscrits
- Bouton "Ajouter formation" + modal avec validation des champs
- Hover effects et shadow élégants

### 5. Inscriptions
- Tableau avec : Étudiant, Formation, Date d'inscription, Statut, Prix
- Filtres par statut (En cours, Validée, Annulée)
- Badges colorés selon le statut

### 6. Paiements
- Tableau avec : Étudiant, Formation, Montant total, Montant payé, Reste à payer, Statut
- Badges : Vert = Soldé, Rouge = Non soldé
- Bouton "Ajouter paiement" + modal
- Résumé financier en haut de page

### 7. Emplois du temps
- Vue tableau/liste des créneaux horaires par formation
- Colonnes : Formation, Enseignant, Jour, Horaire, Salle

### 8. Paramètres
- Section profil administrateur
- Toggle mode sombre (dark mode)

---

## Design & UX
- **Thème** : Bleu primaire (#2563EB), fond blanc/gris très clair, textes gris foncé
- **Cards** : Ombres douces (shadow-lg), border-radius xl, transitions hover
- **Tableaux** : Lignes alternées, hover, pagination stylisée
- **Badges** : Colorés selon le contexte (statut, rôle)
- **Dark mode** : Toggle disponible dans les paramètres
- **Responsive** : Sidebar en drawer sur mobile, grilles adaptatives
- **Données** : Données fictives (mock) réalistes, prêtes à être remplacées par des appels API Django

