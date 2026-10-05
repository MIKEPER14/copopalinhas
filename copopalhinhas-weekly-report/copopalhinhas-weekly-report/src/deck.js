// Gera o deck semanal (16 slides, mesma estrutura do report mensal) a partir de { dados, analise }
const pptxgen = require("pptxgenjs");
const S = require("./static");

const C = { ink: "1C1C1C", orange: "F26A21", tint: "FFF1EA", grey: "6E6E6E", light: "F4F4F4", white: "FFFFFF", green: "2E8B57", red: "C0392B", amber: "D98E04", line: "E2E2E2" };
const FH = "Cambria", FB = "Calibri", W = 13.33, H = 7.5, M = 0.6;
const num = n => Math.round(Number(n) || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
const eur = n => num(n) + " €";
const eurK = n => (Math.abs(n) >= 10000 ? (n / 1000).toLocaleString("pt-PT", { maximumFractionDigits: 1 }) + "k €" : eur(n));
const dec = (n, k = 1) => (Number(n) || 0).toLocaleString("pt-PT", { minimumFractionDigits: k, maximumFractionDigits: k });
const pctTxt = p => p == null ? "—" : (p >= 0 ? "+" : "") + dec(p) + "%";
const pctCol = p => p == null ? C.grey : p >= 0 ? C.green : C.red;
const delta = k => k.pct ?? (k.prev ? (k.cur / k.prev - 1) * 100 : null);
const ppTxt = (c, p) => { const d = c - p; return (d >= 0 ? "+" : "") + dec(d, 1) + " pp"; };
const estadoCol = e => e === "positivo" ? C.green : e === "negativo" ? C.red : C.amber;
const colOf = c => C[c] || C.amber;
const list = (a, fb = ["—"]) => (Array.isArray(a) && a.length ? a.map(String) : fb);

function buildDeck({ dados, analise }) {
  const d = typeof dados === "string" ? JSON.parse(dados) : dados;
  let a = analise;
  if (typeof a === "string") { try { a = JSON.parse(a.replace(/```json|```/g, "").trim()); } catch { a = {}; } }
  a = Object.assign({ titulo: "Report semanal", sumario: [], leitura_receita: [], leitura_canais: [], diagnostico_ads: [], leitura_seo: "", leitura_meta: [], leitura_dispositivos: [], acoes: [], decisoes: [] }, a || {});
  const P = d.periodo, site = d.site, g = d.google_ads.total, seo = d.seo.total, b = d.seo.marca, m = d.meta_ads;
  const NOME = P.nome || 'Semana', NOMEM = P.nome_min || 'semana', MENSAL = P.modo === 'mensal';
  const sub = `${NOME} ${P.atual} vs ${P.anterior}`;
  const hoje = new Date();
  const proxima = new Date(hoje); if (MENSAL) { proxima.setMonth(hoje.getMonth() + 1, 2); } else { proxima.setDate(hoje.getDate() + ((8 - hoje.getDay()) % 7 || 7)); }

  const pres = new pptxgen(); pres.layout = "LAYOUT_WIDE"; pres.author = "Digital Xperience";
  pres.title = `Copopalhinhas — Report ${NOMEM === 'mês' ? 'mensal' : 'semanal'} ${P.atual}`;
  let n = 0;
  const title = (s, t, st) => { s.addText(t, { x: M, y: 0.4, w: W - 2 * M, h: 0.75, fontFace: FH, fontSize: 30, bold: true, color: C.ink, margin: 0 }); if (st) s.addText(st, { x: M, y: 1.12, w: W - 2 * M, h: 0.4, fontFace: FB, fontSize: 14, color: C.grey, margin: 0 }); };
  const footer = (s, dark) => { const col = dark ? "8A8A8A" : "9A9A9A"; s.addText(`Copopalhinhas · Report ${MENSAL ? 'mensal' : 'semanal'} ${P.atual} · Digital Xperience`, { x: M, y: H - 0.45, w: 8, h: 0.3, fontFace: FB, fontSize: 9, color: col, margin: 0 }); s.addText(String(n), { x: W - M - 1, y: H - 0.45, w: 1, h: 0.3, fontFace: FB, fontSize: 9, color: col, align: "right", margin: 0 }); };
  const box = (s, x, y, w, h, fill = C.light) => s.addShape(pres.ShapeType.roundRect, { x, y, w, h, fill: { color: fill }, line: { color: fill }, rectRadius: 0.08 });
  const stat = (s, x, y, w, h, value, label, deltaTxt, deltaCol, vs = 26) => {
    box(s, x, y, w, h);
    s.addText(value, { x: x + 0.2, y: y + 0.15, w: w - 0.4, h: h * 0.42, fontFace: FH, fontSize: vs, bold: true, color: C.ink, margin: 0, valign: "middle" });
    s.addText(label, { x: x + 0.2, y: y + h * 0.55, w: w - 0.4, h: 0.3, fontFace: FB, fontSize: 11, color: C.grey, margin: 0 });
    s.addText(deltaTxt, { x: x + 0.2, y: y + h * 0.55 + 0.28, w: w - 0.4, h: 0.3, fontFace: FB, fontSize: 12, bold: true, color: deltaCol, margin: 0 });
  };
  const kstat = (s, x, y, w, h, value, label, k, fmt = num, vs = 26) => stat(s, x, y, w, h, value, label, `${pctTxt(delta(k))}  (${fmt(k.prev)})`, pctCol(delta(k)), vs);
  const pstat = (s, x, y, w, h, value, label, k, suf = "%", vs = 26) => stat(s, x, y, w, h, value, label, `${ppTxt(k.cur, k.prev)}  (${dec(k.prev, 2)}${suf})`, k.cur >= k.prev ? C.green : C.red, vs);
  const bullets = (s, items, x, y, w, h, fs = 13, color = C.ink) => { const it = list(items); s.addText(it.map((t, i) => ({ text: t, options: { bullet: true, breakLine: i < it.length - 1, paraSpaceAfter: 6 } })), { x, y, w, h, fontFace: FB, fontSize: fs, color, valign: "top", margin: 0 }); };
  const circleNum = (s, x, y, k, dd = 0.45) => { s.addShape(pres.ShapeType.ellipse, { x, y, w: dd, h: dd, fill: { color: C.orange }, line: { color: C.orange } }); s.addText(String(k), { x, y, w: dd, h: dd, fontFace: FB, fontSize: 13, bold: true, color: C.white, align: "center", valign: "middle", margin: 0 }); };
  const table = (s, header, rows, x, y, w, colW, fs = 11, rowH = 0.34, left = []) => {
    const hd = header.map(h => ({ text: h, options: { bold: true, color: C.white, fill: { color: C.ink }, fontFace: FB, fontSize: fs, align: "center", valign: "middle" } }));
    const body = rows.map((r, ri) => r.map((c, ci) => { let color = C.ink, bold = false, text = c; if (c && typeof c === "object") { color = c.color || C.ink; bold = !!c.bold; text = c.text; } return { text: String(text ?? ""), options: { fontFace: FB, fontSize: fs, color, bold, align: ci === 0 || left.includes(ci) ? "left" : "center", valign: "middle", fill: { color: ri % 2 ? C.white : C.light } } }; }));
    s.addTable([hd, ...body], { x, y, w, colW, rowH, border: { type: "solid", color: C.line, pt: 0.5 } });
  };
  const tintNote = (s, y, h, runs, fs = 12) => { box(s, M, y, W - 2 * M, h, C.tint); s.addText(runs, { x: M + 0.25, y: y + 0.07, w: W - 2 * M - 0.5, h: h - 0.15, fontFace: FB, fontSize: fs, color: C.ink, margin: 0, valign: "middle" }); };

  // 1 Capa
  { const s = pres.addSlide(); n++; s.background = { color: C.ink };
    s.addShape(pres.ShapeType.ellipse, { x: 9.2, y: -1.8, w: 6.5, h: 6.5, fill: { color: C.orange }, line: { color: C.orange } });
    s.addText("COPOPALHINHAS.PT", { x: M, y: 2.2, w: 8, h: 0.4, fontFace: FB, fontSize: 14, color: C.orange, bold: true, charSpacing: 4, margin: 0 });
    s.addText("Report de Performance", { x: M, y: 2.65, w: 9, h: 0.9, fontFace: FH, fontSize: 44, bold: true, color: C.white, margin: 0 });
    s.addText(`${NOME} ${P.atual} vs ${P.anterior}`, { x: M, y: 3.55, w: 9, h: 0.8, fontFace: FH, fontSize: 32, color: C.white, margin: 0 });
    s.addText("SEO · Google Ads · Meta Ads · Tracking · Próximos passos", { x: M, y: 4.5, w: 9, h: 0.4, fontFace: FB, fontSize: 14, color: "CFCFCF", margin: 0 });
    s.addText(`Digital Xperience · ${hoje.toLocaleDateString("pt-PT", { day: "numeric", month: "long", year: "numeric" })}\nDados via Windsor.ai (GA4, Google Ads, Search Console, Meta Ads) · análise por Claude · gerado automaticamente`, { x: M, y: 6.3, w: 10, h: 0.7, fontFace: FB, fontSize: 11, color: "9A9A9A", margin: 0 }); }

  // 2 Sumário executivo
  { const s = pres.addSlide(); n++; title(s, "Sumário executivo", `${sub} · ${a.titulo}`);
    const cards = (a.sumario || []).slice(0, 4);
    while (cards.length < 4) cards.push({ titulo: "—", texto: "", estado: "alerta" });
    cards.forEach((c, i) => { const x = M + (i % 2) * 6.15, y = 1.75 + Math.floor(i / 2) * 2.45, w = 5.95, h = 2.25;
      box(s, x, y, w, h); s.addShape(pres.ShapeType.ellipse, { x: x + 0.25, y: y + 0.3, w: 0.3, h: 0.3, fill: { color: estadoCol(c.estado) }, line: { color: estadoCol(c.estado) } });
      s.addText(String(c.titulo || ""), { x: x + 0.7, y: y + 0.2, w: w - 0.9, h: 0.5, fontFace: FH, fontSize: 17, bold: true, color: C.ink, margin: 0, valign: "middle" });
      s.addText(String(c.texto || ""), { x: x + 0.25, y: y + 0.8, w: w - 0.5, h: h - 1.0, fontFace: FB, fontSize: 12.5, color: C.ink, margin: 0, valign: "top" }); });
    footer(s); }

  // 3 KPIs
  { const s = pres.addSlide(); n++; title(s, "KPIs globais do site (GA4)", `${sub} · Copopalhinhas.pt - GA4`);
    kstat(s, M, 1.8, 2.87, 1.6, num(site.sessions.cur), "Sessões", site.sessions);
    kstat(s, M + 3.07, 1.8, 2.87, 1.6, num(site.active_users.cur), "Utilizadores ativos", site.active_users);
    kstat(s, M + 6.14, 1.8, 2.87, 1.6, num(site.ecommerce_purchases.cur), "Encomendas (purchase)", site.ecommerce_purchases);
    kstat(s, M + 9.21, 1.8, 2.87, 1.6, eurK(site.purchase_revenue.cur), "Receita", site.purchase_revenue, eurK);
    kstat(s, M, 3.65, 2.87, 1.6, eur(site.aov.cur), "Ticket médio", site.aov, eur);
    pstat(s, M + 3.07, 3.65, 2.87, 1.6, dec(site.conv_rate.cur, 1) + "%", "Taxa de conversão (sessão)", site.conv_rate);
    kstat(s, M + 6.14, 3.65, 2.87, 1.6, num(site.add_to_carts.cur), "Add to cart", site.add_to_carts);
    kstat(s, M + 9.21, 3.65, 2.87, 1.6, num(site.checkouts.cur), "Checkouts (begin_checkout)", site.checkouts);
    tintNote(s, 5.65, 1.15, [{ text: "Leitura: ", options: { bold: true } }, { text: list(a.leitura_receita, [""])[0] + " " }, { text: "Nota de dados: ", options: { bold: true } }, { text: `${dec(site.unassigned_share, 1)}% das encomendas estão «Unassigned»; o n.º de compras em GA4 está sujeito a validação (duplicação de purchase em aberto); as variações relativas mantêm-se válidas.` }]);
    footer(s); }

  // 4 Receita diária
  { const s = pres.addSlide(); n++; title(s, `Receita diária: ${NOMEM} atual vs anterior`, MENSAL ? "Sobreposição dia a dia (1–31) · GA4 purchase_revenue · €" : "Sobreposição dia a dia (segunda a domingo) · GA4 purchase_revenue · €");
    const dias = MENSAL ? Array.from({ length: 31 }, (_, i) => String(i + 1)) : ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
    const ND = dias.length;
    const cur = (d.diario || []).filter(r => r.date >= P.cur_from && r.date <= P.cur_to).map(r => +r.purchase_revenue || 0);
    const prev = (d.diario || []).filter(r => r.date < P.cur_from).map(r => +r.purchase_revenue || 0);
    const pad = v => v.concat(Array(Math.max(0, ND - v.length)).fill(null)).slice(0, ND);
    s.addChart(pres.ChartType.line, [{ name: `Anterior (${P.anterior})`, labels: dias, values: pad(prev) }, { name: `Atual (${P.atual})`, labels: dias, values: pad(cur) }],
      { x: M, y: 1.7, w: 8.3, h: 5.1, chartColors: ["BDBDBD", C.orange], lineSize: 3, lineDataSymbol: "circle", lineDataSymbolSize: 6, showLegend: true, legendPos: "t", legendFontSize: 11, legendFontFace: FB, catAxisLabelFontSize: MENSAL ? 9 : 11, valAxisLabelFontSize: 10, catAxisLabelColor: C.ink, valAxisLabelColor: C.grey, valGridLine: { color: C.line, size: 0.5 }, catGridLine: { style: "none" }, valAxisLabelFormatCode: "#,##0", lineDataSymbolSize: MENSAL ? 4 : 6 });
    box(s, 9.2, 1.7, 3.53, 5.1); s.addText("O que o gráfico mostra", { x: 9.45, y: 1.9, w: 3.1, h: 0.4, fontFace: FH, fontSize: 15, bold: true, color: C.ink, margin: 0 });
    const best = cur.length ? cur.indexOf(Math.max(...cur)) : -1;
    bullets(s, list(a.leitura_receita, [`Total ${eur(site.purchase_revenue.cur)} vs ${eur(site.purchase_revenue.prev)} (${pctTxt(delta(site.purchase_revenue))}).`, best >= 0 ? `Melhor dia: ${MENSAL ? 'dia ' : ''}${dias[best]} (${eur(cur[best])}).` : ""].filter(Boolean)), 9.45, 2.4, 3.1, 4.3, 11.5);
    footer(s); }

  // 5 Canais
  { const s = pres.addSlide(); n++; title(s, "Desempenho por canal", `${sub} · sessões, encomendas e receita (GA4)`);
    const rows = d.canais.slice(0, 9).map(c => [c.name === "Unassigned" ? "Unassigned *" : c.name, num(c.sessions.cur), num(c.sessions.prev), num(c.ecommerce_purchases.cur), num(c.ecommerce_purchases.prev), eurK(c.purchase_revenue.cur), eurK(c.purchase_revenue.prev), { text: pctTxt(c.purchase_revenue.pct), color: pctCol(c.purchase_revenue.pct), bold: true }]);
    table(s, ["Canal", "Sessões atual", "Sessões ant.", "Enc. atual", "Enc. ant.", "Receita atual", "Receita ant.", "Δ Receita"], rows, M, 1.7, 8.2, [2.0, 0.9, 0.9, 0.75, 0.75, 0.95, 0.95, 1.0], 10.5, 0.36);
    s.addText(`* Unassigned = compras sem sessão atribuída (${dec(site.unassigned_share, 1)}% das encomendas do ${NOMEM}).${MENSAL ? '' : ' Períodos com o mesmo n.º de dias — variações diretamente comparáveis.'}`, { x: M, y: 5.45, w: 8.2, h: 0.6, fontFace: FB, fontSize: 9.5, color: C.grey, italic: true, margin: 0 });
    box(s, 9.1, 1.7, 3.63, 5.1, C.tint); s.addText("Leitura", { x: 9.35, y: 1.9, w: 3.2, h: 0.4, fontFace: FH, fontSize: 15, bold: true, color: C.ink, margin: 0 });
    bullets(s, a.leitura_canais, 9.35, 2.4, 3.2, 4.3, 11);
    footer(s); }

  // 6 Google Ads
  { const s = pres.addSlide(); n++; title(s, "Google Ads", `${sub} · conta Copo Palhinhas`);
    const ks = [[eur(g.spend.cur), "Investimento", g.spend, eur], [num(g.clicks.cur), "Cliques", g.clicks], [dec(g.conversions.cur, 0), "Conversões", g.conversions, v => dec(v, 0)], [eurK(g.conversion_value.cur), "Valor de conversão", g.conversion_value, eurK], [dec(g.roas.cur, 1) + "x", "ROAS", g.roas, v => dec(v, 1) + "x"], [eur(g.cpa.cur), "CPA", g.cpa, eur]];
    ks.forEach((v, i) => kstat(s, M + i * 2.03, 1.7, 1.9, 1.45, v[0], v[1], v[2], v[3], 22));
    const rows = d.google_ads.campanhas.slice(0, 8).map(c => { const roas = c.spend.cur ? c.conversion_value.cur / c.spend.cur : 0; const tipo = /pmax/i.test(c.name) ? "Pmax" : /shopping/i.test(c.name) ? "Shopping" : "Search"; return [c.name, tipo, `${num(c.clicks.prev)} → ${num(c.clicks.cur)}`, `${dec(c.conversions.prev, 0)} → ${dec(c.conversions.cur, 0)}`, `${eurK(c.conversion_value.prev)} → ${eurK(c.conversion_value.cur)}`, { text: dec(roas, 1) + "x", color: roas >= 10 ? C.green : roas >= 5 ? C.amber : C.red, bold: true }]; });
    table(s, ["Campanha", "Tipo", "Cliques", "Conversões", "Valor conv.", "ROAS"], rows, M, 3.4, 7.9, [2.3, 0.9, 1.3, 1.1, 1.5, 0.8], 10, 0.33);
    box(s, 8.8, 3.4, 3.93, 3.4, C.tint); s.addText("Diagnóstico", { x: 9.05, y: 3.55, w: 3.5, h: 0.4, fontFace: FH, fontSize: 15, bold: true, color: C.ink, margin: 0 });
    bullets(s, a.diagnostico_ads, 9.05, 4.0, 3.5, 2.75, 10.5);
    footer(s); }

  // 7 SEO
  { const s = pres.addSlide(); n++; title(s, "SEO — Search Console", `${sub} · sc-domain:copopalhinhas.pt · GSC tem 2–3 dias de atraso`);
    kstat(s, M, 1.7, 2.87, 1.45, num(seo.clicks.cur), "Cliques", seo.clicks);
    kstat(s, M + 3.07, 1.7, 2.87, 1.45, num(seo.impressions.cur), "Impressões", seo.impressions);
    pstat(s, M + 6.14, 1.7, 2.87, 1.45, dec(seo.ctr.cur, 2) + "%", "CTR", seo.ctr);
    pstat(s, M + 9.21, 1.7, 2.87, 1.45, dec(b.ctr.cur, 1) + "%", "CTR de marca", b.ctr);
    const rm = (d.seo.consultas_marca || []).slice(0, 5).map(q => { const c1 = q.impressions.prev ? q.clicks.prev / q.impressions.prev * 100 : 0, c2 = q.impressions.cur ? q.clicks.cur / q.impressions.cur * 100 : 0; return [q.name, `${num(q.impressions.prev)} → ${num(q.impressions.cur)}`, `${num(q.clicks.prev)} → ${num(q.clicks.cur)}`, { text: `${dec(c1, 1)}% → ${dec(c2, 1)}%`, color: c2 >= c1 ? C.green : C.red, bold: true }]; });
    s.addText("Marca", { x: M, y: 3.4, w: 6, h: 0.35, fontFace: FH, fontSize: 14, bold: true, color: C.ink, margin: 0 });
    table(s, ["Consulta", "Impressões", "Cliques", "CTR"], rm.length ? rm : [["—", "", "", ""]], M, 3.8, 6.1, [1.9, 1.5, 1.2, 1.5], 10.5, 0.3);
    const rg = (d.seo.consultas_genericas || []).slice(0, 5).map(q => { const c2 = q.impressions.cur ? q.clicks.cur / q.impressions.cur * 100 : 0; return [q.name, `${num(q.impressions.prev)} → ${num(q.impressions.cur)}`, `${num(q.clicks.prev)} → ${num(q.clicks.cur)}`, { text: dec(c2, 2) + "%", color: C.red, bold: true }]; });
    s.addText("Genéricas de baixa qualidade (CTR < 0,5%)", { x: 6.95, y: 3.4, w: 6, h: 0.35, fontFace: FH, fontSize: 14, bold: true, color: C.ink, margin: 0 });
    table(s, ["Consulta", "Impressões", "Cliques", "CTR"], rg.length ? rg : [["—", "", "", ""]], 6.95, 3.8, 5.78, [1.7, 1.6, 1.1, 1.38], 10.5, 0.3);
    tintNote(s, 5.85, 0.95, [{ text: "Leitura: ", options: { bold: true } }, { text: String(a.leitura_seo || "") }], 11.5);
    footer(s); }

  // 8 Meta + dispositivos
  { const s = pres.addSlide(); n++; title(s, "Meta Ads e dispositivos", sub);
    s.addText("Meta Ads", { x: M, y: 1.7, w: 6, h: 0.4, fontFace: FH, fontSize: 15, bold: true, color: C.ink, margin: 0 });
    kstat(s, M, 2.2, 2.9, 1.4, eur(m.spend.cur), "Investimento", m.spend, eur, 24);
    kstat(s, M + 3.05, 2.2, 2.9, 1.4, num(m.impressions.cur), "Impressões", m.impressions, num, 24);
    kstat(s, M, 3.75, 2.9, 1.4, num(m.link_clicks.cur), "Cliques no link", m.link_clicks, num, 24);
    const mp = m.actions_purchase || { cur: 0, prev: 0 };
    stat(s, M + 3.05, 3.75, 2.9, 1.4, num(mp.cur), "Compras atribuídas (Pixel)", mp.cur ? `${pctTxt(delta(mp))}  (${num(mp.prev)})` : "Pixel não reporta", mp.cur ? C.green : C.red, 24);
    bullets(s, a.leitura_meta, M, 5.4, 6.0, 1.4, 11);
    s.addText("Dispositivo (GA4)", { x: 7.1, y: 1.7, w: 5.6, h: 0.4, fontFace: FH, fontSize: 15, bold: true, color: C.ink, margin: 0 });
    const dv = nm => (d.dispositivos || []).find(x => x.name === nm) || { purchase_revenue: { cur: 0, prev: 0 } };
    const dk = dv("desktop"), mb = dv("mobile");
    s.addChart(pres.ChartType.bar, [{ name: `Anterior (${P.anterior})`, labels: ["Desktop", "Mobile"], values: [dk.purchase_revenue.prev, mb.purchase_revenue.prev] }, { name: `Atual (${P.atual})`, labels: ["Desktop", "Mobile"], values: [dk.purchase_revenue.cur, mb.purchase_revenue.cur] }],
      { x: 7.1, y: 2.15, w: 5.63, h: 3.0, barDir: "col", barGrouping: "clustered", chartColors: ["BDBDBD", C.orange], showValue: true, dataLabelPosition: "outEnd", dataLabelFontSize: 10, dataLabelFormatCode: "#,##0 €", showLegend: true, legendPos: "t", legendFontSize: 10, catAxisLabelFontSize: 11, valAxisLabelFontSize: 9, valAxisLabelColor: C.grey, catAxisLabelColor: C.ink, valGridLine: { color: C.line, size: 0.5 }, catGridLine: { style: "none" }, valAxisLabelFormatCode: "#,##0", showTitle: true, title: "Receita por dispositivo", titleFontSize: 11, titleColor: C.grey });
    bullets(s, a.leitura_dispositivos, 7.1, 5.3, 5.63, 1.5, 11);
    footer(s); }

  // 9 Tracking
  { const s = pres.addSlide(); n++; title(s, "Qualidade de dados e tracking", `O que os números deste ${NOMEM} revelam sobre a medição`);
    const mp = m.actions_purchase || { cur: 0 };
    const atcRatio = site.ecommerce_purchases.cur ? site.add_to_carts.cur / site.ecommerce_purchases.cur : 0;
    const items = [
      { h: site.add_to_carts.cur > 0 ? "add_to_cart a medir" : "add_to_cart a zero", t: `${num(site.add_to_carts.cur)} add_to_cart para ${num(site.ecommerce_purchases.cur)} compras (${dec(atcRatio, 1)} por compra). ${atcRatio < 1.5 ? "Rácio demasiado baixo — o evento não dispara em todos os fluxos." : "Rácio plausível; já permite medir abandono de carrinho."}`, c: atcRatio < 1.5 ? "red" : "green" },
      { h: site.checkouts.cur < site.ecommerce_purchases.cur ? "begin_checkout não é fiável" : "begin_checkout a medir", t: `${num(site.checkouts.cur)} checkouts para ${num(site.ecommerce_purchases.cur)} compras. ${site.checkouts.cur < site.ecommerce_purchases.cur ? "O funil GA4 (carrinho → checkout → compra) não pode ser usado até o evento ser corrigido." : "Funil utilizável."}`, c: site.checkouts.cur < site.ecommerce_purchases.cur ? "red" : "green" },
      { h: `${dec(site.unassigned_share, 0)}% das compras «Unassigned»`, t: `Encomendas sem canal atribuído. ${site.unassigned_share > 15 ? "Provável disparo do purchase fora da sessão (server-side / plugin duplicado). Distorce o ROAS de todos os canais." : "Dentro do aceitável."}`, c: site.unassigned_share > 15 ? "red" : "green" },
      { h: mp.cur ? "Meta Pixel a reportar compras" : "Meta Pixel sem compras", t: mp.cur ? `${num(mp.cur)} compras atribuídas pelo Pixel neste ${NOMEM}.` : `0 compras atribuídas com ${num(m.link_clicks.cur)} cliques no link. Sem Pixel + CAPI a funcionar, o Meta otimiza para cliques, não para vendas.`, c: mp.cur ? "green" : "red" },
      ...S.tracking_fixo,
    ];
    items.slice(0, 6).forEach((it, i) => { const x = M + (i % 3) * 4.08, y = 1.75 + Math.floor(i / 3) * 2.5, w = 3.9, h = 2.3;
      box(s, x, y, w, h); s.addShape(pres.ShapeType.ellipse, { x: x + 0.2, y: y + 0.25, w: 0.28, h: 0.28, fill: { color: colOf(it.c) }, line: { color: colOf(it.c) } });
      s.addText(it.h, { x: x + 0.6, y: y + 0.15, w: w - 0.8, h: 0.5, fontFace: FH, fontSize: 14, bold: true, color: C.ink, margin: 0, valign: "middle" });
      s.addText(it.t, { x: x + 0.2, y: y + 0.75, w: w - 0.4, h: h - 0.9, fontFace: FB, fontSize: 11.5, color: C.ink, margin: 0, valign: "top" }); });
    footer(s); }

  // 10 Roadmap
  { const s = pres.addSlide(); n++; s.background = { color: C.ink };
    s.addText("Próximos passos", { x: M, y: 0.5, w: 10, h: 0.8, fontFace: FH, fontSize: 34, bold: true, color: C.white, margin: 0 });
    s.addText("Quatro frentes, sequenciadas pelo impacto nos resultados", { x: M, y: 1.25, w: 10, h: 0.4, fontFace: FB, fontSize: 14, color: "CFCFCF", margin: 0 });
    S.roadmap.forEach((p, i) => { const x = M + i * 3.08, y = 2.0, w = 2.9, h = 4.7;
      s.addShape(pres.ShapeType.roundRect, { x, y, w, h, fill: { color: "2A2A2A" }, line: { color: "2A2A2A" }, rectRadius: 0.1 });
      circleNum(s, x + 0.25, y + 0.3, i + 1, 0.5);
      s.addText(p.w, { x: x + 0.9, y: y + 0.28, w: w - 1.1, h: 0.25, fontFace: FB, fontSize: 10.5, color: C.orange, bold: true, margin: 0 });
      s.addText(p.h, { x: x + 0.9, y: y + 0.52, w: w - 1.1, h: 0.4, fontFace: FH, fontSize: 19, bold: true, color: C.white, margin: 0 });
      s.addText(p.t.map((t, j) => ({ text: t, options: { bullet: true, breakLine: j < p.t.length - 1, paraSpaceAfter: 8 } })), { x: x + 0.25, y: y + 1.15, w: w - 0.45, h: h - 1.3, fontFace: FB, fontSize: 12, color: "E8E8E8", valign: "top", margin: 0 }); });
    footer(s, true); }

  // 11 Ações imediatas
  { const s = pres.addSlide(); n++; title(s, "Ações imediatas — Ads, SEO e tracking", `Prioridade P0/P1 deste ${NOMEM} · responsável DX salvo indicação`);
    const rows = (a.acoes || []).slice(0, 7).map(x => [{ text: x.prioridade || "P1", color: x.prioridade === "P0" ? C.red : C.amber, bold: true }, x.area || "", x.acao || "", x.resp || "DX", x.quando || ""]);
    table(s, ["", "Área", "Ação", "Resp.", "Quando"], rows.length ? rows : [["", "", "—", "", ""]], M, 1.7, W - 2 * M, [0.5, 1.4, 7.63, 1.3, 1.3], 10.5, 0.58, [2]);
    footer(s); }

  // 12 Klaviyo — porquê
  { const s = pres.addSlide(); n++; title(s, "Klaviyo — Marketing Automation", "Porquê agora e o que muda para a Copopalhinhas");
    s.addText(`O que os dados deste ${NOMEM} dizem`, { x: M, y: 1.7, w: 6, h: 0.4, fontFace: FH, fontSize: 16, bold: true, color: C.ink, margin: 0 });
    const NDIAS = MENSAL ? Math.round((new Date(P.cur_to) - new Date(P.cur_from)) / 864e5) + 1 : 7;
    const atcDia = site.add_to_carts.cur / NDIAS, compDia = site.ecommerce_purchases.cur / NDIAS;
    const email = (d.canais || []).find(c => c.name === "Email") || { sessions: { cur: 0 } };
    stat(s, M, 2.2, 2.9, 1.35, "~" + num(atcDia), "add_to_cart / dia", site.add_to_carts.cur ? `${num(site.add_to_carts.cur)} no ${NOMEM}` : "evento ainda não mede", site.add_to_carts.cur ? C.grey : C.red, 24);
    stat(s, M + 3.05, 2.2, 2.9, 1.35, "~" + num(compDia), "compras / dia", atcDia > compDia ? `≈ ${dec((1 - compDia / atcDia) * 100, 0)}% dos carrinhos não fecham` : "sem baseline de carrinhos", C.amber, 24);
    stat(s, M, 3.7, 2.9, 1.35, num(email.sessions.cur), `sessões de Email no ${NOMEM}`, email.sessions.cur ? "canal residual" : "canal inexistente hoje", C.red, 24);
    stat(s, M + 3.05, 3.7, 2.9, 1.35, eur(site.aov.cur), "ticket médio", "valor por carrinho recuperado", C.grey, 24);
    const rec = atcDia > compDia ? (atcDia - compDia) * 30 * site.aov.cur / 4.3 : 0;
    s.addText(rec ? `Estimativa conservadora: recuperar 8–12% dos carrinhos abandonados a ${eur(site.aov.cur)} de ticket médio representa ${eurK(rec * 0.08 * 4.3)}–${eurK(rec * 0.12 * 4.3)} / mês de receita incremental.` : "Quando o add_to_cart estiver a medir de forma fiável, esta estimativa é calculada automaticamente a partir dos carrinhos e do ticket médio.", { x: M, y: 5.3, w: 6.0, h: 1.4, fontFace: FB, fontSize: 12, color: C.ink, italic: true, margin: 0, valign: "top" });
    box(s, 7.1, 1.7, 5.63, 5.1, C.tint); s.addText("Porquê Klaviyo", { x: 7.35, y: 1.9, w: 5.2, h: 0.4, fontFace: FH, fontSize: 16, bold: true, color: C.ink, margin: 0 });
    bullets(s, S.klaviyo_porque, 7.35, 2.4, 5.15, 4.3, 11.5);
    footer(s); }

  // 13 Klaviyo — carrinho abandonado
  { const s = pres.addSlide(); n++; title(s, "Klaviyo — Fluxo de carrinho abandonado", "Gatilho: evento Started Checkout / Added to Cart sem Placed Order");
    S.carrinho.forEach((st, i) => { const x = M + i * 2.45, y = 2.0, w = 2.3, h = 3.6; const edge = i === 0 || i === 4;
      box(s, x, y, w, h, edge ? C.light : C.tint); circleNum(s, x + 0.2, y + 0.2, i + 1, 0.42);
      s.addText(st.when, { x: x + 0.75, y: y + 0.22, w: w - 0.9, h: 0.4, fontFace: FB, fontSize: 12, bold: true, color: C.orange, margin: 0, valign: "middle" });
      s.addText(st.t, { x: x + 0.2, y: y + 0.75, w: w - 0.4, h: 0.55, fontFace: FH, fontSize: 14, bold: true, color: C.ink, margin: 0, valign: "top" });
      s.addText(st.d, { x: x + 0.2, y: y + 1.35, w: w - 0.4, h: h - 1.5, fontFace: FB, fontSize: 10.5, color: C.ink, margin: 0, valign: "top" });
      if (i < 4) s.addShape(pres.ShapeType.rightArrow, { x: x + w + 0.02, y: y + h / 2 - 0.12, w: 0.12, h: 0.24, fill: { color: C.orange }, line: { color: C.orange } }); });
    s.addText("KPIs a acompanhar", { x: M, y: 5.85, w: 4, h: 0.35, fontFace: FH, fontSize: 14, bold: true, color: C.ink, margin: 0 });
    s.addText("Taxa de recuperação (meta 8–12%) · Receita atribuída ao fluxo · Taxa de abertura / clique por email · Tempo até compra · Uso do incentivo (deve ficar < 30% das recuperações)", { x: M, y: 6.2, w: W - 2 * M, h: 0.6, fontFace: FB, fontSize: 11.5, color: C.ink, margin: 0 });
    footer(s); }

  // 14 Klaviyo — jornada
  { const s = pres.addSlide(); n++; title(s, "Klaviyo — Jornada do cliente", "Fluxos automáticos por fase do ciclo de vida · B2C e B2B/eventos");
    S.jornada.forEach((st, i) => { const x = M + (i % 3) * 4.08, y = 1.7 + Math.floor(i / 3) * 2.55, w = 3.9, h = 2.4;
      box(s, x, y, w, h); circleNum(s, x + 0.2, y + 0.2, i + 1, 0.4);
      s.addText(st.h.toUpperCase(), { x: x + 0.72, y: y + 0.18, w: w - 0.9, h: 0.22, fontFace: FB, fontSize: 9.5, bold: true, color: C.orange, charSpacing: 2, margin: 0 });
      s.addText(st.f, { x: x + 0.72, y: y + 0.4, w: w - 0.9, h: 0.32, fontFace: FH, fontSize: 14, bold: true, color: C.ink, margin: 0 });
      s.addText(st.d, { x: x + 0.2, y: y + 0.85, w: w - 0.4, h: 1.15, fontFace: FB, fontSize: 10.5, color: C.ink, margin: 0, valign: "top" });
      s.addText("KPI: " + st.kpi, { x: x + 0.2, y: y + h - 0.4, w: w - 0.4, h: 0.3, fontFace: FB, fontSize: 10, italic: true, color: C.grey, margin: 0 }); });
    footer(s); }

  // 15 Klaviyo — implementação
  { const s = pres.addSlide(); n++; title(s, "Klaviyo — Plano de implementação", "6 semanas · pré-requisito: tracking de carrinho e checkout fiável (ações P0)");
    table(s, ["Sem.", "Fase", "O que fazemos", "Entregável"], S.implementacao, M, 1.7, W - 2 * M, [0.6, 1.9, 7.13, 2.5], 10.5, 0.55, [2]);
    tintNote(s, 6.0, 0.8, [{ text: "Dependências: ", options: { bold: true } }, { text: "(1) begin_checkout e purchase corrigidos no site; (2) decisão sobre o incentivo (portes grátis vs %) pela Copopalhinhas; (3) textos e imagens de marca aprovados pelo Filipe. " }, { text: "Custo: ", options: { bold: true } }, { text: "plano Klaviyo escala com o n.º de perfis ativos — estimar após importação da base." }], 11);
    footer(s); }

  // 16 Decisões
  { const s = pres.addSlide(); n++; s.background = { color: C.ink };
    s.addShape(pres.ShapeType.ellipse, { x: -2.5, y: 4.2, w: 6, h: 6, fill: { color: C.orange }, line: { color: C.orange } });
    s.addText("Decisões pedidas à Copopalhinhas", { x: M, y: 0.6, w: 11, h: 0.8, fontFace: FH, fontSize: 32, bold: true, color: C.white, margin: 0 });
    const dec_ = list(a.decisoes);
    s.addText(dec_.map((t, i) => ({ text: t, options: { bullet: { type: "number" }, breakLine: i < dec_.length - 1, paraSpaceAfter: 12 } })), { x: 4.2, y: 1.8, w: 8.5, h: 3.6, fontFace: FB, fontSize: 16, color: "F0F0F0", valign: "top", margin: 0 });
    s.addText(`Próximo report: ${proxima.toLocaleDateString("pt-PT", { day: "numeric", month: "long" })}, com ${MENSAL ? 'o mês' : 'a semana'} seguinte fechad${MENSAL ? 'o' : 'a'}.`, { x: 4.2, y: 5.6, w: 8.5, h: 0.5, fontFace: FB, fontSize: 14, color: C.orange, bold: true, margin: 0 });
    s.addText(`Digital Xperience · Fontes: Windsor.ai (GA4, Google Ads, Search Console, Meta Ads) · Dados extraídos a ${hoje.toLocaleDateString("pt-PT")} · análise gerada por Claude`, { x: 4.2, y: 6.3, w: 8.5, h: 0.6, fontFace: FB, fontSize: 10, color: "9A9A9A", margin: 0 });
    footer(s, true); }

  return pres.write({ outputType: "nodebuffer" });
}
module.exports = { buildDeck };
