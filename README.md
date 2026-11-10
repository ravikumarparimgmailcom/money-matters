# Money Matters

React + Vite finance dashboard with User/Admin views and a server-side Hasura proxy.

## Requirements
- Node.js 18+
- Hasura REST API base URL and admin secret supplied by the assignment
- Admin email/password of your choice for the local admin gate

## Local setup
1. `npm i`
2. Copy `.env.example` to `.env`
3. Fill in server-side values in `.env`. Never commit `.env`.
4. `npm run dev` (Vite also runs the local adapter for the existing `/api/*` handlers)
5. Open the URL printed by Vite, normally http://localhost:5173

The included Vite middleware adapts the existing API handlers for local development, so you do not need `vercel dev`.

## Important API contract
The app currently expects these Hasura REST endpoints:
- `get-user-id` (POST; user login)
- `all-transactions` (GET)
- `add-transaction` (POST)
- `update-transaction` (POST)
- `delete-transaction` (DELETE)
- `credit-debit-totals` (GET)
- `transaction-totals-admin` (GET)
- `daywise-totals-7-days` (GET)
- `daywise-totals-last-7-days-admin` (GET)
- `profile` (GET/POST depending on your assignment collection)

These names were carried forward from the supplied project. The exact request/response fields must be confirmed against the official NxtWave Postman collection. If the collection uses different names or methods, update `src/services/transactions.js` and `api/data/[...path].js`.

## Security
- `HASURA_ADMIN_SECRET`, `SESSION_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` are server-only.
- Never expose the Hasura admin secret in browser code or `VITE_` variables.
- The API proxy signs a short-lived session token and enforces role-specific endpoint allowlists.
- For production, configure the same variables in Vercel Project Settings > Environment Variables.

## Build
`npm run build`

## Assignment note
This implementation preserves the supplied Money Matters visual direction and CRUD workflows. Backend correctness depends on matching the official API collection's endpoint names, methods, request bodies and response schemas.
