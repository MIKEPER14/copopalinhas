// Períodos fechados em Europe/Lisbon.
// semanal: última semana seg–dom vs a anterior · mensal: último mês fechado vs o anterior
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
function periodos(ref = new Date(), modo = process.env.PERIODO || 'semanal') {
  const now = new Date(ref.toLocaleString('en-US', { timeZone: 'Europe/Lisbon' }));
  const f = d => d.toISOString().slice(0, 10);
  const add = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  if (modo === 'mensal') {
    const curFrom = new Date(now.getFullYear(), now.getMonth() - 1, 1), curTo = new Date(now.getFullYear(), now.getMonth(), 0);
    const prevFrom = new Date(now.getFullYear(), now.getMonth() - 2, 1), prevTo = new Date(now.getFullYear(), now.getMonth() - 1, 0);
    const lab = d => `${MESES[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`;
    return { modo, cur_from: f(curFrom), cur_to: f(curTo), prev_from: f(prevFrom), prev_to: f(prevTo), label_cur: lab(curFrom), label_prev: lab(prevFrom), nome: 'Mês', nome_min: 'mês' };
  }
  const dow = (now.getDay() + 6) % 7;
  const monday = new Date(now); monday.setDate(now.getDate() - dow); monday.setHours(0, 0, 0, 0);
  const lab = (a, b) => `${a.getDate()}/${a.getMonth() + 1}–${b.getDate()}/${b.getMonth() + 1}`;
  const curFrom = add(monday, -7), curTo = add(monday, -1), prevFrom = add(monday, -14), prevTo = add(monday, -8);
  return { modo, cur_from: f(curFrom), cur_to: f(curTo), prev_from: f(prevFrom), prev_to: f(prevTo), label_cur: lab(curFrom, curTo), label_prev: lab(prevFrom, prevTo), nome: 'Semana', nome_min: 'semana' };
}
module.exports = { periodos };
