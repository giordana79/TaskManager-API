### Setup ambiente e struttura base

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

### Rotte principali

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

### Swagger UI

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

---

### Mappa dei livelli logici del progetto

```
project-root/
├── index.js ← Entry point (avvia server, middleware, rotte)
├── routes/
│ ├── auth.routes.js ← Definisce gli endpoint (API routes)
│ └── task.routes.js
├── controllers/
│ ├── auth.controller.js ← Contiene la logica applicativa (login, register)
│ └── task.controller.js ← Logica dei task (CRUD)
├── models/
│ ├── user.model.js ← Schema Mongoose (struttura dati, validazioni DB)
│ └── task.model.js
├── middleware/
│ ├── auth.js ← Autenticazione JWT
│ ├── errorHandler.js ← Gestione errori globali
│ └── loggerMiddleware.js ← Logging richieste
├── config/
│ ├── db.js ← Connessione a MongoDB
│ └── logger.js ← Configurazione log
└── docs/
└── openapi.yaml ← Documentazione API
```

| Tipo di logica    | dove si trova      | Cosa fa                                                                                   |
| ----------------- | ------------------ | ----------------------------------------------------------------------------------------- |
| Business logic    | controllers/       | Esegue azioni concrete (es. login, createTask, updateTask). Qui c’è la logica del dominio |
| Data access logic | models/            | Gestisce l’interazione con MongoDB (creazione, query, update)                             |
| Auth logic        | middleware/auth.js | Valida token JWT e imposta req user                                                       |
| Application logic | index.js + routes/ | Gestisce l’instradamento e la configurazione globale (non “logica di dominio”)            |

---

### Architettura e ruoli nel progetto

| Livello    | Posizione del progetto | Responsabilità principali                                                                  | Esempi di file                                             |
| ---------- | ---------------------- | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| Route      | /routes/               | Definisce gli endpoint API e collega le rotte ai controller. Non gestisce logica           | auth.routes.js, task.routes.js                             |
| Controller | /controllers/          | Riceve req, res, chiama i services, gestisce logging e risposte HTTP                       | auth.controller.js, task.controller.js                     |
| Service    | /services/             | Contiene la logica di business: operazioni DB, validazioni di dominio, sicurezza           | auth.service.js, task.service.js                           |
| Model      | /models/               | Definisce schema MongoDB e validazioni a livello dati                                      | user.model.js, task.model.js                               |
| Middleware | /middleware/           | Esegue controlli tra richiesta e controller (autenticazione, validazione, logging, errori) | auth.js, errorHandler.js, validate.js, loggerMiddleware.js |
| Config     | /config/               | Gestione configurazioni (DB, logger, multer, ecc.). Non contiene logica applicativa        | db.js, logger.js, multer.js                                |
| Utils      | /utils/                | Funzioni di supporto riutilizzabili, come AppError.js                                      | AppError.js                                                |
| Validation | /validation/           | Definisce schemi Joi per la validazione di input in modo centralizzato                     | auth.validation.js, task.validation.js                     |
| Docs       | /docs/                 | Contiene la documentazione OpenAPI (openapi.yaml)                                          | openapi.yaml                                               |
