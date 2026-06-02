import { promises as dns } from "dns";

/**
 * Lista de dominios de email desechables conocidos.
 * Actualizada con los servicios más usados en ataques de spam de registro.
 */
const DISPOSABLE_DOMAINS = new Set([
  // Mailinator family
  "mailinator.com", "guerrillamail.com", "guerrillamail.net", "guerrillamail.org",
  "guerrillamail.de", "guerrillamail.biz", "guerrillamail.info", "grr.la",
  "spam4.me", "guerrillamailblock.com",
  // Temp mail services
  "tempmail.com", "temp-mail.org", "temp-mail.io", "throwam.com",
  "throwaway.email", "dispostable.com", "maildrop.cc", "tempr.email",
  "discard.email", "spamgourmet.com", "spamgourmet.net", "spamgourmet.org",
  "trashmail.com", "trashmail.me", "trashmail.net", "trashmail.org",
  "trashmail.at", "trashmail.io", "trashmail.xyz",
  // 10 minute mail
  "10minutemail.com", "10minutemail.net", "10minutemail.org", "10minemail.com",
  "10minutemail.de", "10minutemail.co.uk", "10minutemail.be", "10minutemail.nl",
  "10minutemail.pl", "10minutemail.ru",
  // Yopmail
  "yopmail.com", "yopmail.fr", "yopmail.pp.ua", "cool.fr.nf", "jetable.fr.nf",
  "nospam.ze.tc", "nomail.xl.cx", "mega.zik.dj", "speed.1s.fr", "courriel.fr.nf",
  // Getnada / Guerrilla
  "getnada.com", "getairmail.com", "sharklasers.com", "guerrillamail.info",
  "grr.la", "guerrillamailblock.com", "spam4.me",
  // Fakeinbox / more
  "fakeinbox.com", "fakeinbox.net", "fakemail.fr", "junk.to",
  "mailnull.com", "spamfree24.org", "spamfree24.de", "spamfree24.eu",
  "spamfree24.net", "spamfree24.info", "spamfree24.com",
  // Throwam & others
  "throwam.com", "spamhereplease.com", "spamthisplease.com",
  // Mailnesia
  "mailnesia.com", "mailnull.com", "mailscrap.com",
  // Nada
  "nada.email", "spambox.us", "spambox.org", "disposablemail.com",
  // Kukumail
  "kukumail.com", "dispostable.com",
  // Crap mail
  "crapmail.org",
  // Sharklasers
  "sharklasers.com", "guerrillamail.info", "guerrillamail.biz",
  // Mailexpire
  "mailexpire.com", "mailfreeonline.com", "mailguard.me",
  // Gishpuppy
  "gishpuppy.com",
  // Mytrashmail
  "mytrashmail.com", "mt2014.com", "mt2015.com",
  // Sogetthis
  "sogetthis.com", "suremail.info",
  // Anonymail
  "anonymail.dk", "antichef.com", "antichef.net",
  // Hmamail
  "hmamail.com", "hidzz.com",
  // Inbox alias
  "inboxalias.com", "incognitomail.com", "incognitomail.net", "incognitomail.org",
  // Jetable
  "jetable.com", "jetable.net", "jetable.org", "jetable.fr.nf",
  "jetable.pp.ua",
  // KosherEmail
  "kosheremail.net",
  // Lol email
  "lol.com",
  // Mailblocks
  "mailblocks.com",
  // Mailbolt
  "mailbolt.com",
  // Mailc3
  "mailc3.net",
  // Mailchop
  "mailchop.com",
  // Mailcker
  "mailcker.com",
  // Mailcatch
  "mailcatch.com",
  // Mailf
  "mailf5.com",
  // Mailforspam
  "mailforspam.com",
  // Mailfs
  "mailfs.com",
  // Mailguard
  "mailguard.me",
  // Mailhazard
  "mailhazard.com",
  // MailHero
  "mailhero.io",
  //MailHub
  "mailhub.top",
  // Mailin8r
  "mailin8r.com",
  // Mailinater
  "mailinater.com",
  // Mailinator2
  "mailinator2.com",
  // Mailinblack
  "mailinblack.com",
  // Mailita
  "mailita.tk",
  // Mailjunk
  "mailjunk.com",
  // Mailkutu
  "mailkutu.com",
  // Mailme
  "mailme.lv",
  // Mailme24
  "mailme24.com",
  // Mailmetrash
  "mailmetrash.com",
  // Mailmoat
  "mailmoat.com",
  // Mailnull
  "mailnull.com",
  // Mailpluss
  "mailpluss.com",
  // Mailpoof
  "mailpoof.com",
  // Mailrock
  "mailrock.biz",
  // Mailseal
  "mailseal.de",
  // Mailshell
  "mailshell.com",
  // Mailsiphon
  "mailsiphon.com",
  // Mailslapping
  "mailslapping.com",
  // Mailslite
  "mailslite.com",
  // Mailspam
  "mailspam.me",
  // Mailspam xyz
  "mailspam.xyz",
  // Mailsuckwithme
  "mailsuckwithme.com",
  // Mailtemp
  "mailtemp.info",
  // Mailtemporaire
  "mailtemporaire.com", "mailtemporaire.fr",
  // Mailtm
  "mailtm.com",
  // Mailzilla
  "mailzilla.com", "mailzilla.org",
  // Mohmal
  "mohmal.com", "mohmal.im", "mohmal.tech",
  // Mucinbox
  "mucinbox.com",
  // Myspaceinc
  "myspaceinc.com",
  // Nice group
  "nicegroup.pro",
  // Nospamfor
  "nospamfor.us",
  // Nowmymail
  "nowmymail.com",
  // Objectmail
  "objectmail.com",
  // Oneoffemail
  "oneoffemail.com",
  // Pookmail
  "pookmail.com",
  // Privy-mail
  "privy-mail.com", "privy-mail.de",
  // Proxymail
  "proxymail.eu",
  // Putthisinyourspamdatabase
  "putthisinyourspamdatabase.com",
  // Quickinbox
  "quickinbox.com",
  // Rcpt
  "rcpt.at",
  // Recode
  "recode.me",
  // Safetymail
  "safetymail.info",
  // Sharedmailbox
  "sharedmailbox.org",
  // Shortmail
  "shortmail.net",
  // Spambox
  "spambox.info", "spambox.irishspringrealty.com",
  // Spamcall
  "spamcall.net",
  // Spamdecoy
  "spamdecoy.net",
  // Spamex
  "spamex.com",
  // SpamGrap
  "spamgrap.com",
  // Spamhole
  "spamhole.com",
  // Spamify
  "spamify.com",
  // Spamme
  "spamme.us", "spamme.today",
  // Spammehere
  "spammehere.net",
  // Spammotel
  "spammotel.com",
  // Spamoff
  "spamoff.de",
  //Spamsalad
  "spamsalad.in",
  // Spamspot
  "spamspot.com",
  // Spamthis
  "spamthis.co.uk",
  // Tempalias
  "tempalias.com", "tempe-mail.com", "tempinbox.co.uk", "tempinbox.com",
  "tempmail.de", "tempmail.eu", "tempmail.it", "tempmail.net", "tempmail.ru",
  "tmp-mails.com",
  // Tradermail
  "tradermail.info",
  // Trash-mail
  "trash-mail.at", "trash-mail.com", "trash-mail.de", "trash-mail.io",
  "trashinbox.com",
  // UglyEmail
  "uglyemail.com",
  // VersaAI
  "versaai.io",
  // WhatPaulo
  "whatpaulo.com",
  // Willhackforfood
  "willhackforfood.biz",
  // Wmail
  "wmail.cf",
  // Xagloo
  "xagloo.com",
  // Yep
  "yep.it",
  // Yogamaven
  "yogamaven.com",
  // Ypmail
  "ypmail.webarnak.fr.eu.org",
  // Zoemail
  "zoemail.net", "zoemail.org", "zoemail.com",
  // Zpmail
  "zpmail.com",
]);

