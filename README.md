# Peer Learning / Tutoring Sessions API

This repository contains the backend for the **Peer Learning / Tutoring Sessions** system, built with Node.js, Express and MongoDB. The service allows tutors to create and manage tutoring sessions, students to join sessions, and provides filtering by subject/grade/level. A Google Calendar integration automatically creates, updates and deletes calendar events whenever a tutor creates or modifies a session.

---

## 📝 Author
**IT Number:** IT23401976  
**Name:** SERASINGHE CS

---

## 🚀 Key Features
- ✅ Tutors and admins can **create, update, delete** tutoring sessions
- ✅ Students can **join/leave** sessions (capacity is tracked)
- ✅ Sessions can be **filtered** by subject, grade, level, status and tutor
- ✅ **Pagination** support for listings (page / limit query params)
- ✅ Google Calendar event automatically created/updated/deleted when a session is managed
- ✅ Role-based authentication with JWT (students, tutors, admins)

---

## 📦 Installation

```bash
# clone repo
git clone <your-repo-url>
cd Quality-Education

# install dependencies
npm install

# copy .env.example to .env and fill values
# include MongoDB URI, JWT secret, Google OAuth credentials, etc.

npm start   # or `node server.js`
```

---

## 📁 Environment Variables
Make a `.env` file containing at least:

```
PORT=5000
MONGO_URI=<your mongodb uri>
JWT_SECRET=<secret>
JWT_EXPIRE_IN=1d

# Google calendar credentials (optional but required for event sync)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:5000/api/google-calendar/callback
GOOGLE_REFRESH_TOKEN=...
```

---

## 📡 API Endpoints
All routes are prefixed with `{{base_url}}` (e.g. `http://localhost:5000/api`).

### Authentication
- `POST {{base_url}}/auth/register` – register user (student/tutor/admin)
- `POST {{base_url}}/auth/login` – login and receive JWT cookie
- `POST {{base_url}}/auth/logout` – clear token

### Tutoring Sessions
```json
// Create session (tutor/admin)
POST {{base_url}}/tutoring-sessions
{
  "title":"Algebra Class",
  "subject":"mathematics",
  "description":"Algebra basics",
  "grade":"10",
  "level":"intermediate",
  "duration":60,
  "schedule": { "date":"2026-03-15T10:00:00Z", "startTime":"10:00", "endTime":"11:00" },
  "capacity": { "maxParticipants": 20 },
  "location": { "type":"online", "link":"https://zoom.us" },
  "tags":["algebra","equations"],
  "notes":"Bring calculator"
}
```

```json
// Get all sessions (public, filterable)
GET {{base_url}}/tutoring-sessions?subject=math&grade=10&level=intermediate&page=1&limit=10
```

```json
// Get single session
GET {{base_url}}/tutoring-sessions/{{session_id}}
```

```json
// Get current user's enrolled sessions
GET {{base_url}}/tutoring-sessions/my-enrolled
```

```json
// Update session (owner or admin)
PUT {{base_url}}/tutoring-sessions/{{session_id}}
{ "title":"Updated Title", "duration":90 }
```

```json
// Delete session (owner or admin)
DELETE {{base_url}}/tutoring-sessions/{{session_id}}
```

```json
// Student join/leave
POST {{base_url}}/tutoring-sessions/{{session_id}}/join
POST {{base_url}}/tutoring-sessions/{{session_id}}/leave
```

```json
// Get sessions by tutor
GET {{base_url}}/tutoring-sessions/tutor/{{tutor_id}}
```

---

## 📅 Google Calendar Integration
When a tutoring session is created/updated/deleted by a tutor, a corresponding Google Calendar event is automatically generated/updated/removed on the configured Google calendar. Attendees (students enrolled) are added to the event.

To enable this feature you must provide valid OAuth credentials and a refresh token in your `.env`.  Use the `GET {{base_url}}/google-calendar/auth` route to generate the token via the OAuth consent screen.

If the credentials are missing or invalid, the server will simply skip calendar operations (no errors thrown) and sessions will still persist in the database.

---

## 🧩 Additional Routes
The project includes other modules (feedback, messages, progress, etc.) with their own routers – you can explore the `/Routes` directory for the complete set.

---

## 🛠️ Testing via Postman
A ready-made collection is included: `peer-learning-tutoring-sessions.postman_collection.json`. Import it into Postman and set the `{{base_url}}` variable to `http://localhost:5000/api`.

### 📬 Example Responses
Here are typical JSON responses you will see when executing the collection:

**Register/Login**
```json
{ "msg": "User registered successfully" }
```

```json
{ "msg": "Login successful", "user": { "_id":"...","email":"tutor@test.com","role":"tutor" } }
```

**Create Session**
```json
{
  "msg": "Tutoring session created",
  "session": {
    "_id": "64f5ea2c...",
    "title": "Algebra Fundamentals",
    "subject": "mathematics",
    "grade": "10",
    "schedule": { "date":"2026-03-10T10:00:00.000Z","startTime":"10:00","endTime":"11:00" },
    "capacity": { "maxParticipants":20,"currentEnrolled":0 },
    "googleEventId": "abcd1234efgh",
    "tutor": { "_id":"...","fullName":"John Tutor","email":"tutor@test.com" }
  }
}
```

**Get All Sessions**
```json
{
  "msg": "Tutoring sessions retrieved",
  "sessions": [ /* array of session objects */ ],
  "pagination": {"page":1,"limit":10,"total":3,"totalPages":1}
}
```

**Join Session**
```json
{ "msg": "Joined session", "currentEnrolled": 1 }
```

**Get Session By ID**
```json
{ "msg": "Session retrieved", "session": { /* full session data */ } }
```

**Update Session**
```json
{ "msg": "Session updated", "session": { /* updated object */ } }
```

**Delete Session**
```json
{ "msg": "Session deleted successfully" }
```

These sample responses correspond to the requests defined in the Postman collection.

---

## 📂 Repository Structure
```
Controllers/       # thin route handlers
services/          # business logic & helpers
models/            # Mongoose schemas
Routes/            # express routers
Middleware/        # auth, validation, error handling
service/           # external APIs (Google Calendar)
utils/             # small utilities
validations/       # request payload checks
```

---

Feel free to modify, extend and deploy this API. Good luck with your project! 🚀

