**Setup ambiente e struttura base**

Clona il repository:

```
git clone <repo-url>
cd project-folder
```

Installa le dipendenze base:

```
npm install express mongoose dotenv
npm install bcryptjs jsonwebtoken joi multer
npm install helmet express-rate-limit cors morgan
npm install nodemon —save-dev (sono 2 trattini prima di save)
```

---

Il seguente è lo Stack suggerito:

- Node.js + Express

- MongoDB + Mongoose • Librerie suggerite:

- bcryptjs → hash password

- jsonwebtoken → JWT auth

- joi → validazione dati

- multer → upload file

- dotenv → gestione variabili d’ambiente

- helmet e express-rate-limit → sicurezza • morgan o winston → logging

- cors → accesso cross-domain

---

Creare il file .env nella root:

```
PORT=3000
MONGO_URI=mongodb://localhost:27017/taskdb
JWT_SECRET=unaChiaveSegreta
NODE_ENV=development
FRONTEND_ORIGIN=http://localhost:3000
```

Verifica gli script package.json:

```
"scripts": {
 "start": "node src/index.js",
    "dev": "nodemon src/index.js",
}
```

---

Creare package.json (se non è presente) e installare le dipendenze:

```
npm install
```

Avviare il server:

```
npm run dev
```

Server in ascolto su: http://localhost:3000

---

**Rotte principali**

| Rotta                 | Metodo | Descrizione          | Autenticazione |
| --------------------- | ------ | -------------------- | -------------- |
| /api/auth/register    | POST   | Registrazione utente | No             |
| /api/aut/login        | POST   | Login utente         | No             |
| /api/tasks            | GET    | Lista task utente    | Si(JWT)        |
| /api/tasks            | POST   | Crea nuovo task      | Si             |
| /api/tasks/:id        | PATCH  | Aggiorna task        | Si             |
| /api/tasks/:id        | DELETE | Elimina task         | Si             |
| /api/tasks/:id/upload | POST   | Carica file per task | SI             |

---

**Checklist**

- Logging con Winston su console + file (logs/)
- Middleware globali: sicurezza, rate-limit, error handler
- JWT authentication con middleware
- Validazione input con Joi
- Upload file sicuro con Multer (uploads/)
- OpenAPI documentato (docs/openapi.yaml)
- Healthcheck: GET /api/health

---

Per Swagger UI

Installare la seguente dipendenza:

(non va con la versione 19 di Joy installare la 17 risulta la più stabile)

- npm install swagger-ui-express yamljs

Endpoint live:

http://localhost:3000/api/docs

Mostra tutte le rotte /auth e /tasks con esempi di request/response.

E' possibile fare il try-it-out direttamente dalla UI.

/api/docs sarà disponibile prima di qualsiasi routing logico e interferisce con logging, auth o middleware esistenti

---

Per il deploy:

[Render](https://taskmanager-api-mx5y.onrender.com)

[Railway](https://taskmanager-api-production-a254.up.railway.app)

[Render-Swagger UI](https://taskmanager-api-mx5y.onrender.com/api/docs)

[Railway-Swagger UI](https://taskmanager-api-production-a254.up.railway.app/api/docs)

[Render-check_health](https://taskmanager-api-mx5y.onrender.com/api/health)

[Railway-check_health](https://taskmanager-api-production-a254.up.railway.app/api/health)
