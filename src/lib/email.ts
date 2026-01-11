import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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