/**
 * Verifica si un email usa un dominio desechable conocido.
 */
export function isDisposableDomain(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return false;
  return DISPOSABLE_DOMAINS.has(domain);
}

/**
 * Verifica si el dominio del email tiene registros MX válidos.
 * Retorna false si no se puede resolver (dominio inexistente o inválido).
 * En caso de error de red, retorna true (beneficio de la duda).
 */
export async function hasMXRecord(email: string): Promise<boolean> {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return false;

  try {
    const records = await dns.resolveMx(domain);
    return records.length > 0;
  } catch (err: unknown) {
    // Si el error es ENOTFOUND o ENODATA, el dominio no existe
    if (
      err instanceof Error &&
      "code" in err &&
      (err as NodeJS.ErrnoException).code &&
      ["ENOTFOUND", "ENODATA", "ENODATA"].includes((err as NodeJS.ErrnoException).code!)
    ) {
      return false;
    }
    // Otros errores de red (timeout, etc.) — dejar pasar para no bloquear usuarios legítimos
    return true;
  }
}

/**
 * Valida que un email sea apto para registro:
 * - No pertenece a un dominio desechable
 * - (Opcional) Tiene registros MX válidos
 * 
 * @param email El email a validar
 * @param checkMX Si se debe verificar registros MX (más lento, pero más seguro)
 */
export async function validateEmailDomain(
  email: string,
  checkMX = true
): Promise<{ valid: boolean; reason?: string }> {
  if (isDisposableDomain(email)) {
    return {
      valid: false,
      reason: "No se permiten emails temporales o desechables. Usa tu email personal o de trabajo.",
    };
  }

  if (checkMX) {
    const hasMX = await hasMXRecord(email);
    if (!hasMX) {
      return {
        valid: false,
        reason: "El dominio del correo no parece ser válido. Verifica que escribiste bien tu email.",
      };
    }
  }

  return { valid: true };
}
