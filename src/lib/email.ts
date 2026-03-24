import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = () => process.env.RESEND_FROM_EMAIL || "Cursumi <onboarding@resend.dev>";

function emailWrapper(title: string, body: string): string {
  return `<!DOCTYPE html>
<html>
  <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${title}</title></head>
  <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px;">
    <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:30px;text-align:center;border-radius:10px 10px 0 0;">
      <h1 style="color:white;margin:0;font-size:28px;">${title}</h1>
    </div>
    <div style="background:#ffffff;padding:40px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 10px 10px;">
      ${body}
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:30px 0;">
      <p style="font-size:12px;color:#9ca3af;text-align:center;margin:0;">© ${new Date().getFullYear()} Cursumi. Todos los derechos reservados.</p>
    </div>
  </body>
</html>`;
}

interface SendVerificationEmailParams {
  to: string;
  name: string;
  verificationLink: string;
}

interface SendPasswordResetEmailParams {
  to: string;
  name: string;
  resetLink: string;
}

export async function sendPasswordResetEmail({
  to,
  name,
  resetLink,
}: SendPasswordResetEmailParams) {
  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY no está configurada");
    throw new Error("Configuración de email no disponible");
  }

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Cursumi <onboarding@resend.dev>",
      to: [to],
      subject: "Restablece tu contraseña - Cursumi",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Restablece tu contraseña</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Restablece tu contraseña</h1>
            </div>
            <div style="background: #ffffff; padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
              <p style="font-size: 16px; margin-bottom: 20px;">Hola ${name},</p>
              <p style="font-size: 16px; margin-bottom: 20px;">
                Recibimos una solicitud para restablecer la contraseña de tu cuenta en Cursumi. Si fuiste tú, haz clic en el siguiente botón para crear una nueva contraseña:
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" 
                   style="display: inline-block; background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                  Restablecer contraseña
                </a>
              </div>
              <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
                O copia y pega este enlace en tu navegador:
              </p>
              <p style="font-size: 12px; color: #9ca3af; word-break: break-all; background: #f9fafb; padding: 10px; border-radius: 4px;">
                ${resetLink}
              </p>
              <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
                Este enlace expirará en 1 hora. Si no solicitaste restablecer tu contraseña, puedes ignorar este correo de forma segura.
              </p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              <p style="font-size: 12px; color: #9ca3af; text-align: center; margin: 0;">
                © ${new Date().getFullYear()} Cursumi. Todos los derechos reservados.
              </p>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error("Error al enviar email de reset:", error);
      throw new Error(`Error al enviar email: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error("Error inesperado al enviar email:", error);
    throw error;
  }
}

export async function sendVerificationEmail({
  to,
  name,
  verificationLink,
}: SendVerificationEmailParams) {
  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY no está configurada");
    throw new Error("Configuración de email no disponible");
  }

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Cursumi <onboarding@resend.dev>",
      to: [to],
      subject: "Verifica tu correo electrónico - Cursumi",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verifica tu correo electrónico</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">¡Bienvenido a Cursumi!</h1>
            </div>
            <div style="background: #ffffff; padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
              <p style="font-size: 16px; margin-bottom: 20px;">Hola ${name},</p>
              <p style="font-size: 16px; margin-bottom: 20px;">
                Gracias por registrarte en Cursumi. Para completar tu registro, por favor verifica tu correo electrónico haciendo clic en el siguiente botón:
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationLink}" 
                   style="display: inline-block; background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                  Verificar correo electrónico
                </a>
              </div>
              <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
                O copia y pega este enlace en tu navegador:
              </p>
              <p style="font-size: 12px; color: #9ca3af; word-break: break-all; background: #f9fafb; padding: 10px; border-radius: 4px;">
                ${verificationLink}
              </p>
              <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
                Este enlace expirará en 24 horas. Si no solicitaste este correo, puedes ignorarlo de forma segura.
              </p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              <p style="font-size: 12px; color: #9ca3af; text-align: center; margin: 0;">
                © ${new Date().getFullYear()} Cursumi. Todos los derechos reservados.
              </p>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error("Error al enviar email de verificación:", error);
      throw new Error(`Error al enviar email: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error("Error inesperado al enviar email:", error);
    throw error;
  }
}


// ─────────────────────────────────────────
// EMAILS TRANSACCIONALES
// ─────────────────────────────────────────

interface SendEnrollmentEmailParams {
  to: string;
  name: string;
  courseTitle: string;
  courseUrl: string;
}

