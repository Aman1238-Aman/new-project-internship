# Roots · People & Work

A full stack employee and task management application built with React, Express and MongoDB. The repository contains a Vite frontend and a REST API; it starts with an empty database and creates no demo people or tasks.

## Architecture

```text
client/  React 18 + Vite + React Router + Axios
         dashboard, employee and task routes, responsive CSS
server/  Express 4 REST API + Mongoose 8
         routes → validators → controllers → services → models
         centralized errors, shared date/overdue helpers
MongoDB  employees, tasks, task sequence counter
```

The `Employee` document owns the unique employee ID and normalized email, employee attributes, leave dates, and a server-maintained `activeTaskCount`. A `Task` references the employee by ObjectId and also stores an immutable-at-assignment snapshot of the employee's identifying and contact details. The snapshot keeps old tasks readable after a person is deleted. A `Counter` document increments inside the task creation transaction to allocate sequential IDs such as `TSK-001` without collisions.

The active task counter is adjusted in MongoDB transactions whenever an active task is created, reassigned, deleted, completed or cancelled. Assignment uses an atomic employee update whose predicate checks eligibility and a count below three. MongoDB transactions require a replica set; local development can use MongoDB Atlas or a local replica set. A standalone local `mongod` does not support these transaction-based APIs.

## Requirements and business rules

- Departments are Development, Design, QA, HR and Sales. Employee status is Active, Inactive or On Leave. Email is trimmed and lowercased; database unique indexes enforce both email and employee ID uniqueness.
- On Leave employees require a valid leave range. An assignment starting on either leave boundary is rejected. Inactive employees are always rejected. An employee can own at most three Todo or In Progress tasks.
- New tasks always start as Todo. The task body cannot set status or completed date. The only status endpoint accepts Todo → In Progress, In Progress → Completed, Todo → Cancelled, and In Progress → Cancelled. Terminal tasks cannot be edited. The backend sets completion time.
- Due dates cannot precede start dates. Date-only values are parsed at UTC midnight and overdue compares date strings in `APP_TIMEZONE`; overdue means today is later than the due date and the task is not Completed or Cancelled.
- Employees with active tasks cannot be deleted. Employee and task listing, filtering, sorting and pagination execute in MongoDB. Task employee-name search uses the saved employee snapshot. CSV applies the same filters and overdue helper and deliberately omits pagination.

## Requirements Q&A

1. **Where are status transitions validated and why?** In `server/services/taskService.js` inside `changeStatus`, reached only through `PUT /api/tasks/:id/status`. The service owns the transition matrix so direct API callers cannot bypass the rule; the route validator checks the submitted enum as well.
2. **Why does Completed Date come from the backend?** It records the authoritative transition time, stays consistent across clients and cannot be forged by a request payload.
3. **How are inactive and on-leave assignments blocked?** The task service atomically matches Active employees or On Leave employees whose start date is strictly outside the inclusive leave range. Inactive employees never match.
4. **Why are filtering and pagination performed on the backend?** MongoDB can filter and page the full dataset before returning rows, which avoids downloading the whole collection and keeps totals correct.
5. **Why do filters live in the URL?** A copied or refreshed URL restores the same search, filters, sort and page, and supports browser navigation.
6. **What can go wrong with concurrent fourth-task assignments?** A count-then-insert check can let multiple requests observe two tasks and each insert another. A transaction with an atomic conditional counter increment lets only requests that see a count below three claim capacity.

## Setup

Requirements: Node.js 22.12+ (or Node 24+) and Docker Desktop for the local replica set, or a MongoDB Atlas URI.

```sh
npm install
Copy-Item server/.env.example server/.env  # PowerShell; edit values before starting
docker compose up -d mongo
npm run dev
```

The API runs at `http://localhost:5000`, Vite at `http://localhost:5173`, and Vite proxies `/api` to the API. Docker initializes MongoDB as a single-node replica set because transactional task assignment requires replica-set support. Alternatively run `npm run dev:server` and `npm run dev:client` in separate terminals. `npm run build` creates the frontend production bundle. `npm test` runs the Jest/Supertest backend suite. No account or authentication is required by the assignment.

### Environment variables

| Variable | Purpose |
| --- | --- |
| `NODE_ENV` | `development`, `test` or `production` |
| `PORT` | Express port (defaults to 5000) |
| `MONGODB_URI` | MongoDB connection string; keep it private |
| `CLIENT_URL` | Allowed frontend origin(s), comma separated |
| `APP_TIMEZONE` | IANA timezone for date-only overdue calculation (default `UTC`) |
| `VITE_API_URL` | Optional client API base URL, including `/api`; local development uses Vite proxy |

`server/.env.example` contains placeholders only. Never commit `.env` or put a MongoDB URI in a `VITE_` variable. For MongoDB Atlas, create a database user with a strong password, allow the backend host's network access, copy the application's connection string into `MONGODB_URI`, replace the password locally or in the hosting dashboard, and URL-encode special characters. Do not commit credentials.

