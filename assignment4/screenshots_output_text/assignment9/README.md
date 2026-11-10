# CampusEats — CS543 Assignment 09

This project extends the Assignment 08 CampusEats REST API. It keeps the same menu-item service and adds JWT login, authentication middleware, and role-based authorization.

## Team

| # | Name | Roll Number |
|---|------|--------------|
| 1 | Mohit Tiwari | 20252651034 |
| 2 | Himanshi Pawar | 20252651024 |
| 3 | Ajay Kumar | 20252651004 |
| 4 | Asha Sahu | 20252651013 |
| 5 | Vedant Sahu | 20252651063 |


## 1. Requirements

- Node.js 18 or newer
- npm
- VS Code (optional)

## 2. Install and run (Windows PowerShell)

Open PowerShell in this project folder:

```powershell
npm install
Copy-Item .env.example .env
```

Open `.env` and replace `JWT_SECRET` with a long random secret (at least 32 characters). Example:

```env
PORT=3000
JWT_SECRET=CampusEats_A9_demo_secret_change_this_2026_very_long
CUSTOMER_SEED_PASSWORD=customer123
RESTAURANT_SEED_PASSWORD=resto123
```

Start the development server:

```powershell
npm run dev
```

Open http://localhost:3000 in your browser.

For a normal start, use `npm start`.

## 3. Demo accounts

| Role | Email | Password |
|---|---|---|
| customer | `ajay@campus.edu` | `customer123` |
| restaurant | `mealhub@campus.edu` | `resto123` |

The application hashes the seed passwords with `bcryptjs` and keeps bcrypt hashes in the user records. Do not commit `.env`.

## 4. Routes and access rules

| Method | Path | Authentication | Role requirement | Purpose |
|---|---|---|---|---|
| POST | `/login` | No | None | Verify credentials and issue JWT |
| GET | `/items` | Yes | Any authenticated role | List menu items |
| GET | `/items/:id` | Yes | Any authenticated role | Fetch one item |
| POST | `/items` | Yes | `restaurant` or `admin` | Create a menu item |
| GET | `/health` | No | None | Health check |

The original Assignment 08 routes and status behavior are retained: successful reads return 200, a successful create returns 201, an unknown item returns 404, and invalid create data returns 422.

## 5. PowerShell API demonstration

Keep the server running in its own terminal. Open a second PowerShell terminal in this folder.

### Case 1 — no token: expect 401

```powershell
curl.exe -i http://localhost:3000/items
```

Expected status: `401 Unauthorized` because the request has no Bearer token.

### Case 2 — customer login: receive a JWT

```powershell
$customerLogin = Invoke-RestMethod -Method POST -Uri http://localhost:3000/login -ContentType "application/json" -Body '{"email":"asha@campus.edu","password":"customer123"}'
$customerToken = $customerLogin.token
$customerLogin
```

Expected: `login successful`, user role `customer`, and a token string.

### Case 3 — authenticated customer reads items: expect 200

```powershell
Invoke-RestMethod -Method GET -Uri http://localhost:3000/items -Headers @{ Authorization = "Bearer $customerToken" }
```

Expected: list of seeded menu items.

### Case 4 — restaurant login and create item: expect 201

```powershell
$restaurantLogin = Invoke-RestMethod -Method POST -Uri http://localhost:3000/login -ContentType "application/json" -Body '{"email":"mealhub@campus.edu","password":"resto123"}'
$restaurantToken = $restaurantLogin.token

$newItem = @{ name = "Masala Dosa"; price = 80; available = $true } | ConvertTo-Json
Invoke-RestMethod -Method POST -Uri http://localhost:3000/items -Headers @{ Authorization = "Bearer $restaurantToken" } -ContentType "application/json" -Body $newItem
```

Expected: `201 Created` and the new item in the response.

### Case 5 — customer attempts to create item: expect 403

```powershell
$customerItem = @{ name = "Customer Special"; price = 50; available = $true } | ConvertTo-Json
try {
  Invoke-RestMethod -Method POST -Uri http://localhost:3000/items -Headers @{ Authorization = "Bearer $customerToken" } -ContentType "application/json" -Body $customerItem
} catch {
  $_.Exception.Response.StatusCode.value__
  $_.ErrorDetails.Message
}
```

Expected: `403 Forbidden`. The token is valid, but the customer role is not allowed to create menu items.

### Optional — invalid login: expect 401

```powershell
curl.exe -i -X POST http://localhost:3000/login -H "Content-Type: application/json" -d "{\"email\":\"ajay@campus.edu\",\"password\":\"wrong\"}"
```

## 6. Assignment questions

### Q1. Which routes use authentication only, and which use role authorization?

- Authentication only: `GET /items` and `GET /items/:id`. Any valid logged-in user may read the menu.
- Authentication + role authorization: `POST /items`. The user must have a valid JWT and role `restaurant` or `admin`.
- `POST /login` is public because users need to log in before receiving a token.

### Q2. Give one 401 and one 403 example.

- 401: calling `GET /items` without a token, with an invalid token, or with an expired token. Authentication failed.
- 403: a customer sends a valid JWT to `POST /items`. Authentication succeeded, but the role is not permitted to create an item.

### Q3. What is in the JWT payload, why trust the role claim, and why keep the secret out of code?

The payload contains `userId` and `role`. The server trusts these claims only after `jwt.verify()` validates the token signature using the server's secret and checks its expiry. The secret must remain outside source code so it is not exposed in a public Git repository; `.env` is ignored by Git and `.env.example` contains only placeholders.

## 7. Important implementation notes

- `bcrypt.compareSync()` verifies the submitted password against the bcrypt hash.
- `jwt.sign()` creates a token with `userId` and `role`, expiring after one hour.
- `auth` checks the `Authorization: Bearer <token>` header and verifies the token.
- `requireRole("restaurant", "admin")` enforces the write permission.
- Data is stored in memory to match the Assignment 08 starter design. Restarting the server resets newly created items.
- `.env` must not be committed. Commit `.env.example` instead.

## 8. Git commands

```powershell
git init
git add .
git status
git commit -m "Complete CS543 Assignment 09 JWT API security"
```

Before pushing, confirm `.env` is not listed by `git status`.

## 9. Submission checklist

- [ ] `server.js` includes login, JWT authentication, and role authorization.
- [ ] `package.json` includes Express, jsonwebtoken, bcryptjs, and dotenv.
- [ ] `.env` is ignored and `.env.example` is committed.
- [ ] Capture screenshots for 401, successful login/token, authenticated GET 200, restaurant POST 201, and customer POST 403.
- [ ] Record the demo video and add your team members' names/roll numbers as required by your instructor.
