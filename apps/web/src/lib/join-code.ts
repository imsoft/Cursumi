import { randomBytes, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);
const PREFIX = "scrypt$";

export async function hashJoinCode(plain: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scryptAsync(plain, salt, 32)) as Buffer;
  return `${PREFIX}${salt}$${derived.toString("hex")}`;
}

export async function verifyJoinCode(plain: string, stored: string | null): Promise<boolean> {
  if (!stored || !stored.startsWith(PREFIX)) return false;
  const rest = stored.slice(PREFIX.length);
  const dollar = rest.indexOf("$");
  if (dollar < 1) return false;
  const salt = rest.slice(0, dollar);
  const hashHex = rest.slice(dollar + 1);
  if (!/^[0-9a-f]+$/i.test(hashHex) || salt.length < 8) return false;
  const expected = Buffer.from(hashHex, "hex");
  const derived = (await scryptAsync(plain, salt, expected.length)) as Buffer;
  if (derived.length !== expected.length) return false;
  return timingSafeEqual(derived, expected);
}

/** Cursos con sesiones (presencial o en vivo) gratuitos pueden usar código de inscripción */
export function shouldUseFreeJoinCode(modality: string, price: number): boolean {
  return (modality === "presencial" || modality === "live") && price === 0;
}

/** @deprecated usar shouldUseFreeJoinCode */
export const shouldUseFreePresencialJoinCode = shouldUseFreeJoinCode;