## API reference

All JSON responses use `{ "success": true, "data": ... }`; errors use `{ "success": false, "message": ..., "code": ... }` and validation responses may include field errors. Invalid input is 400, missing records 404, and conflicts such as duplicates, locked tasks, capacity or invalid transitions 409.

| Method | Path | Behavior |
| --- | --- | --- |
| GET | `/api/health` | Health check |
| GET | `/api/dashboard` | Employee counts, task counts, overdue count and employee workload |
| GET, POST | `/api/employees` | Search/list or create employees |
| GET, PUT, DELETE | `/api/employees/:id` | Read, replace editable employee fields or delete if no active work |
| GET, POST | `/api/tasks` | Filter/list tasks or create a Todo task |
| GET | `/api/tasks/export.csv` | Download all matching filtered tasks as CSV |
| GET, PUT, DELETE | `/api/tasks/:id` | Read, edit an active task or delete it |
| PUT | `/api/tasks/:id/status` | Apply one allowed status transition |

Employee list query parameters: `search`, `department`, `status`, `sort` (`fullName`, `employeeId`, `joiningDate`, `department`, `status`, `createdAt`), `order` (`asc`, `desc`), `page`, `limit`.

Task list/export query parameters: `search` (title, employee name or employee ID), `department`, `priority`, `status`, `dueFrom`, `dueTo`, `sort` (`createdDate`, `dueDate`, `priority`, `title`), `order`, `page`, `limit`. Priority sorting is Critical, High, Medium, Low. Combined filters are applied together.

Example employee creation:

```http
POST /api/employees
Content-Type: application/json
```

```json
{"employeeId":"EMP-024","fullName":"Aanya Sharma","email":"aanya@example.com","phone":"+91 98765 43210","department":"Development","role":"Frontend Engineer","joiningDate":"2025-04-01","status":"Active","skills":["React","CSS"]}
```

Example task creation and status update:

```json
{"title":"Refresh product page","description":"Update the responsive layout","assignedEmployee":"<employee MongoDB id>","department":"Design","priority":"High","startDate":"2026-11-20","dueDate":"2026-11-27"}
```

```http
PUT /api/tasks/<task MongoDB id>/status
Content-Type: application/json
```

```json
{"status":"In Progress"}
```

List responses include `data.items` and `data.pagination` (`page`, `limit`, `total`, `totalPages`). Task list and detail items include `isOverdue`. CSV columns include task and saved employee details, dates, status, and overdue flag. Dashboard response contains `employees`, `tasks`, and `workload` objects.

## Testing and quality checks

```sh
npm test
npm run build
```

The Jest/Supertest backend suite starts an in-memory MongoDB replica set so transaction and API behavior can be exercised without production data. The first run may need to download MongoDB binaries. It covers employee validation and duplicates, task eligibility, inclusive leave boundaries, Todo creation, transitions, completion timestamps, capacity counter updates, concurrent assignment, combined filters, CSV escaping/export and overdue reads. The Vitest/Testing Library suite checks loading states, status options, URL filter preservation and friendly API errors. The source does not seed example records.

## Deployment

1. Create an Atlas cluster and database user; configure Network Access for the backend host. Store the URI only as a backend environment variable.
2. Deploy `server` as a Node web service on Render (or another Node host), using the repository root as the service root, build command `npm install`, and start command `npm start`. Set `NODE_ENV=production`, `MONGODB_URI`, `CLIENT_URL` to the exact deployed frontend origin, `APP_TIMEZONE`, and optional `PORT` per host. Atlas must support replica-set transactions (Atlas does).
3. Deploy `client` on Vercel or Netlify with root directory `client`, Node.js 22.12 or later, build command `npm run build`, output directory `dist`, and `VITE_API_URL=https://<your-api-host>/api`. `client/vercel.json` and `client/public/_redirects` configure SPA route fallbacks.
4. Configure SPA fallback to `index.html` for React Router: Vercel can use its Vite framework detection; on Netlify add `client/public/_redirects` with `/* /index.html 200` (create this file if using Netlify).
5. Set the backend `CLIENT_URL` to the actual frontend origin. Do not use `*` for a public production deployment.
6. Verify the backend `/api/health`, open the deployed frontend, create an employee and task, exercise filters and a status transition, and confirm browser requests succeed without CORS errors. Check host logs and Atlas metrics if a request fails.

No hosting account credentials or live service URLs are part of this repository; a deployment cannot be completed from local code alone.

## Submission checklist

- [ ] Add the project to your GitHub account and push the reviewed source.
- [ ] Confirm `.env` and `node_modules` are ignored and the repository contains no credentials.
- [ ] Provide a working MongoDB Atlas URI only through hosting environment settings.
- [ ] Deploy API and frontend, configure the allowed CORS origin, and run the live URL checks above.
- [ ] Include real frontend, backend, and repository URLs in the submission after deployment.
