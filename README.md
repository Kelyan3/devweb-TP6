# Développement Web - Racourcisseur d'URL

## Présentation du projet.

Ce projet est un raccourcisseur d'URL développé en Node.js à l'aide d'Express, de SQLite et d'EJS. Il est constitué d'une API serveur REST afin de raccourcir, consulter et supprimer des liens, ainsi qu'un client AJAX moderne.

## Installation

1. Cloner le dépôt GitHub :
```sh
git clone https://github.com/Kelyan3/devweb-TP6.git
cd devweb-TP6
```

2. Installer les dépendances NodeJS (assurez-vous d'avoir [NodeJS](nodejs.org) installé sur votre machine):
```sh
npm install package.json
```

3. Configurer les variables d'environnement dans `.env` si nécessaire.

4. Lancer l'application (selon le mode que vous désirez) :
- En mode développement :
    ```sh
    npm run dev
    ```
- En mode production :
    ```sh
    npm run prod
    ```

## Utilisation.

- **API V1 | API V2**
  - Documentation interactive : http://localhost:8080/api-docs
  - Exemple de création :
    ```sh
    # Avec HTTPie
    http POST http://localhost:8080/api-v2/ url=https://perdu.com

    # Avec curl
    curl --include --header 'Accept: application/json' --header 'Content-Type: application/json' --request POST http://localhost:8080/api-v1/ --data '{"url": "https://perdu.com"}'
    ```
  - Exemple de suppression :
    ```sh
    # Avec HTTPie
    http DELETE http://localhost:8080/api-v2/abc123 X-API-KEY:RatQak

    # Avec curl
    
    ```

- **Client AJAX**
    - Ouvrir http://localhost:8080/client.html

## Structure du projet

- `database/database.mjs` : gestion de la base de données SQLite
- `router/api-v1.mjs` : routes API v1 (JSON uniquement)
- `router/api-v2.mjs` : routes API v2 (JSON/HTML, suppression sécurisée)
- `static/` : fichiers statiques (client AJAX, CSS, Swagger)
- `views/` : templates EJS pour le rendu HTML
- `config.mjs` : configuration pour le serveur Express.
- `server-http.mjs` : serveur principal Express

## Tags Git

- `reponses` : réponses aux questions du TP
- `api-v1` : version avec API v1 complète
- `api-v2` : version avancée avec JSON et HTML.
- `client-ajax` : version avec client AJAX
- `api-v2-delete` : version avec suppression sécurisée

## Render

Lien vers Render : https://devweb-tp6-tfwr.onrender.com/