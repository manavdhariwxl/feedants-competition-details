# Feedants — Competition Details Screen

Full Stack Development Internship technical assignment (Blaccsckull Platforms), submitted for the "Feedants" brief. A real, dynamic implementation of the **Competition Details** screen shown in `Objective_Page.png` — React Native frontend, Node.js/Express backend, MongoDB database — with a concurrency-safe registration flow as the core deliverable.

## 1. Project overview

The brief provides a static mockup of a competition details screen and asks for a working, dynamic version of it: real data from a database, a real API, and — the part the brief calls out as critical — a registration flow that stays correct (no overselling spots, no duplicate registrations) even when many users hit it at the same instant.

Nothing in the mobile app is hardcoded. On launch it asks the backend which competition to show, fetches that competition's full details, and renders the screen entirely from the API response, including which lifecycle phase it's in and what the bottom action button should say.

## 2. Features

- Competition details (title, tags, prize pool, entry fee, spots remaining) served from MongoDB via a REST API
- Concurrency-safe registration: never oversells spots, never double-registers a user, even under simultaneous requests
- A 4-state competition lifecycle (Upcoming / Registration Open / Registration-Submission Closed / Results Announced), computed server-side from dates
- A single server-computed call-to-action (`Register Now`, `Upload Submission`, `Spots Full`, `Registration Closed`, `View Results`, etc.) — the client never re-derives this logic itself
- Live, drift-corrected registration countdown
- Previous winners carousel, judging info tabs, rewards table, payment/referral sections — all data-driven
- Proper loading / error / empty states throughout
- Demo data seeding script covering all four lifecycle states out of the box
- Automated tests for the registration business logic, including race-condition tests

## 3. Architecture

```
┌─────────────────────┐        HTTPS/JSON        ┌──────────────────────┐        ┌─────────────┐
│   React Native app   │ ───────────────────────▶ │   Express REST API    │ ─────▶ │   MongoDB    │
│   (Expo, mobile/)     │ ◀─────────────────────── │   (backend/)           │ ◀───── │              │
└─────────────────────┘                           └──────────────────────┘        └─────────────┘
```

- **`backend/`** — a standard layered Express app: `routes` → `controllers` → `services` (business logic) → `models` (Mongoose schemas), with a `utils` layer holding pure, DB-free business logic (lifecycle/CTA computation) so it's trivially unit-testable.
- **`mobile/`** — an Expo (React Native) app. One screen, composed from small, reusable, presentational components; a couple of hooks handle data-fetching and the live countdown; a thin `api/client.js` wraps `fetch`.
- The two are fully decoupled by the HTTP API — either could be replaced independently.

## 4. Tech stack

| Layer | Choice | Notes |
|---|---|---|
| Frontend | React Native via **Expo** (SDK 57) | Expo was chosen over the bare RN workflow so the app runs immediately with `npx expo start` / Expo Go, with no native build tooling (Xcode/Android Studio) required to review this submission. No native modules are used, so nothing is lost by not ejecting. |
| Backend | Node.js + Express | As mandated by the brief. |
| Database | MongoDB + Mongoose | As mandated by the brief. |
| Testing | Jest, Supertest, mongodb-memory-server | See §11 for how these are run. |

No state-management library, ORM abstraction, or UI kit was added — the screen's state is simple enough that `useState`/custom hooks are clearer than introducing Redux/Zustand, and hand-written `StyleSheet`s keep the bundle small and match the mockup's spacing exactly (see §14 on avoiding unnecessary dependencies).

## 5. MongoDB schema / data model

Three collections, as required:

**`Competition`** — the core entity. Notably, `totalSpots` and `spotsLeft` are stored directly on this document (not derived by counting `Registration`s on every read) — this denormalization is what makes the concurrency-safe registration flow possible with a single atomic update; see §12.

```
Competition {
  title, category, tags[], hasCertificate,
  prizePool, entryFee, currency,
  totalSpots, spotsLeft,
  judge: { name, title, experienceYears, photoUrl, introVideoUrl },
  importantDates: { registrationOpensAt, registrationDeadline, submissionStartsAt, submissionEndsAt, resultDate },
  previousWinners: [{ name, rank, label, imageUrl, videoUrl }],
  about, judgingParameters, rulesAndEligibility,
  rewards: [{ rank, label, amount }],
  disclaimer,
  payment: { provider, refundPolicyUrl, payoutInfoVideoUrl },
  referral: { code, link, rewardAmount },
  timestamps
}
```

