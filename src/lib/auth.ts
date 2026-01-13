import { sign, verify } from "hono/jwt";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export interface JWTPayload {
  userId: string;
  phoneNumber: string;
  exp: number;
  [key: string]: string | number;
}

export async function generateJWT(userId: string, phoneNumber: string): Promise<string> {
  const payload: JWTPayload = {
    userId,
    phoneNumber,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days expiry
  };

  return await sign(payload, JWT_SECRET, "HS256");
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const payload = await verify(token, JWT_SECRET, "HS256") as JWTPayload;
    return payload;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
}
