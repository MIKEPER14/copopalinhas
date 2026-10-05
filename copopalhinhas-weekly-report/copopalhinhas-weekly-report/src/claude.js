const fs = require('fs'); const path = require('path');
const PROMPT = fs.readFileSync(path.join(__dirname, 'prompt.txt'), 'utf8');

async function analisar(dados) {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: process.env.CLAUDE_MODEL || 'claude-sonnet-5', max_tokens: 4000, system: PROMPT,
      messages: [{ role: 'user', content: 'Dados da semana:\n' + JSON.stringify(dados) }] }),
  });
  const j = await r.json();
  if (!r.ok) throw new Error('Anthropic ' + r.status + ': ' + JSON.stringify(j));
  const txt = (j.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n').replace(/```json|```/g, '').trim();
  try { return JSON.parse(txt); } catch { return { titulo: 'Report semanal', sumario: [{ titulo: 'Falha ao interpretar a análise', texto: txt.slice(0, 400), estado: 'alerta' }], acoes: [], decisoes: [] }; }
}
module.exports = { analisar };
