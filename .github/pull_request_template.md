# Pull Request – Student Course API

## Description

Les changements apportés dans cette Pull Request.

Exemples :

- Amélioration des tests
- Ajout ou correction de tests d’intégration
- Amélioration du linting ou configuration ESLint / Prettier
- Mise à jour du Swagger (`swagger.json` / `swaggerDef.js`)

## Contexte

Explique **pourquoi** ces changements ont été faits.  
Exemples :

- Mise à jour du comportement suite à un test échoué
- Ajout de documentation Swagger manquante
- Intégration de Codacy comme outil d’analyse statique

## Tests effectués

Décris comment tu as validé ton code avant de soumettre la pull request :

- [ ] Tests unitaires (`npm test`)
- [ ] Tests d’intégration (`app.test.js`, `studentsController.test.js`, `coursesController.test.js`)
- [ ] Vérification ESLint (`npm run lint`)
- [ ] Vérification Prettier (`npm run format`)
- [ ] Documentation Swagger testée sur `/api-docs`
- [ ] Analyse Codacy vérifiée (aucune erreur critique)

## Checklist avant validation

Merci de t’assurer que tous les points suivants sont respectés avant la revue :

- [ ] Le code respecte les règles ESLint et Prettier
- [ ] Les commits ont des messages clairs et significatifs
- [ ] Tous les tests Jest passent sans erreur
- [ ] Aucun `console.log` inutile
- [ ] Le Swagger est à jour et cohérent avec les routes
- [ ] Le coverage des tests est supérieur à 80 %
- [ ] Aucune duplication de code détectée par Codacy

## Liens associés

Issue liée : # (si applicable)  
Documentation Swagger : `/api-docs`

## Notes supplémentaires

Ajoute ici toute information technique ou de contexte utile à la relecture.

Exemples :

- Modifications sur `storage.js`
- Nouveau test ajouté pour gérer les doublons d’email
- Ajustement du comportement des erreurs 404 / 400
- Nettoyage du code avant livraison finale
