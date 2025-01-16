# Modèle de données


```mermaid
erDiagram
    Applications }o --o| Applications : "Est parent de"
    Applications }o --o| Tags : "Fait partie de"
    Applications }o --o| Purpose : "A pour objectif"
    Applications }o --o| Conformity : "S'applique à"
    Applications }o --o| Acteur : "Est partie prenante de"

    Applications {
         uuid id
         string label               
         string shortName
         string description
         enum lifecycldeId
    }
     
    Tags {
         uuid id
         string label               
    }
     
    Purpose {
         uuid id
         string label               
    }

    Conformity {
         uuid id
         string label               
    }

    Acteur {
         uuid id
         string label               
    }

    Correction {
         uuid id
         string userId
         string label               
    }
```

## Dictionaire
| Objet | Id | Nom | Description |
|--|--|--|--|
| Application | id | Identifiant unique | Identifiant unique de l'application dans le referentiel des applications |
| Application | label | Nom | Nom de l'application - C'est le champ utilisé pour la recherche |
| Application | shortName | Nom abrégé | Nom abrégé de l'application |
| Application | description | Description | Description de l'application |
| Application | lifecycldeId | Cycle de vie Statut | Indicateur indiquant si l'application est en construction, en production ou décomissioné |
| Tags | tags |label | Nom du tag|
| Purposes | objectifs |label | Nom du tag|
