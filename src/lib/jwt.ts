import { SignJWT, jwtVerify } from "jose";

const COOKIE_NAME = "ar_agency";
const ISS = "adreportly";

function secretKey(): Uint8Array | null {
  const raw = process.env.JWT_SECRET;
  if (!raw || raw.length < 16) return null;
  return new TextEncoder().encode(raw);
}

export type AgencyJwtPayload = {
  agencyId: string;
  sub?: string;
};

export async function signAgencyJwt(payload: AgencyJwtPayload, expiresIn = "30d") {
  const key = secretKey();
  if (!key) throw new Error("JWT_SECRET must be set (min 16 characters).");
  return new SignJWT({ agencyId: payload.agencyId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer(ISS)
    .setExpirationTime(expiresIn)
    .sign(key);
}

export async function verifyAgencyJwt(token: string): Promise<AgencyJwtPayload | null> {
  const key = secretKey();
  if (!key) return null;
  try {
    const { payload } = await jwtVerify(token, key, { issuer: ISS });
    const agencyId = payload.agencyId as string | undefined;
    if (!agencyId) return null;
    return { agencyId, sub: payload.sub };
  } catch {
    return null;
  }
}

export { COOKIE_NAME };