export async function sendEnrollmentEmail({ to, name, courseTitle, courseUrl }: SendEnrollmentEmailParams) {
  if (!process.env.RESEND_API_KEY) return;
  const body = `
    <p style="font-size:16px;margin-bottom:20px;">Hola ${name},</p>
    <p style="font-size:16px;margin-bottom:20px;">
      Tu inscripcion a <strong>${courseTitle}</strong> ha sido confirmada. Ya puedes comenzar a aprender!
    </p>
    <div style="text-align:center;margin:30px 0;">
      <a href="${courseUrl}" style="display:inline-block;background:#667eea;color:white;padding:14px 28px;text-decoration:none;border-radius:6px;font-weight:600;font-size:16px;">
        Ir al curso
      </a>
    </div>
    <p style="font-size:14px;color:#6b7280;">Si tienes alguna pregunta, contactanos desde la plataforma.</p>`;
  try {
    await resend.emails.send({
      from: FROM(),
      to: [to],
      subject: `Inscripcion confirmada: ${courseTitle} - Cursumi`,
      html: emailWrapper("Inscripcion confirmada!", body),
    });
  } catch (err) {
    console.error("Error al enviar email de inscripcion:", err);
  }
}

interface SendCertificateEmailParams {
  to: string;
  name: string;
  courseTitle: string;
  certificateUrl: string;
}

export async function sendCertificateEmail({ to, name, courseTitle, certificateUrl }: SendCertificateEmailParams) {
  if (!process.env.RESEND_API_KEY) return;
  const body = `
    <p style="font-size:16px;margin-bottom:20px;">Hola ${name},</p>
    <p style="font-size:16px;margin-bottom:20px;">
      Felicidades! Has completado <strong>${courseTitle}</strong> y tu certificado esta listo.
    </p>
    <div style="text-align:center;margin:30px 0;">
      <a href="${certificateUrl}" style="display:inline-block;background:#667eea;color:white;padding:14px 28px;text-decoration:none;border-radius:6px;font-weight:600;font-size:16px;">
        Ver mi certificado
      </a>
    </div>
    <p style="font-size:14px;color:#6b7280;">Puedes descargarlo e imprimirlo desde la plataforma. Sigue aprendiendo!</p>`;
  try {
    await resend.emails.send({
      from: FROM(),
      to: [to],
      subject: `Certificado listo! ${courseTitle} - Cursumi`,
      html: emailWrapper("Certificado obtenido!", body),
    });
  } catch (err) {
    console.error("Error al enviar email de certificado:", err);
  }
}

interface SendProgressReminderEmailParams {
  to: string;
  name: string;
  courseTitle: string;
  progress: number;
  courseUrl: string;
}

export async function sendProgressReminderEmail({ to, name, courseTitle, progress, courseUrl }: SendProgressReminderEmailParams) {
  if (!process.env.RESEND_API_KEY) return;
  const body = `
    <p style="font-size:16px;margin-bottom:20px;">Hola ${name},</p>
    <p style="font-size:16px;margin-bottom:20px;">
      Hace 7 dias que no entras a <strong>${courseTitle}</strong>. Ya llevas el ${progress}% completado, no te rindas!
    </p>
    <div style="text-align:center;margin:30px 0;">
      <a href="${courseUrl}" style="display:inline-block;background:#667eea;color:white;padding:14px 28px;text-decoration:none;border-radius:6px;font-weight:600;font-size:16px;">
        Continuar aprendiendo
      </a>
    </div>
    <p style="font-size:14px;color:#6b7280;">Ajusta tus preferencias de notificacion en la configuracion de tu cuenta.</p>`;
  try {
    await resend.emails.send({
      from: FROM(),
      to: [to],
      subject: `Sigues ahi? Continua con ${courseTitle} - Cursumi`,
      html: emailWrapper("Tu curso te espera!", body),
    });
  } catch (err) {
    console.error("Error al enviar email de recordatorio:", err);
  }
}

// ─────────────────────────────────────────
// CURSUMI BUSINESS
// ─────────────────────────────────────────

interface SendOrgInviteEmailParams {
  to: string;
  orgName: string;
  inviterName: string;
  inviteLink: string;
}

export async function sendOrgInviteEmail({ to, orgName, inviterName, inviteLink }: SendOrgInviteEmailParams) {
  if (!process.env.RESEND_API_KEY) return;
  const body = `
    <p style="font-size:16px;margin-bottom:20px;">Hola,</p>
    <p style="font-size:16px;margin-bottom:20px;">
      <strong>${inviterName}</strong> te ha invitado a unirte al equipo de <strong>${orgName}</strong> en Cursumi Business.
    </p>
    <p style="font-size:14px;color:#6b7280;margin-bottom:20px;">
      Tendrás acceso a los cursos y materiales de capacitación de tu empresa.
      La invitación expira en 7 días.
    </p>
    <div style="text-align:center;margin:30px 0;">
      <a href="${inviteLink}" style="display:inline-block;background:#667eea;color:white;padding:14px 28px;text-decoration:none;border-radius:6px;font-weight:600;font-size:16px;">
        Aceptar invitación
      </a>
    </div>
    <p style="font-size:12px;color:#9ca3af;word-break:break-all;background:#f9fafb;padding:10px;border-radius:4px;">
      ${inviteLink}
    </p>`;
  try {
    await resend.emails.send({
      from: FROM(),
      to: [to],
      subject: `${orgName} te invita a Cursumi Business`,
      html: emailWrapper(`Invitación de ${orgName}`, body),
    });
  } catch (err) {
    console.error("Error al enviar email de invitación org:", err);
  }
}
