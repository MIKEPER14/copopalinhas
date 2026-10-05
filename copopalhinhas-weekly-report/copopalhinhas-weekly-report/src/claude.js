const fs = require('fs'); const path = require('path');
const PROMPT = fs.readFileSync(path.join(__dirname, 'prompt.txt'), 'utf8');

function extrairJSON(txt) {
  let t = String(txt || '').replace(/```json|```/g, '').trim();
  const i = t.indexOf('{'), j = t.lastIndexOf('}');
  if (i >= 0 && j > i) t = t.slice(i, j + 1);
  try { return JSON.parse(t); } catch {}
  // tenta reparar vírgulas finais e aspas tipográficas
  try { return JSON.parse(t.replace(/,\s*([}\]])/g, '$1').replace(/[“”]/g, '"')); } catch {}
  return null;
}

async function chamar(dados, maxTokens) {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({
      model: process.env.CLAUDE_MODEL || 'claude-sonnet-5', max_tokens: maxTokens, system: PROMPT,
      messages: [{ role: 'user', content: 'Dados da semana:\n' + JSON.stringify(dados) }],
    }),
  });
  const j = await r.json();
  if (!r.ok) throw new Error('Anthropic ' + r.status + ': ' + JSON.stringify(j));
  const txt = (j.content || []).filter(b => b.type === 'text').map(b => b.text).join('');
  return { txt, stop: j.stop_reason };
}

async function analisar(dados) {
  let { txt, stop } = await chamar(dados, 8000);
  let a = extrairJSON(txt);
  if (!a && stop === 'max_tokens') { console.log('Resposta cortada — a repetir com mais margem'); ({ txt, stop } = await chamar(dados, 16000)); a = extrairJSON(txt); }
  try { fs.mkdirSync('out', { recursive: true }); fs.writeFileSync('out/analise_raw.txt', txt); } catch {}
  if (a) return a;
  console.log('Não foi possível interpretar a análise (stop_reason=' + stop + ')');
  return { titulo: 'Report semanal', sumario: [{ titulo: 'Falha ao interpretar a análise', texto: txt.slice(0, 400), estado: 'alerta' }], acoes: [], decisoes: [] };
}
module.exports = { analisar, extrairJSON };
