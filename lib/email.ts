import { Resend } from "resend"

// Envio de e-mail do portal (Resend). O remetente precisa ser de um domínio
// verificado em resend.com/domains — senão o Resend recusa (403) e, com
// onboarding@resend.dev, só entrega na caixa do dono da conta Resend.
const resend = new Resend(process.env.RESEND_API_KEY?.trim())
const REMETENTE = process.env.RESEND_FROM?.trim() || "Portal CFO PM 2026 <onboarding@resend.dev>"

/** Envia e devolve o erro do Resend (o SDK não lança: devolve `{ error }`). */
export async function enviarEmail(para: string, assunto: string, html: string): Promise<{ ok: true } | { ok: false; erro: string }> {
  try {
    const { error } = await resend.emails.send({ from: REMETENTE, to: para, subject: assunto, html })
    if (error) {
      console.error("[email] Resend recusou:", error.name, error.message)
      return { ok: false, erro: error.message }
    }
    return { ok: true }
  } catch (e) {
    console.error("[email] falha ao enviar:", e)
    return { ok: false, erro: e instanceof Error ? e.message : String(e) }
  }
}

/** Corpo padrão: saudação + parágrafos, na linguagem visual do portal. */
export function htmlEmail(nomeGuerra: string, ...paragrafos: string[]) {
  return `
    <div style="font-family:Georgia,serif;color:#2b2a27;max-width:520px">
      <p style="color:#3a4a3a;font-size:18px;margin:0 0 12px"><strong>Portal CFO PM 2026</strong></p>
      <p>Olá, ${nomeGuerra}!</p>
      ${paragrafos.map(p => `<p>${p}</p>`).join("")}
      <p style="color:#888;font-size:12px;margin-top:24px">Mensagem automática — não responda.</p>
    </div>`
}

export const urlPortal = () => (process.env.NEXTAUTH_URL || "https://portalcfo2026.com.br").replace(/\/$/, "")
