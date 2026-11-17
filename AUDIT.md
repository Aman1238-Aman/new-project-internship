# Roots assignment audit

The page references below come from the four-page assignment PDF. The tests column records commands actually run, not planned checks. A PASS means implementation and behavior were verified by the named automated check or source/config inspection. “NOT TESTED” identifies work that needs a browser/hosted environment or a broader assertion.

The final production dependency audit (`npm audit --omit=dev`) reports 0 vulnerabilities. The full development-tool audit still reports advisories in build/test dependencies; they are not runtime dependencies, but should be reviewed when the tooling has non-breaking patched releases.

| Requirement | PDF page | Implementation file/API | Test performed | Status |
| --- | --- | --- | --- | --- |
| Employee fields, unique ID/email, email normalization, department/status enums | 1 | `server/models/Employee.js`, `server/validators/employeeValidator.js` | `npm test` — employee creation, normalized email, duplicate ID/email, invalid department/status | PASS |
| Leave dates required for On Leave; end cannot precede start | 1 | `server/models/Employee.js`, `server/services/employeeService.js` | `npm test` — missing dates and invalid range | PASS |
| Employee create, list, search, filters, server pagination, read, update, delete | 1 | `/api/employees`, `server/services/employeeService.js` | `npm test` — employee API CRUD, search/filter/page, active-task delete rejection | PASS |
| Do not trust client activeTaskCount; block deletion when active tasks exist | 1 | `server/validators/employeeValidator.js`, `server/services/employeeService.js` | `npm test` — client counter rejected; delete conflict with Todo task | PASS |
| Task fields, generated sequential ID, default Todo, immutable backend completion date | 1 | `server/models/Task.js`, `server/models/Counter.js`, `server/services/taskService.js` | `npm test` — Todo, TSK ID, completion timestamp generated and locked-task edit rejected | PASS |
| Active employee assignment, inactive rejection, inclusive on-leave boundary | 1 | `server/services/taskService.js` | `npm test` — inactive, leave start/end rejection, first day after leave accepted | PASS |
| Due date is not before start date | 1 | `server/validators/taskValidator.js`, `server/services/taskService.js` | `npm test` — invalid date range rejected | PASS |
| Allowed status transitions only; status endpoint only; terminal tasks are locked | 1–2 | `server/routes/taskRoutes.js`, `server/services/taskService.js` | `npm test` — invalid Todo→Completed, normal PUT status rejected, valid completion/cancellation and locked edits | PASS |
| Three active task maximum and transaction-safe simultaneous assignment | 1 | `server/services/taskService.js`, `server/models/Employee.js` | `npm test` — fourth task rejected, five concurrent requests yield exactly three created | PASS |
| Counter consistency on create, reassign, delete and terminal status | 1 | `server/services/taskService.js` | `npm test` — active count checked after reassignment, status transition and deletion | PASS |
| Preserve employee details after deleting employee | 1 | `server/models/Task.js` (`employeeSnapshot`), `server/services/taskService.js` | `npm test` — cancel active tasks, delete employee, read task snapshot | PASS |
| Task CRUD and server-side title/employee search, combined filters and due-date filters | 1 | `/api/tasks`, `server/services/taskService.js` | `npm test` — task create/edit/delete/read and combined search/department/priority/date filters | PASS |
| Task sorting, including priority importance, and MongoDB pagination | 1 | `server/services/taskService.js` | `npm test` — Critical/Medium/Low ordering and page split | PASS |
| One overdue rule across list, detail, dashboard and CSV; due today is not overdue | 1 | `server/utils/dates.js`, task/dashboard services | `npm test` — past due across four surfaces, terminal task excluded, due-today check | PASS |
| CSV escaping and all matching filtered records independent of pagination | 1 | `/api/tasks/export.csv`, `server/services/taskService.js` | `npm test` — quote/comma escaping and 3 matches exported with list limit 1 | PASS |
| Dashboard counts and employee workload calculated by backend | 1, 4 | `/api/dashboard`, `server/controllers/dashboardController.js` | `npm test` — employee counts, task counts and active workload | PASS |
| Responsive employee/task screens and PDF page 3/4 visual layout references | 2–4 | `client/src/App.jsx`, `client/src/index.css` | Production build; source has tablet/mobile breakpoints; no screenshot comparison performed | NOT TESTED |
| Required-field validation, loading, API error notification, valid status options | 2 | `client/src/App.jsx`, `client/src/App.test.jsx` | `npm test` — required controls, skeleton, friendly API error and valid next statuses | PASS |
| Search/filter/sort/page state stays in URL and refresh restores selections | 1–2 | `client/src/App.jsx` | `npm test` — URL query state on initial load and filter update | PASS |
| Reusable frontend components and no inline styles | 2 | `client/src/App.jsx`, `client/src/index.css` | Build plus source inspection; shared Badge, Skeleton, Empty, Field, Pagination; no `style=` attributes | PASS |
| README, schema/API/business-rule docs and safe environment example | 2 | `README.md`, `server/.env.example` | Source review; `.env` excluded by `.gitignore`; production audit reports no vulnerable production packages | PASS |
| GitHub repository URL/push | 2 | No remote configured (`git remote -v` empty) | No repository available to inspect or push to | NOT TESTED |
| Frontend and backend deployment URLs / live verification | 2 | README deployment steps; no host configuration or credentials supplied | Docker daemon unavailable locally; no hosted URLs to verify | NOT TESTED |
