/**
 * Envoi d'emails transactionnels via l'API REST Brevo (Sendinblue).
 * Aucune dépendance npm supplémentaire : utilise fetch natif de Node 18+.
 */

const BREVO_URL = 'https://api.brevo.com/v3/smtp/email'

async function sendEmail(config, { to, toName, subject, html }) {
  if (!config.brevoApiKey) {
    console.warn('[email] BREVO_API_KEY manquant — email non envoyé.')
    return
  }
  const res = await fetch(BREVO_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': config.brevoApiKey,
    },
    body: JSON.stringify({
      sender: { name: config.fromName, email: config.fromEmail },
      to: [{ email: to, name: toName }],
      subject,
      htmlContent: html,
    }),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    console.error(`[email] Brevo erreur ${res.status}:`, body)
  }
}

export async function sendVerificationEmail(config, user, token) {
  const link = `${config.appUrl}/verify-email?token=${token}`
  await sendEmail(config, {
    to: user.email,
    toName: `${user.firstName} ${user.lastName}`,
    subject: 'Vérifiez votre adresse email – Selline',
    html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0">
        <div style="background:linear-gradient(135deg,#0f172a,#1e293b);padding:32px 40px;text-align:center">
          <span style="font-size:28px;font-weight:900;color:#facc15;letter-spacing:-0.5px">selline</span>
        </div>
        <div style="padding:40px">
          <h2 style="margin:0 0 16px;font-size:22px;color:#0f172a">Vérifiez votre adresse email</h2>
          <p style="color:#475569;line-height:1.7">Bonjour <strong>${user.firstName}</strong>,<br>Cliquez sur le bouton ci-dessous pour confirmer votre adresse email et activer votre compte Selline.</p>
          <div style="text-align:center;margin:32px 0;border:2px solid #facc15;border-radius:12px;padding:24px;background:#fffbeb">
            <a href="${link}" style="display:inline-block;background:linear-gradient(135deg,#facc15,#f59e0b);color:#0f172a;text-decoration:none;font-weight:800;font-size:16px;padding:14px 40px;border-radius:8px;letter-spacing:0.3px">✉️ Vérifier mon adresse</a>
          </div>
          <p style="color:#94a3b8;font-size:13px">Ce lien expire dans <strong>30 minutes</strong>. Si vous n'avez pas créé de compte Selline, ignorez cet email.</p>
          <p style="color:#94a3b8;font-size:12px;word-break:break-all">Lien : <a href="${link}" style="color:#facc15">${link}</a></p>
        </div>
        <div style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0">
          <p style="color:#94a3b8;font-size:12px;margin:0">© ${new Date().getFullYear()} Selline – Commerce en ligne Cameroun</p>
        </div>
      </div>`,
  })
}

export async function sendPasswordResetEmail(config, user, token) {
  const link = `${config.appUrl}/reset-password?token=${token}`
  await sendEmail(config, {
    to: user.email,
    toName: `${user.firstName} ${user.lastName}`,
    subject: 'Réinitialisation de mot de passe – Selline',
    html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0">
        <div style="background:linear-gradient(135deg,#0f172a,#1e293b);padding:32px 40px;text-align:center">
          <span style="font-size:28px;font-weight:900;color:#facc15;letter-spacing:-0.5px">selline</span>
        </div>
        <div style="padding:40px">
          <h2 style="margin:0 0 16px;font-size:22px;color:#0f172a">Réinitialisation de mot de passe</h2>
          <p style="color:#475569;line-height:1.7">Bonjour <strong>${user.firstName}</strong>,<br>Une demande de réinitialisation de mot de passe a été effectuée pour votre compte.</p>
          <div style="text-align:center;margin:32px 0;border:2px solid #facc15;border-radius:12px;padding:24px;background:#fffbeb">
            <a href="${link}" style="display:inline-block;background:linear-gradient(135deg,#facc15,#f59e0b);color:#0f172a;text-decoration:none;font-weight:800;font-size:16px;padding:14px 40px;border-radius:8px">🔑 Réinitialiser mon mot de passe</a>
          </div>
          <p style="color:#94a3b8;font-size:13px">Ce lien expire dans <strong>1 heure</strong>. Si vous n'avez pas demandé de réinitialisation, ignorez cet email.</p>
        </div>
        <div style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0">
          <p style="color:#94a3b8;font-size:12px;margin:0">© ${new Date().getFullYear()} Selline – Commerce en ligne Cameroun</p>
        </div>
      </div>`,
  })
}
