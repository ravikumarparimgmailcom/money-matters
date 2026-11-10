
import {
  body,
  send,
  session,
  hasuraConfig
} from "../../server/session.js";

const USER = new Set([
  "all-transactions",
  "add-transaction",
  "update-transaction",
  "delete-transaction",
  "credit-debit-totals",
  "daywise-totals-7-days",
  "profile"
]);

const ADMIN = new Set([
  "all-transactions",
  "transaction-totals-admin",
  "daywise-totals-last-7-days-admin"
]);

const METHODS = {
  "all-transactions": ["GET"],
  "add-transaction": ["POST"],
  "update-transaction": ["POST"],
  "delete-transaction": ["DELETE"],
  "credit-debit-totals": ["GET"],
  "daywise-totals-7-days": ["GET"],
  "transaction-totals-admin": ["GET"],
  "daywise-totals-last-7-days-admin": ["GET"],
  profile: ["GET", "POST", "PUT"]
};

export default async function handler(req, res) {
  const auth = session(req);

  if (!auth) {
    return send(res, 401, {
      message: "Session missing or expired. Please log in again."
    });
  }

  const url = new URL(
  req.url,
  `https://${req.headers.host || "localhost"}`
);

const routePath = url.pathname.split("/api/data/")[1] || "";

const p = req.query?.path || routePath;

const endpoint = (
  Array.isArray(p) ? p.join("/") : String(p)
)
  .split("/")
  .filter(Boolean)
  .join("/");

  const allowed = auth.role === "admin" ? ADMIN : USER;

  if (!allowed.has(endpoint)) {
    return send(res, 403, {
      message: "This endpoint is not available for this account."
    });
  }

  if (!(METHODS[endpoint] || []).includes(req.method)) {
    return send(res, 405, {
      message: "Method not allowed for this endpoint."
    });
  }

  try {
    const { base, secret } = hasuraConfig();

    const target = new URL(`${base}/${endpoint}`);

    for (const [key, value] of Object.entries(req.query || {})) {
      if (key === "path" || value == null) continue;

      if (Array.isArray(value)) {
        value.forEach((item) => {
          target.searchParams.append(key, String(item));
        });
      } else {
        target.searchParams.set(key, String(value));
      }
    }

    // Supply a default limit if the frontend did not provide one.
    if (endpoint === "all-transactions") {
  if (!target.searchParams.has("limit")) {
    target.searchParams.set("limit", "10");
  }

  if (!target.searchParams.has("offset")) {
    target.searchParams.set("offset", "0");
  }
}

    let payload = {};

    if (!["GET", "HEAD"].includes(req.method)) {
      payload = await body(req);
    }

    if (endpoint === "add-transaction" && auth.role === "user") {
      payload = {
        ...payload,
        user_id: auth.userId
      };
    }

    const headers = {
      "content-type": "application/json",
      "x-hasura-admin-secret": secret,
      "x-hasura-role": auth.role
    };

    if (auth.role === "user") {
      headers["x-hasura-user-id"] = String(auth.userId);
    }

    const upstream = await fetch(target, {
      method: req.method,
      headers,
      body: ["GET", "HEAD"].includes(req.method)
        ? undefined
        : JSON.stringify(payload)
    });

    const text = await upstream.text();

    res.statusCode = upstream.status;

    res.setHeader(
      "Content-Type",
      upstream.headers.get("content-type") || "application/json"
    );

    res.end(text);

  } catch (error) {
    return send(res, 502, {
      message: error.message || "Hasura request failed"
    });
  }
}
