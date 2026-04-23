# FoundersForge Backend

Node.js and Express backend for FoundersForge with MongoDB persistence, JWT authentication, role-based authorization, AI-assisted project/resume processing, semantic project discovery, REST chat history, and Socket.IO project chat.

## Setup

1. Copy `.env.example` to `.env`.
2. Set `MONGO_URI`, `JWT_SECRET`, and optionally `GROQ_API_KEY`.
3. Install dependencies with `npm install`.
4. Start the API with `npm start`.

If `GROQ_API_KEY` is missing or the AI service is unavailable, project structuring and resume parsing fall back to local heuristic parsing so demos can continue.

## Main REST Endpoints

- `POST /api/auth/register` - register founder, contributor, investor, or admin.
- `POST /api/auth/login` - issue a JWT.
- `GET /api/auth/me` - return the current user and profile.
- `GET/PATCH /api/profiles/me` - manage the authenticated user's profile.
- `POST /api/projects` - founder/admin project creation with AI structuring and embeddings.
- `GET /api/projects` - public project browsing.
- `GET|POST /api/projects/search/semantic` - vector-style semantic project search.
- `POST /api/resumes/upload` - contributor/admin resume upload and parsing.
- `POST /api/applications/projects/:projectId` - contributor application flow.
- `GET /api/applications/projects/:projectId` - founder/admin application review list.
- `PATCH /api/applications/:applicationId` - accept or reject an application.
- `POST /api/investments/projects/:projectId` - investor/admin investment tracking.
- `GET /api/messages/projects/:projectId` - project chat history.
- `POST /api/messages/projects/:projectId` - REST message send fallback.
- `GET /api/dashboards/founder` - founder dashboard.
- `GET /api/dashboards/investor` - investor dashboard.
- `GET /api/dashboards/contributor` - contributor dashboard.
- `GET /api/admin/overview` - admin platform overview.

## Socket.IO Chat

Connect with a JWT:

```js
const socket = io("http://localhost:8080", {
  auth: { token },
});
```

Events:

- `project:join` with `{ projectId }`
- `project:message` with `{ projectId, content }`

Chat access is limited to admins, project founders, accepted contributors, and investors who have funded the project.
