const fs = require('fs');
const { periodos } = require('./dates');
const { recolher } = require('./windsor');
const { analisar } = require('./claude');
const { buildDeck } = require('./deck');
const { enviar } = require('./mail');

(async () => {
  const d = periodos();
  console.log(`Semana ${d.label_cur} vs ${d.label_prev}`);
  const dados = await recolher(d);
  console.log(`Dados: ${dados.site.sessions.cur} sessões, ${dados.site.ecommerce_purchases.cur} encomendas, ${dados.site.purchase_revenue.cur} €`);
  const analise = process.env.SKIP_CLAUDE ? { titulo: 'Report semanal', veredicto: '(análise desativada)', destaques: [], alertas: [], acoes: [] } : await analisar(dados);
  console.log(`Análise: ${analise.titulo}`);
  const pptx = await buildDeck({ dados, analise });
  const filename = `Copopalhinhas_Report_Semanal_${d.cur_to.replace(/-/g, '')}.pptx`;
  fs.mkdirSync('out', { recursive: true });
  fs.writeFileSync(`out/${filename}`, pptx);
  fs.writeFileSync('out/dados.json', JSON.stringify({ dados, analise }, null, 1));
  console.log(`PPTX: out/${filename} (${pptx.length} bytes)`);
  if (process.env.DRY_RUN) { console.log('DRY_RUN — email não enviado'); return; }
  await enviar({ dados, analise, pptx, filename });
  console.log(`Email enviado para ${process.env.MAIL_TO}`);
})().catch(e => { console.error(e); process.exit(1); });
