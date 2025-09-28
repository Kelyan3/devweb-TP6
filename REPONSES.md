# REPONSES.MD

## Partie I

### 1. Donner la commande `httpie` correspondant à la commande `curl` [donnée par la doc](http://localhost:8080/api-docs/#/shortener/post_) pour la route `POST`.

La documentation propose cette commande pour `curl` :
```sh
curl -X 'POST' \
  'http://localhost:8080/api-v1/' \
  -H 'accept: */*' \
  -H 'Content-Type: application/json' \
  -d '{
  "url": "https://perdu.com"
}'
```

L'équivalent HTTPie de cette command est :
```sh
http POST http://localhost:8080/api-v1/ url=https://perdu.com
```

### 2. Démarrer l'application en mode production avec `npm run prod` puis en mode développement avec `npm run dev`. Donner les principales différences entre les deux modes.

Pour démarrer en mode production : `npm run prod`
Pour démarrer en mode développement : `npm run dev`

Leurs différences sont :
- En mode développement, lors du moindre changement de code dans un fichier, grâce à nodemon, le serveur redémarre automatiquement.
- En mode production, l'utilisateur doit manuellement redémarrer le serveur pour appliquer les modifications.
- La variable d'environnement "NODE_ENV" change de valeur :
    * `development` en mode développement.
    * `production` en mode production.

### 3. Donner le script npm qui permet de formatter automatiquement tous les fichiers .mjs

Dans le fichier package.json, il faut ajouter cette ligne :
```json
"scripts": {
    ...,
    "format": "prettier --write \"**/*.mjs\""
}
```

### 4. Les réponses HTTP contiennent une en-tête X-Powered-By. Donner la configuration Express à modifier pour qu'elle n'apparaisse plus.

Dans le fichier `server-http.mjs`, il faut ajouter cette ligne de code :
```javascript
app.disable("x-powered-by");
```

### 5. Créer un nouveau middleware (niveau application) qui ajout un header X-API-version avec la version de l'application. Donner le code.

```javascript
app.use((request, response, next) => {
    response.setHeader("X-API-version", 'v1');
    next();
});
```

### 6. Trouver un middleware Express qui permet de répondre aux requêtes favicon.ico avec static/logo_univ_16.png. Donner le code.

Pour cela, il faut installer le package Node suivant :
```sh
npm install serve-favicon
```
Ensuite, dans le fichier `server-http.mjs`, il faut ajouter ces lignes de code :

```javascript
import favicon from "serve-favicon"
// Lignes de codes.
app.use(favicon(path.join(_directoryName, "static", "logo_univ_16.png")));
// Lignes de codes.
```

### 7. Donner les liens vers la documentation du driver SQLite utilisé dans l'application.

Documentation de [SQLite3](https://github.com/TryGhost/node-sqlite3/wiki/API)
Documentation de [SQLite-Wrapper](https://github.com/kriasoft/node-sqlite#readme)

### 8. Indiquer à quels moments la connexion à la base de données est ouverte et quand elle est fermée.

Lors de l'appel de la fonction ```initiateDatabase```, lorsque la fonction ```startServer()``` est exécutée. Pour la fermeture de la base de données, elle se fait uniquement lorsque le serveur s'éteint.

### 9. Avec un navigateur en mode privé, visiter une première fois http://localhost:8080/, puis une deuxième. Ensuite rechargez avec `Ctrl+Shift+R`. Conclure sur la gestion du cache par Express.

Dans un nouvel onglet dans la navigation en mode privé, on obtient le code HTTP 200. La deuxième visite, on obtient le code HTTP 304. Maintenant, en utilisant le raccourci `Ctrl+Shift+R`, ce rechargement forcée nous donne le code HTTP 200 sur la première et la deuxième visite.

Express sert les fichiers statiques avec des en-têtes de cache par défaut. Donc le navigateur peut les mettre en cache.

### 10. Ouvrir deux instances de l'application, une sur le port 8080 avec `npm run dev` et une autre sur le port 8081 avec la commande `cross-env PORT=8081 NODE_ENV=development npx nodemon server-http.mjs`. Créer un lien sur la première instance http://localhost:8080 et ensuite un autre sur la seconde instance http://localhost:8081. Les liens de l'un doivent être visibles avec l'autre. Expliquer pourquoi.

Les liens créés sur une instance sont visibles sur l'autre car les deux serveurs (sur le port 8080 et le port 8081) utilisent le même fichier de base de données SQLite. Les données seront donc partagées entre les deux instances.
