// Vai buscar 14 dias às 5 fontes do Windsor.ai e agrega semana vs semana
const ACC = {
  googleanalytics4: process.env.GA4_ID || '350983670',
  google_ads: process.env.ADS_ID || '7967641077',
  searchconsole: process.env.GSC_ID || 'sc-domain:copopalhinhas.pt',
  facebook: process.env.META_ID || '552810534884594',
};
const BRAND = ['copopalhinhas', 'copos e palhinhas', 'copo palhinhas', 'copos palhinhas', 'copopalhinha'];

async function get(conn, fields, d) {
  const url = `https://connectors.windsor.ai/${conn}?api_key=${process.env.WINDSOR_API_KEY}&date_from=${d.prev_from}&date_to=${d.cur_to}&fields=${fields}&select_accounts=${encodeURIComponent(ACC[conn])}`;
  const r = await fetch(url); if (!r.ok) throw new Error(`Windsor ${conn}: HTTP ${r.status}`);
  const j = await r.json(); return Array.isArray(j) ? j : (j.data || []);
}

async function recolher(d) {
  const [ga, gaCh, gaDev, ads, gsc, meta] = await Promise.all([
    get('googleanalytics4', 'date,sessions,active_users,add_to_carts,checkouts,ecommerce_purchases,purchase_revenue', d),
    get('googleanalytics4', 'date,session_default_channel_group,sessions,ecommerce_purchases,purchase_revenue', d),
    get('googleanalytics4', 'date,devicecategory,sessions,ecommerce_purchases,purchase_revenue', d),
    get('google_ads', 'date,campaign,impressions,clicks,spend,conversions,conversion_value', d),
    get('searchconsole', 'date,query,clicks,impressions', d),
    get('facebook', 'date,campaign,impressions,reach,link_clicks,spend,actions_purchase', d),
  ]);
  const inCur = r => r.date >= d.cur_from && r.date <= d.cur_to;
  const inPrev = r => r.date >= d.prev_from && r.date <= d.prev_to;
  const sum = (arr, k) => arr.reduce((a, r) => a + (Number(r[k]) || 0), 0);
  const pct = (c, p) => p ? +((c / p - 1) * 100).toFixed(1) : null;
  const kpi = (arr, keys) => { const c = arr.filter(inCur), p = arr.filter(inPrev), o = {};
    keys.forEach(k => o[k] = { cur: +sum(c, k).toFixed(2), prev: +sum(p, k).toFixed(2), pct: pct(sum(c, k), sum(p, k)) }); return o; };
  const ratio = (a, b, m = 1) => ({ cur: b.cur ? +(a.cur / b.cur * m).toFixed(2) : 0, prev: b.prev ? +(a.prev / b.prev * m).toFixed(2) : 0 });
  const byDim = (arr, dim, keys) => { const m = {};
    arr.forEach(r => { const g = r[dim] || '(n/a)'; m[g] = m[g] || { cur: {}, prev: {} };
      const b = inCur(r) ? 'cur' : inPrev(r) ? 'prev' : null; if (!b) return;
      keys.forEach(k => m[g][b][k] = (m[g][b][k] || 0) + (Number(r[k]) || 0)); });
    return Object.entries(m).map(([name, v]) => ({ name, ...Object.fromEntries(keys.map(k => [k, { cur: +(v.cur[k] || 0).toFixed(2), prev: +(v.prev[k] || 0).toFixed(2), pct: pct(v.cur[k] || 0, v.prev[k] || 0) }])) }))
      .sort((a, b) => b[keys[keys.length - 1]].cur - a[keys[keys.length - 1]].cur); };

  const site = kpi(ga, ['sessions', 'active_users', 'add_to_carts', 'checkouts', 'ecommerce_purchases', 'purchase_revenue']);
  site.conv_rate = ratio(site.ecommerce_purchases, site.sessions, 100);
  site.aov = ratio(site.purchase_revenue, site.ecommerce_purchases);
  const un = gaCh.filter(r => r.session_default_channel_group === 'Unassigned' && inCur(r));
  site.unassigned_share = site.ecommerce_purchases.cur ? +(sum(un, 'ecommerce_purchases') / site.ecommerce_purchases.cur * 100).toFixed(1) : 0;
  const adsT = kpi(ads, ['impressions', 'clicks', 'spend', 'conversions', 'conversion_value']);
  adsT.roas = ratio(adsT.conversion_value, adsT.spend); adsT.cpa = ratio(adsT.spend, adsT.conversions);
  const seo = kpi(gsc, ['clicks', 'impressions']); seo.ctr = ratio(seo.clicks, seo.impressions, 100);
  const brand = kpi(gsc.filter(r => BRAND.includes((r.query || '').toLowerCase())), ['clicks', 'impressions']); brand.ctr = ratio(brand.clicks, brand.impressions, 100);

  const dispositivos = byDim(gaDev, 'devicecategory', ['sessions', 'ecommerce_purchases', 'purchase_revenue']);
  const q = byDim(gsc, 'query', ['clicks', 'impressions']);
  const marca = q.filter(x => BRAND.includes(x.name.toLowerCase()));
  const genericas = q.filter(x => !BRAND.includes(x.name.toLowerCase()) && x.impressions.cur >= 300 && x.clicks.cur / Math.max(1, x.impressions.cur) < 0.005).slice(0, 6);
  const metaT = kpi(meta, ['impressions', 'reach', 'link_clicks', 'spend', 'actions_purchase']);
  return {
    periodo: { atual: d.label_cur, anterior: d.label_prev, cur_from: d.cur_from, cur_to: d.cur_to },
    site, canais: byDim(gaCh, 'session_default_channel_group', ['sessions', 'ecommerce_purchases', 'purchase_revenue']),
    google_ads: { total: adsT, campanhas: byDim(ads, 'campaign', ['clicks', 'spend', 'conversions', 'conversion_value']) },
    seo: { total: seo, marca: brand, consultas_marca: marca, consultas_genericas: genericas, top_impressoes: q.slice(0, 10) },
    meta_ads: metaT, dispositivos,
    diario: ga.filter(r => inCur(r) || inPrev(r)).sort((x, y) => x.date < y.date ? -1 : 1).map(r => ({ date: r.date, sessions: +r.sessions || 0, purchase_revenue: +r.purchase_revenue || 0, ecommerce_purchases: +r.ecommerce_purchases || 0 })),
  };
}
module.exports = { recolher };
