# Termino

Application web pour centraliser des questions terminologiques, générer un document Word (.docx) prêt à l'envoi, et préparer un email standardisé.

## Objectif

Termino permet de:

- saisir les métadonnées d'un projet (TRSB, client, échéance);
- ajouter une ou plusieurs questions terminologiques structurées;
- exporter un document `.docx` au format tableau;
- générer un lien `mailto:` prérempli pour l'envoi.

## Stack technique

- React 19 + TypeScript
- Vite
- React Hook Form + Zod
- Tailwind CSS 4
- docx + file-saver
- shadcn/ui

## Démarrage rapide

Prérequis:

- Node.js 20+
- npm

Installation et lancement:

```bash
npm install
npm run dev
```

L'application sera disponible sur l'URL affichée par Vite (en général http://localhost:5173).

## Scripts utiles

```bash
npm run dev      # démarrage en local
npm run build    # build de production
npm run preview  # prévisualisation du build
npm run lint     # lint ESLint
```

## Utilisation

1. Renseigner le champ Projet (ou compléter manuellement TRSB, Client et Échéance).
2. Ajouter les lignes de questions terminologiques.
3. Cliquer sur Générer le DOCX.
4. Cliquer sur Préparer l'email pour ouvrir le client mail avec un sujet prérempli.

## Format attendu pour le champ Projet

Le parseur reconnaît notamment:

- un identifiant TRSB au format `NN-NNNNN-NN`;
- une partie client avant le TRSB;
- une échéance après `Livraison/Deadline` (si présente).

Exemple:

```text
Yelda.ai 26-12345-01 | Temps alloué/Time 3:00 | PE | Livraison/Deadline 2026-08-15 0:00 EDT
```

## Structure du document généré

Le `.docx` contient:

- un tableau d'informations (TRSB, client, échéance);
- un tableau des questions avec les colonnes:
  - Document/page
  - Terme ou expression
  - Question
  - Suggestion
  - Contexte (phrase complète)
  - Réponse

Nom de fichier généré: `Termino_<TRSB>.docx`

## Structure du projet

```text
src/
  App.tsx
  lib/
    schema.ts
    parseProjet.ts
    generateDocx.ts
    generateMailto.ts
```

## Qualité et contribution

- validation formulaire via Zod;
- gestion des champs dynamiques via React Hook Form;
- lint via ESLint.

Pour contribuer:

```bash
git checkout -b feat/ma-fonctionnalite
# modifier le code
npm run lint
npm run build
git add .
git commit -m "feat: description"
git push -u origin feat/ma-fonctionnalite
```

## Licence

Projet privé interne.
