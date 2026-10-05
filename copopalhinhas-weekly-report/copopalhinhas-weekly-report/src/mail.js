const nodemailer = require('nodemailer');
const eur = n => (Number(n) || 0).toLocaleString('pt-PT', { maximumFractionDigits: 0 }) + ' €';
const pc = p => p == null ? '—' : (p >= 0 ? '+' : '') + Number(p).toFixed(1) + '%';
const li = a => (a && a.length ? a : ['—']).map(t => `<li style="margin:4px 0">${t}</li>`).join('');

async function enviar({ dados, analise, pptx, filename }) {
  const t = nodemailer.createTransport({ host: 'smtp.gmail.com', port: 465, secure: true, auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } });
  const s = dados.site, P = dados.periodo;
  const html = `<div style="font-family:Calibri,Arial,sans-serif;max-width:680px;color:#1C1C1C">
<div style="font-size:11px;letter-spacing:2px;color:#F26A21;font-weight:700">COPOPALHINHAS.PT · REPORT ${P.modo === 'mensal' ? 'MENSAL' : 'SEMANAL'}</div>
<h2 style="margin:6px 0 2px">${analise.titulo}</h2>
<div style="color:#777;font-size:13px">${P.nome || 'Semana'} ${P.atual} vs ${P.anterior}</div>
${(analise.sumario || []).map(c => `<div style="background:#FFF1EA;border-radius:8px;padding:10px 14px;margin:10px 0"><b>${c.titulo}</b><br>${c.texto}</div>`).join('')}
<p style="font-size:13px"><b>Receita</b> ${eur(s.purchase_revenue.cur)} (${pc(s.purchase_revenue.pct)}) · <b>Encomendas</b> ${s.ecommerce_purchases.cur} (${pc(s.ecommerce_purchases.pct)}) · <b>Sessões</b> ${s.sessions.cur} (${pc(s.sessions.pct)})</p>
<h3 style="font-size:14px;margin:14px 0 4px">Ações</h3><ul style="margin:0 0 0 18px;padding:0">${li((analise.acoes || []).map(x => typeof x === 'string' ? x : `[${x.prioridade}] ${x.acao} (${x.resp})`))}</ul>
<h3 style="font-size:14px;margin:14px 0 4px">Decisões pedidas</h3><ul style="margin:0 0 0 18px;padding:0">${li(analise.decisoes)}</ul>
<p style="font-size:12px;color:#777;margin-top:18px">Deck completo em anexo. Gerado automaticamente (Windsor.ai + Claude). Dados GA4 sujeitos a validação.</p></div>`;
  await t.sendMail({
    from: `"Digital Xperience" <${process.env.SMTP_USER}>`, to: process.env.MAIL_TO, cc: process.env.MAIL_CC || undefined,
    subject: `[Copopalhinhas] Report ${P.modo === 'mensal' ? 'mensal' : 'semanal'} ${P.atual} — ${analise.titulo}`, html,
    attachments: [{ filename, content: pptx }],
  });
}
module.exports = { enviar };
