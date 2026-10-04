// Gera o deck semanal (8 slides) a partir de { dados, analise }
const pptxgen = require("pptxgenjs");

const C = { ink: "1C1C1C", orange: "F26A21", tint: "FFF1EA", grey: "6E6E6E", light: "F4F4F4", white: "FFFFFF", green: "2E8B57", red: "C0392B", amber: "D98E04", line: "E2E2E2" };
const FH = "Cambria", FB = "Calibri", W = 13.33, H = 7.5, M = 0.6;
const eur = n => (Number(n) || 0).toLocaleString("pt-PT", { maximumFractionDigits: 0 }) + " €";
const num = n => (Number(n) || 0).toLocaleString("pt-PT", { maximumFractionDigits: 0 });
const pctTxt = p => p == null ? "—" : (p >= 0 ? "+" : "") + Number(p).toFixed(1) + "%";
const pctCol = p => p == null ? C.grey : p >= 0 ? C.green : C.red;
const delta = k => k.pct ?? (k.prev ? (k.cur / k.prev - 1) * 100 : null);

function buildDeck({ dados, analise }) {
  const d = typeof dados === "string" ? JSON.parse(dados) : dados;
  let a = analise;
  if (typeof a === "string") { try { a = JSON.parse(a.replace(/```json|```/g, "").trim()); } catch { a = { titulo: "Report semanal", veredicto: a, destaques: [], alertas: [], acoes: [] }; } }
  a = Object.assign({ titulo: "Report semanal", veredicto: "", destaques: [], alertas: [], acoes: [] }, a || {});
  const P = d.periodo;

  const pres = new pptxgen(); pres.layout = "LAYOUT_WIDE"; pres.author = "Digital Xperience";
  pres.title = `Copopalhinhas — Report semanal ${P.atual}`;
  let n = 0;
  const title = (s, t, sub) => { s.addText(t, { x: M, y: 0.4, w: W - 2 * M, h: 0.75, fontFace: FH, fontSize: 30, bold: true, color: C.ink, margin: 0 }); if (sub) s.addText(sub, { x: M, y: 1.12, w: W - 2 * M, h: 0.4, fontFace: FB, fontSize: 14, color: C.grey, margin: 0 }); };
  const footer = (s, dark) => { const col = dark ? "8A8A8A" : "9A9A9A"; s.addText(`Copopalhinhas · Report semanal ${P.atual} · Digital Xperience`, { x: M, y: H - 0.45, w: 8, h: 0.3, fontFace: FB, fontSize: 9, color: col, margin: 0 }); s.addText(String(n), { x: W - M - 1, y: H - 0.45, w: 1, h: 0.3, fontFace: FB, fontSize: 9, color: col, align: "right", margin: 0 }); };
  const stat = (s, x, y, w, h, value, label, k, fmt = num, vs = 26) => {
    const p = delta(k);
    s.addShape(pres.ShapeType.roundRect, { x, y, w, h, fill: { color: C.light }, line: { color: C.light }, rectRadius: 0.08 });
    s.addText(value, { x: x + 0.2, y: y + 0.15, w: w - 0.4, h: h * 0.42, fontFace: FH, fontSize: vs, bold: true, color: C.ink, margin: 0, valign: "middle" });
    s.addText(label, { x: x + 0.2, y: y + h * 0.55, w: w - 0.4, h: 0.3, fontFace: FB, fontSize: 11, color: C.grey, margin: 0 });
    s.addText(`${pctTxt(p)}  (${fmt(k.prev)})`, { x: x + 0.2, y: y + h * 0.55 + 0.28, w: w - 0.4, h: 0.3, fontFace: FB, fontSize: 12, bold: true, color: pctCol(p), margin: 0 });
  };
  const bullets = (s, items, x, y, w, h, fs = 13, color = C.ink) => s.addText((items.length ? items : ["—"]).map((t, i) => ({ text: t, options: { bullet: true, breakLine: i < items.length - 1, paraSpaceAfter: 6 } })), { x, y, w, h, fontFace: FB, fontSize: fs, color, valign: "top", margin: 0 });
  const table = (s, header, rows, x, y, w, colW, fs = 11, rowH = 0.34) => {
    const hd = header.map(h => ({ text: h, options: { bold: true, color: C.white, fill: { color: C.ink }, fontFace: FB, fontSize: fs, align: "center", valign: "middle" } }));
    const body = rows.map((r, ri) => r.map((c, ci) => { let color = C.ink, bold = false, text = c; if (c && typeof c === "object") { color = c.color || C.ink; bold = !!c.bold; text = c.text; } return { text: String(text), options: { fontFace: FB, fontSize: fs, color, bold, align: ci === 0 ? "left" : "center", valign: "middle", fill: { color: ri % 2 ? C.white : C.light } } }; }));
    s.addTable([hd, ...body], { x, y, w, colW, rowH, border: { type: "solid", color: C.line, pt: 0.5 } });
  };

  // 1 Capa
  { const s = pres.addSlide(); n++; s.background = { color: C.ink };
    s.addShape(pres.ShapeType.ellipse, { x: 9.2, y: -1.8, w: 6.5, h: 6.5, fill: { color: C.orange }, line: { color: C.orange } });
    s.addText("COPOPALHINHAS.PT", { x: M, y: 2.2, w: 8, h: 0.4, fontFace: FB, fontSize: 14, color: C.orange, bold: true, charSpacing: 4, margin: 0 });
    s.addText("Report semanal", { x: M, y: 2.65, w: 9, h: 0.9, fontFace: FH, fontSize: 44, bold: true, color: C.white, margin: 0 });
    s.addText(`Semana ${P.atual} vs ${P.anterior}`, { x: M, y: 3.55, w: 9, h: 0.8, fontFace: FH, fontSize: 30, color: C.white, margin: 0 });
    s.addText(a.titulo, { x: M, y: 4.5, w: 9, h: 0.5, fontFace: FB, fontSize: 16, color: "CFCFCF", margin: 0 });
    s.addText(`Digital Xperience · gerado automaticamente a ${new Date().toLocaleDateString("pt-PT")}\nDados via Windsor.ai (GA4, Google Ads, Search Console, Meta Ads) · análise por Claude`, { x: M, y: 6.3, w: 10, h: 0.7, fontFace: FB, fontSize: 11, color: "9A9A9A", margin: 0 }); }

  // 2 Veredicto + destaques + alertas
  { const s = pres.addSlide(); n++; title(s, "Resumo da semana", a.titulo);
    s.addShape(pres.ShapeType.roundRect, { x: M, y: 1.7, w: W - 2 * M, h: 1.25, fill: { color: C.tint }, line: { color: C.tint }, rectRadius: 0.08 });
    s.addText(a.veredicto, { x: M + 0.25, y: 1.78, w: W - 2 * M - 0.5, h: 1.1, fontFace: FB, fontSize: 14, color: C.ink, margin: 0, valign: "middle" });
    s.addText("Destaques", { x: M, y: 3.15, w: 6, h: 0.4, fontFace: FH, fontSize: 16, bold: true, color: C.ink, margin: 0 });
    bullets(s, a.destaques, M, 3.6, 6.4, 3.2, 12.5);
    s.addShape(pres.ShapeType.roundRect, { x: 7.4, y: 3.15, w: 5.33, h: 3.65, fill: { color: C.light }, line: { color: C.light }, rectRadius: 0.08 });
    s.addText("Alertas", { x: 7.65, y: 3.3, w: 5, h: 0.4, fontFace: FH, fontSize: 16, bold: true, color: C.red, margin: 0 });
    bullets(s, a.alertas, 7.65, 3.75, 4.85, 2.95, 12, C.ink);
    footer(s); }

  // 3 KPIs
  { const s = pres.addSlide(); n++; title(s, "KPIs do site (GA4)", `Semana ${P.atual} vs ${P.anterior}`);
    const S = d.site; const k = [
      [num(S.sessions.cur), "Sessões", S.sessions], [num(S.active_users.cur), "Utilizadores ativos", S.active_users],
      [num(S.ecommerce_purchases.cur), "Encomendas", S.ecommerce_purchases], [eur(S.purchase_revenue.cur), "Receita", S.purchase_revenue, eur],
      [eur(S.aov.cur), "Ticket médio", S.aov, eur], [S.conv_rate.cur + "%", "Taxa de conversão", S.conv_rate, v => v + "%"],
      [num(S.add_to_carts.cur), "Add to cart", S.add_to_carts], [num(S.checkouts.cur), "Checkouts", S.checkouts]];
    k.forEach((v, i) => stat(s, M + (i % 4) * 3.07, 1.8 + Math.floor(i / 4) * 1.85, 2.87, 1.6, v[0], v[1], v[2], v[3]));
    s.addShape(pres.ShapeType.roundRect, { x: M, y: 5.65, w: W - 2 * M, h: 1.0, fill: { color: C.tint }, line: { color: C.tint }, rectRadius: 0.08 });
    s.addText([{ text: "Nota de dados: ", options: { bold: true } }, { text: `${S.unassigned_share}% das encomendas da semana estão «Unassigned» (sem canal). O n.º de compras em GA4 está sujeito a validação enquanto o tracking está em correção; as variações relativas mantêm-se válidas.` }], { x: M + 0.25, y: 5.72, w: W - 2 * M - 0.5, h: 0.85, fontFace: FB, fontSize: 12, color: C.ink, margin: 0, valign: "middle" });
    footer(s); }

  // 4 Receita diária
  { const s = pres.addSlide(); n++; title(s, "Receita diária", "Semana atual vs semana anterior, dia a dia (GA4 purchase_revenue)");
    const dias = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
    const cur = (d.diario || []).filter(r => r.date >= P.cur_from && r.date <= P.cur_to).map(r => +r.purchase_revenue || 0);
    const prev = (d.diario || []).filter(r => r.date < P.cur_from).map(r => +r.purchase_revenue || 0);
    if (cur.length) {
      s.addChart(pres.ChartType.line, [{ name: `Anterior (${P.anterior})`, labels: dias, values: prev.concat(Array(7 - prev.length).fill(null)).slice(0, 7) }, { name: `Atual (${P.atual})`, labels: dias, values: cur.concat(Array(7 - cur.length).fill(null)).slice(0, 7) }],
        { x: M, y: 1.7, w: 8.3, h: 5.1, chartColors: ["BDBDBD", C.orange], lineSize: 3, lineDataSymbol: "circle", lineDataSymbolSize: 6, showLegend: true, legendPos: "t", legendFontSize: 11, catAxisLabelFontSize: 11, valAxisLabelFontSize: 10, catAxisLabelColor: C.ink, valAxisLabelColor: C.grey, valGridLine: { color: C.line, size: 0.5 }, catGridLine: { style: "none" }, valAxisLabelFormatCode: "#,##0" });
    } else s.addText("Sem série diária nos dados recebidos.", { x: M, y: 3, w: 8, h: 1, fontFace: FB, fontSize: 14, color: C.grey });
    const best = cur.length ? cur.indexOf(Math.max(...cur)) : -1, worst = cur.length ? cur.indexOf(Math.min(...cur)) : -1;
    s.addShape(pres.ShapeType.roundRect, { x: 9.2, y: 1.7, w: 3.53, h: 5.1, fill: { color: C.light }, line: { color: C.light }, rectRadius: 0.08 });
    s.addText("Leitura rápida", { x: 9.45, y: 1.9, w: 3.1, h: 0.4, fontFace: FH, fontSize: 15, bold: true, color: C.ink, margin: 0 });
    bullets(s, [
      `Total: ${eur(d.site.purchase_revenue.cur)} vs ${eur(d.site.purchase_revenue.prev)} (${pctTxt(delta(d.site.purchase_revenue))}).`,
      best >= 0 ? `Melhor dia: ${dias[best]} (${eur(cur[best])}).` : "",
      worst >= 0 ? `Pior dia: ${dias[worst]} (${eur(cur[worst])}).` : "",
      `Média diária: ${eur(d.site.purchase_revenue.cur / 7)}.`].filter(Boolean), 9.45, 2.4, 3.1, 4.3, 12);
    footer(s); }

  // 5 Canais
  { const s = pres.addSlide(); n++; title(s, "Desempenho por canal", "Sessões, encomendas e receita (GA4)");
    const rows = d.canais.slice(0, 10).map(c => [c.name, num(c.sessions.cur), num(c.sessions.prev), num(c.ecommerce_purchases.cur), num(c.ecommerce_purchases.prev), eur(c.purchase_revenue.cur), eur(c.purchase_revenue.prev), { text: pctTxt(c.purchase_revenue.pct), color: pctCol(c.purchase_revenue.pct), bold: true }]);
    table(s, ["Canal", "Sessões atual", "Sessões ant.", "Enc. atual", "Enc. ant.", "Receita atual", "Receita ant.", "Δ receita"], rows, M, 1.7, W - 2 * M, [2.6, 1.3, 1.3, 1.1, 1.1, 1.5, 1.5, 1.73]);
    footer(s); }

  // 6 Google Ads
  { const s = pres.addSlide(); n++; title(s, "Google Ads", `Semana ${P.atual} vs ${P.anterior}`);
    const g = d.google_ads.total; const k = [[eur(g.spend.cur), "Investimento", g.spend, eur], [num(g.clicks.cur), "Cliques", g.clicks], [g.conversions.cur.toFixed(1), "Conversões", g.conversions, v => Number(v).toFixed(1)], [eur(g.conversion_value.cur), "Valor de conversão", g.conversion_value, eur], [g.roas.cur + "x", "ROAS", g.roas, v => v + "x"], [eur(g.cpa.cur), "CPA", g.cpa, eur]];
    k.forEach((v, i) => stat(s, M + i * 2.03, 1.7, 1.9, 1.45, v[0], v[1], v[2], v[3], 22));
    const rows = d.google_ads.campanhas.slice(0, 9).map(c => { const roas = c.spend.cur ? c.conversion_value.cur / c.spend.cur : 0; return [c.name, eur(c.spend.cur), c.conversions.cur.toFixed(1), c.conversions.prev.toFixed(1), eur(c.conversion_value.cur), { text: roas.toFixed(1) + "x", color: roas >= 10 ? C.green : roas >= 5 ? C.amber : C.red, bold: true }]; });
    table(s, ["Campanha", "Custo", "Conv. atual", "Conv. ant.", "Valor conv.", "ROAS"], rows, M, 3.4, W - 2 * M, [4.5, 1.5, 1.4, 1.4, 1.7, 1.63], 10.5, 0.33);
    footer(s); }

  // 7 SEO
  { const s = pres.addSlide(); n++; title(s, "SEO — Search Console", "Semana vs semana · atenção ao atraso de 2–3 dias do GSC");
    const t = d.seo.total, b = d.seo.marca; const k = [[num(t.clicks.cur), "Cliques", t.clicks], [num(t.impressions.cur), "Impressões", t.impressions], [t.ctr.cur + "%", "CTR", t.ctr, v => v + "%"], [b.ctr.cur + "%", "CTR de marca", b.ctr, v => v + "%"]];
    k.forEach((v, i) => stat(s, M + i * 3.07, 1.7, 2.87, 1.45, v[0], v[1], v[2], v[3]));
    const rows = d.seo.top_impressoes.slice(0, 10).map(q => { const ctr = q.impressions.cur ? q.clicks.cur / q.impressions.cur * 100 : 0; return [q.name, num(q.impressions.cur), num(q.impressions.prev), num(q.clicks.cur), { text: ctr.toFixed(2) + "%", color: ctr < 0.5 ? C.red : ctr < 2 ? C.amber : C.green, bold: true }]; });
    s.addText("Top 10 consultas por impressões", { x: M, y: 3.4, w: 8, h: 0.35, fontFace: FH, fontSize: 14, bold: true, color: C.ink, margin: 0 });
    table(s, ["Consulta", "Impr. atual", "Impr. ant.", "Cliques", "CTR"], rows, M, 3.8, W - 2 * M, [5.13, 1.8, 1.8, 1.6, 1.8], 10.5, 0.28);
    footer(s); }

  // 8 Ações
  { const s = pres.addSlide(); n++; s.background = { color: C.ink };
    s.addShape(pres.ShapeType.ellipse, { x: -2.5, y: 4.2, w: 6, h: 6, fill: { color: C.orange }, line: { color: C.orange } });
    s.addText("Ações para a próxima semana", { x: M, y: 0.6, w: 11, h: 0.8, fontFace: FH, fontSize: 32, bold: true, color: C.white, margin: 0 });
    s.addText((a.acoes.length ? a.acoes : ["—"]).map((t, i) => ({ text: t, options: { bullet: { type: "number" }, breakLine: i < a.acoes.length - 1, paraSpaceAfter: 12 } })), { x: 4.2, y: 1.8, w: 8.5, h: 4.2, fontFace: FB, fontSize: 16, color: "F0F0F0", valign: "top", margin: 0 });
    s.addText("Gerado automaticamente · Windsor.ai + Claude + Zapier · Digital Xperience", { x: 4.2, y: 6.4, w: 8.5, h: 0.5, fontFace: FB, fontSize: 10, color: "9A9A9A", margin: 0 });
    footer(s, true); }

  return pres.write({ outputType: "nodebuffer" });
}
module.exports = { buildDeck };
