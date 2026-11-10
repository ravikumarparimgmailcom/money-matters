
import {
  createToken,
  body,
  send
} from "../../server/session.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return send(res, 405, {
      message: "Method not allowed"
    });
  }

  try {
    const credentials = await body(req);

    const email = String(credentials.email || "").trim().toLowerCase();
    const password = String(credentials.password || "");

    const expectedEmail = String(
      process.env.USER_EMAIL || ""
    ).trim().toLowerCase();

    const expectedPassword = process.env.USER_PASSWORD || "";

    if (!expectedEmail || !expectedPassword) {
      return send(res, 500, {
        message: "User authentication is not configured. Check server environment variables."
      });
    }

    if (email !== expectedEmail || password !== expectedPassword) {
      return send(res, 401, {
        message: "Invalid user email or password."
      });
    }

    const userId = 1;

    const token = createToken({
      role: "user",
      userId
    });

    return send(res, 200, {
      token,
      role: "user",
      userId,
      name: "Demo User",
      email: expectedEmail
    });

  } catch (error) {
    return send(res, 500, {
      message: error.message || "User login failed"
    });
  }
}