**`User`** — deliberately lightweight; see the "identity vs. authentication" assumption in §13.

```
User { deviceId (unique), displayName, timestamps }
```

**`Registration`** — the join between `User` and `Competition`.

```
Registration { competition (ref), user (ref), registeredAt, timestamps }
// unique compound index on { competition, user } — this index is load-bearing, see §12.
```

## 6. API endpoints

All responses are `{ success: true, data: ... }` or `{ success: false, error: { code, message } }`. Send `x-device-id: <id>` (the mobile app generates and persists this automatically) to get personalized state; it's optional for read endpoints and required for registering.

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/health` | Liveness check |
| GET | `/api/competitions` | Paginated list (`?page=&limit=`) — used by the app to auto-discover the demo competition |
| GET | `/api/competitions/:id` | Full details for the screen: capacity, dates, lifecycle stage, CTA, and (if `x-device-id` sent) this user's registration state |
| GET | `/api/competitions/:id/registration-status` | Just this user's registration state (lighter-weight alternative to the above) |
| POST | `/api/competitions/:id/register` | Registers the calling user. **Concurrency-critical** — see §12 |

Error codes you'll see from `POST /register`: `MISSING_DEVICE_ID` (400), `INVALID_ID` (400), `COMPETITION_NOT_FOUND` (404), `REGISTRATION_NOT_OPEN` / `REGISTRATION_CLOSED` (403), `SPOTS_FULL` / `ALREADY_REGISTERED` (409).

## 7. Setup instructions

### Prerequisites
- Node.js ≥ 18
- A MongoDB instance — either [MongoDB Community Server](https://www.mongodb.com/try/download/community) running locally, or a free [Atlas](https://www.mongodb.com/atlas) cluster
- The [Expo Go](https://expo.dev/go) app on your phone (easiest way to run the frontend), or an iOS/Android simulator

### 8. Environment variables

**`backend/.env`** (copy from `backend/.env.example`):
```
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/feedants
CORS_ORIGIN=*
NODE_ENV=development
```

**`mobile/.env`** (copy from `mobile/.env.example`):
```
EXPO_PUBLIC_API_URL=http://localhost:4000
```
> Android emulator: use `http://10.0.2.2:4000` instead of `localhost`. Physical device via Expo Go: use your computer's LAN IP (e.g. `http://192.168.1.23:4000`) and make sure the phone and computer are on the same network.

### 9. How to run the backend
```bash
cd backend
npm install
cp .env.example .env      # then edit MONGODB_URI if needed
npm run seed               # populates demo data — see §10
npm run dev                 # starts on http://localhost:4000 (nodemon, auto-reloads)
```

### 10. How to seed demo data
```bash
cd backend
npm run seed
```
This clears and repopulates all three collections with **4 competitions covering all 4 lifecycle states**, with dates computed relative to whenever you run it (so the demo is always "live"):

| Competition | Lifecycle state | Purpose |
|---|---|---|
| Feedants Classical Dance | Registration Open | Matches `Objective_Page.png` closely (₹1,500 pool, ₹99 fee, 20 spots/19 left, judge Manju Dubey, 4 previous winners). This is the competition the app opens into. |
| Feedants Standup Comedy Slam | Registration Open, **1 spot left** | Purpose-built for exercising/demoing the concurrency-safe registration flow — see §11. |
| Feedants Photography Sprint | Upcoming | Registration hasn't opened yet. |
| Feedants Poetry Slam — Season 1 | Results Announced | Fully booked, everything in the past. |

The seed script prints each competition's ID and title to the console when it finishes.

### How to run the React Native app
```bash
cd mobile
npm install
cp .env.example .env      # then edit EXPO_PUBLIC_API_URL if needed
npm start
```
Scan the QR code with Expo Go (Android) or the Camera app (iOS), or press `a` / `i` in the terminal for an emulator/simulator, or `w` for a web preview.

## 11. Testing instructions

```bash
cd backend
npm test
```

This runs, via Jest:
- **`tests/lifecycle.test.js`** — pure unit tests of the lifecycle/CTA logic (no database). 14 tests covering every phase transition and every CTA combination.
- **`tests/registration.test.js`** — the 4 specific business-rule scenarios the brief lists: successful registration, duplicate prevention, full-competition rejection, and post-deadline rejection — plus 2 extra edge cases (not-yet-open, nonexistent competition).
- **`tests/concurrency.test.js`** — the concurrency scenario: **10 different users racing for exactly 1 remaining spot** (asserts exactly 1 succeeds, `spotsLeft` never goes negative), the **same user firing 5 simultaneous registration requests** (asserts they only ever end up registered once), and a larger **50-users-racing-for-20-spots** version of the same guarantee.
- **`tests/api.test.js`** — HTTP-level integration tests through the actual Express app (supertest), covering the full request/response cycle including the error codes in §6.

