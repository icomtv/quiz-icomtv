// Função serverless da Vercel: recebe o lead do quiz e envia para o Slack.
// Configure na Vercel a variável de ambiente SLACK_WEBHOOK_URL.

const brl = n =>
  Number(n || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const clean = (s, max = 200) => String(s ?? "").replace(/[<>&*_~`]/g, "").trim().slice(0, max);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });

  const webhook = process.env.SLACK_WEBHOOK_URL;
  if (!webhook) return res.status(500).json({ error: "missing_webhook" });

  const b = typeof req.body === "string" ? safeJSON(req.body) : req.body || {};

  // Campo isca: robôs preenchem, pessoas não veem. Responde OK e descarta.
  if (b.site) return res.status(200).json({ ok: true });

  const nome = clean(b.nome, 80);
  const whatsapp = clean(b.whatsapp, 30);
  const digits = whatsapp.replace(/\D/g, "");
  if (!nome || digits.length < 10) return res.status(400).json({ error: "invalid" });

  const clinica = clean(b.clinica, 120) || "—";
  const cidade = clean(b.cidade, 80) || "—";
  const r = b.resultado || {};
  const respostas = Object.values(b.respostas || {})
    .slice(0, 10)
    .map(x => `• ${clean(x.pergunta, 140)}\n   *${clean(x.resposta, 60)}*`)
    .join("\n");
  const utm = Object.entries(b.utm || {})
    .slice(0, 8)
    .map(([k, v]) => `${String(k).replace(/[^\w-]/g, "").slice(0, 30)}=${clean(v, 80)}`)
    .join("  ·  ");
  const wa = `https://wa.me/${digits.length <= 11 ? "55" + digits : digits}`;
  const quando = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });

  const message = {
    text: `Novo lead do diagnóstico: ${nome} (${clinica}) · ${brl(r.mensal)}/mês`,
    blocks: [
      { type: "header", text: { type: "plain_text", text: "📺 Novo lead · Diagnóstico da Sala de Espera" } },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*Nome*\n${nome}` },
          { type: "mrkdwn", text: `*Clínica*\n${clinica}` },
          { type: "mrkdwn", text: `*WhatsApp*\n<${wa}|${whatsapp}>` },
          { type: "mrkdwn", text: `*Cidade*\n${cidade}` },
        ],
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*Potencial por mês*\n${brl(r.mensal)}` },
          { type: "mrkdwn", text: `*Potencial por ano*\n${brl(r.anual)}` },
          { type: "mrkdwn", text: `*Tratamentos a mais/mês*\n${Number(r.tratamentos || 0).toLocaleString("pt-BR")}` },
          { type: "mrkdwn", text: `*Horas de espera/mês*\n${Number(r.horas || 0)} h` },
        ],
      },
      { type: "divider" },
      { type: "section", text: { type: "mrkdwn", text: `*Respostas*\n${respostas || "—"}` } },
      {
        type: "context",
        elements: [{ type: "mrkdwn", text: `${quando}${utm ? "  ·  " + utm : ""}` }],
      },
    ],
  };

  try {
    const r2 = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });
    if (!r2.ok) throw new Error(`slack ${r2.status}`);
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(502).json({ error: "slack_failed" });
  }
}

function safeJSON(s) {
  try { return JSON.parse(s); } catch { return {}; }
}
