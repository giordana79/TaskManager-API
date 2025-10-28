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

(non va con la versione 19 di Joi installare la 17 risulta la più stabile)

- npm install swagger-ui-express yamljs

Endpoint live:

http://localhost:3000/api/docs

Mostra tutte le rotte /auth e /tasks con esempi di request/response.

E' possibile fare il try-it-out direttamente dalla UI.

/api/docs sarà disponibile prima di qualsiasi routing logico e interferisce con logging, auth o middleware esistenti

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

---

### Dashboard Admin (ruoli e permessi)

- Gli utenti hanno un ruolo (user o admin)

- Middleware isAdmin protegge le rotte admin.

Per testare le rotte bisogna loggarsi con l'utenza admin:

- email:admin@example.com
- password:admin123

Nella root del backend sono presenti 2 script da eseguire con node createAdmin.js per creare un admin ed un altro script updateAdminPassword.js per aggiornare la password.

Questo comando si esegue all'interno della cartella del backend per creare un admin:

```
node createAdmin.js
```

questo script serve per creare un utente con il ruolo di admin già hashato in MongoDB (nella root lato backend), poichè permettere agli utenti di scegliere role dal frontend può essere un rischio di sicurezza. Meglio creare admin solo tramite script o direttamente in DB.

Con questo comando si esegue lo script che permette di aggiornare la password di admin:

```
node updateAdminPassword.js
```

### Admin routes

```
GET /api/admin/users → lista utenti

GET /api/admin/tasks → lista tutti i task

DELETE /api/admin/users/:id → elimina utente con id

DELETE /api/admin/tasks/:id → elimina tasks con id

PATCH /api/admin/tasks/:id → modifica tasks con id

POST /api/admin/tasks/:id/upload → upload tasks con id
```

Tutte richiedono JWT admin nell’header Authorization e
disponibili solo agli admin.

---

### Servizio email gratuito

**Installa dipendenza:**

- cd backend
- npm install nodemailer

**Configura email nel .env**

Mailtrap per iniziare gratuito e semplice:

Vai su https://mailtrap.io

Registrati

Copia le credenziali SMTP

---

**Test Login con Refresh Token**

1. Apri http://localhost:5173

2. Registra un nuovo utente o fai login

3. Apri DevTools (F12) > Application > Local Storage

Verifica che ci siano:

- accessToken (token corto)
- refreshToken (token lungo)

**Test Access Token**

```
GET http://localhost:3000/api/tasks
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZmZkZWRlNzhhYmIyZjU4NTUwNDkxNiIsImVtYWlsIjoicGFvbG9AZ21haWwuY29tIiwiaWF0IjoxNzYxNTk5MTk4LCJleHAiOjE3NjE2MDAwOTh9.7lLPNNRnCVv4MFK6l6HzJjeYXr6lWiGxz3k77rtjlDE
```

Restituisce i task di Paolo

**Test Refresh Token**

```
POST http://localhost:3000/api/auth/refresh
Content-Type: application/json

{
  "success": true,
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZmZkZWRlNzhhYmIyZjU4NTUwNDkxNiIsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzYxNTk5MTk4LCJleHAiOjE3NjIyMDM5OTh9.qCLsvJny_gbZ8XRWK7Oe0lhRORnQSOV7RlPYNOf8ULY"
}
```

Restituisce un nuovo accessToken

**Test Password Reset**

```
POST http://localhost:3000/api/auth/request-reset
Content-Type: application/json

{
  "email": "paolo@gmail.com"
}
```

Response:

```
{
    "success": true,
    "message": "Email di reset inviata con successo"
}
```

Controlla Mailtrap per l'email

Controlla Mailtrap:

1. Vai su https://mailtrap.io/inboxes
2. Dovresti vedere l'email "Reset Password - Task Dashboard"
3. Apri l'email e copia il token dall'URL

Il link sarà del tipo:

```
http://localhost:5173/reset-password?token=040f0759065f6366c32d0efddaab7fc344823f5e0cc7165822bcb9195a87a246
```

oppure dalla email copia il token:

1. Copia il token dall'email
2. Usa questo endpoint:

```
POST http://localhost:3000/api/auth/reset-password
Content-Type: application/json

{
  "token": "040f0759065f6366c32d0efddaab7fc344823f5e0cc7165822bcb9195a87a246",
  "newPassword": "nuovapassword123"
}
```

---

**Test Frontend**

Andare su http://localhost:5173:

1. Registrazione → Si dovrebbe loggare automaticamente
2. Logout → Click su "Logout"
3. Login → Riprovare a fare login
4. Password dimenticata → Click sul link e testare il flusso

**Verifica localStorage**

Aprire DevTools (F12) > Application > Local Storage > http://localhost:5173

Si dovrebbe vedere:

- accessToken → il token breve
- refreshToken → il token lungo

**Note**

- accessToken scade in 15 minuti → dopo si dovrà usare refresh
- refreshToken scade in 7 giorni → dopo si dovrà fare nuovamente il login
- Il frontend gestisce automaticamente il refresh quando accessToken scade

---

### Deploy del backend

[Render](https://taskmanager-api-mx5y.onrender.com)

[Render-Swagger UI](https://taskmanager-api-mx5y.onrender.com/api/docs)

[Render-check_health](https://taskmanager-api-mx5y.onrender.com/api/health)

**Deploy del frontend su Vercel**

La cartella del frontend si chiama task-dashboard:

[Vercel]("https://task-manager-api-ecru-kappa.vercel.app/")

---

**NB**

Quando si clicca su upload restituisce **Cannot GET /uploads/1761598556111-vespa.jpeg**.
Questo accade perchè Render con piano gratuito non supporta file persistenti. I file caricati vengono eliminati ad ogni restart del server (la cartella /uploads dove sono contenuti i file è effimera).
Si deve usare un cloud storage come Quick Start Cloudinary o AWS S3.