The database tests use `mongodb-memory-server`, which downloads a real `mongod` binary the first time it runs, so **an internet connection is required the first time you run `npm test`** (it's cached after that). If you'd rather not download it, point `MONGOMS_SYSTEM_BINARY` at an existing local `mongod` installation instead.

> **Note on how these tests were verified while building this:** the pure-logic suite (`lifecycle.test.js`) was run and passed in the sandboxed environment this was built in — that run actually caught and fixed a real bug (the "results announced" CTA branch was checking a coarse lifecycle phase instead of comparing directly against the result date). The three MongoDB-backed suites could not be executed in that sandbox because its network allowlist blocks MongoDB's binary-download CDN; they're written the same way as the tests that did run and pass, and are the standard way to test this kind of logic — running `npm test` on a normal machine with internet access will execute all of them.

### Manually exercising the concurrency scenario
To watch it happen live rather than just via the test suite, seed the database, then fire several registration requests at "Feedants Standup Comedy Slam" (which is seeded with exactly 1 spot left) at once, from different simulated users:
```bash
COMPETITION_ID=<paste the id printed by npm run seed>
for i in 1 2 3 4 5; do
  curl -s -X POST "http://localhost:4000/api/competitions/$COMPETITION_ID/register" \
    -H "x-device-id: manual-test-user-$i" & 
done
wait
```
Exactly one request will come back `201` with the registration; the rest will come back `409 SPOTS_FULL`.

## 12. Concurrency approach (the core requirement)

Registration is implemented in `backend/src/services/registrationService.js` and relies on two independent, database-enforced atomic guarantees rather than any application-level locking:

**1. No overselling** — a single atomic `findOneAndUpdate`:
```js
Competition.findOneAndUpdate(
  { _id: competitionId, spotsLeft: { $gt: 0 }, 'importantDates.registrationDeadline': { $gte: now } },
  { $inc: { spotsLeft: -1 } },
  { new: true }
)
```
The capacity check (`spotsLeft: { $gt: 0 }`) is baked into the *query filter itself*, not performed as a separate read beforehand. MongoDB guarantees a single document update is atomic, so if 50 requests arrive at once for the last spot, the database serializes them — only one `findOneAndUpdate` call matches and decrements; by the time the others are evaluated, `spotsLeft` is already `0`, so they naturally get `null` back. This deliberately avoids the classic broken "read spotsLeft in application code → check → write" pattern, which has a race window between the read and the write.

**2. No duplicate registrations** — a unique compound index on `Registration { competition, user }`. Even if two concurrent requests from the same user both pass an earlier "are you already registered?" check, the database itself will only let one of the resulting `insert`s succeed; the other throws a duplicate-key error (`11000`), which the service catches and turns into a friendly `ALREADY_REGISTERED` response — after first **refunding the spot** it had provisionally reserved in step 1, so a failed duplicate attempt never actually consumes capacity.

**Alternative considered — multi-document ACID transactions.** Wrapping the capacity decrement and the registration insert in a single Mongoose session/transaction would also be correct. It was not used as the primary approach because transactions require MongoDB to be running as a **replica set**, which most local dev setups (a plain `mongod`, exactly what this project's own `.env.example` points at) don't have by default — using transactions would have meant asking whoever runs this to also stand up a replica set just to test registration. The atomic-update-plus-compensation approach gives the same two correctness guarantees while working against a single standalone MongoDB instance. If this were deployed against an Atlas cluster or any replica set, switching to a transaction would be a reasonable simplification (one round trip instead of a conditional rollback) — noted in §15 as a production improvement.

## 13. Important assumptions

- **No authentication system.** The brief doesn't ask for login/signup, and building full auth (password hashing, JWT issuance, refresh tokens) would add significant surface area without demonstrating any of the competition/registration logic actually being evaluated. Instead, the mobile app generates a random `deviceId` on first launch (persisted via AsyncStorage) and sends it as an `x-device-id` header; the backend transparently creates a `User` document for a new device id on first use. This is explicitly a stand-in for real auth — see §15.
- **The four brief-named lifecycle states don't map 1:1 onto the mockup's four date fields.** The mockup shows `Submission Starts` occurring *before* `Register Before` (registration deadline), meaning the submission window can open while registration is still open. To handle this correctly, five fine-grained phases are computed internally (see `computePhase` in `competitionLifecycle.js`) and then folded down to the brief's four named stages (`UPCOMING`, `REGISTRATION_OPEN`, `REGISTRATION_SUBMISSION_CLOSED`, `RESULTS_ANNOUNCED`) for display, while the CTA button uses the finer-grained phase to decide exactly what action is available right now. This is why, in the seeded "Feedants Classical Dance" competition, the CTA already reads "Upload Submission" once you register, even while the registration countdown is still visibly ticking — matching the provided design.
- **"Previous Winners" is historical, not this run's results.** It's treated as data about earlier editions of a competition series, always shown regardless of the current competition's lifecycle stage — as opposed to this edition's own results, which only exist once `resultDate` has passed.
- **A competition cannot be re-registered for after cancellation** — there is no "unregister" flow in the mockup, so the unique index simply prevents a second-ever registration per user per competition. Supporting cancel-then-rejoin would need a different indexing strategy (see §15).
- **The "Go back" button, language toggle, and bottom tab bar are decorative.** The assignment is scoped to one screen; there is nothing to navigate back to or between, so these match the mockup visually but aren't wired to real navigation or i18n.

## 14. Technical decisions

- **`spotsLeft` is denormalized onto `Competition`** rather than computed by counting `Registration` documents on every read. This is what makes the concurrency guarantee a single-document atomic operation instead of a cross-collection consistency problem (see §12).
- **All lifecycle/CTA logic lives in plain, DB-free functions** (`utils/competitionLifecycle.js`), separate from Mongoose models and Express controllers, specifically so it can be (and is) unit-tested with fake clocks and plain objects, and so there is exactly one place in the whole system that decides "what should the user see right now" — the mobile app renders the server's answer rather than re-implementing this logic client-side.
- **Expo over bare React Native**, and **no state-management library / UI kit / axios** — see §4. `fetch` (built into RN) is sufficient for three simple JSON endpoints; adding axios would be an unnecessary dependency for the functionality gained.
- **A minimal `GET /api/competitions` listing endpoint** was added even though the mockup only shows one competition, both because the mobile app needs *some* way to discover a competition id without it being hardcoded, and to show the pattern for scaling past a single hardcoded screen.

## 15. Trade-offs & what would be improved for production

- **Replace device-id "identity" with real authentication** (JWT/session-based), so a user's registrations follow their account rather than a specific device/app-install.
- **Move from atomic-update-plus-compensation to a multi-document transaction** if/when this runs against a MongoDB replica set (e.g. Atlas), simplifying `registrationService.js` to a single transactional round trip instead of a conditional rollback.
- **Cache competition reads** (e.g. Redis, short TTL, invalidated on registration) — competition details are read far more often than they're written, and at real scale this endpoint would be the hot path.
- **Rate-limit `POST /register`** per device/IP to blunt scripted spam registration attempts, separately from the correctness guarantees already in place.
- **Support cancel-then-rejoin** by moving from a plain unique index to a partial unique index (unique only where `status: 'ACTIVE'`) plus a cancellation endpoint.
- **Add pagination/virtualization and image caching** on the mobile side if the winners/competitions lists were to grow large.
- **Localize for real** (the ENG/हिंदी toggle is currently cosmetic) and wire the bottom tab bar to real navigation once there's more than one screen.
- **Structured logging and request tracing** (e.g. pino + request IDs) instead of `morgan`'s dev-friendly console output, for real production observability.

## Repository structure
```
.
├── README.md                 (this file)
├── backend/
│   ├── src/
│   │   ├── config/db.js
│   │   ├── models/{Competition,User,Registration}.js
│   │   ├── services/registrationService.js      ← concurrency-critical logic
│   │   ├── controllers/competitionController.js
│   │   ├── routes/competitionRoutes.js
│   │   ├── middleware/{identifyUser,errorHandler,validate}.js
│   │   ├── utils/{ApiError,competitionLifecycle,competitionPresenter}.js
│   │   ├── seed/seed.js
│   │   └── app.js / server.js
│   └── tests/{lifecycle,registration,concurrency,api}.test.js
└── mobile/
    ├── App.js
    └── src/
        ├── api/client.js
        ├── hooks/{useCompetitionDetails,useCountdown}.js
        ├── screens/CompetitionDetailsScreen.js
        ├── components/*.js                      ← one file per mockup section
        └── theme/theme.js
```
