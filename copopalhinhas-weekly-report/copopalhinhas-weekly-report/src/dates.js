// Última semana fechada (seg–dom) e a anterior, em Europe/Lisbon
function periodos(ref = new Date()) {
  const now = new Date(ref.toLocaleString('en-US', { timeZone: 'Europe/Lisbon' }));
  const dow = (now.getDay() + 6) % 7;
  const monday = new Date(now); monday.setDate(now.getDate() - dow); monday.setHours(0, 0, 0, 0);
  const add = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const f = d => d.toISOString().slice(0, 10);
  const lab = (a, b) => `${a.getDate()}/${a.getMonth() + 1}–${b.getDate()}/${b.getMonth() + 1}`;
  const curFrom = add(monday, -7), curTo = add(monday, -1), prevFrom = add(monday, -14), prevTo = add(monday, -8);
  return { cur_from: f(curFrom), cur_to: f(curTo), prev_from: f(prevFrom), prev_to: f(prevTo), label_cur: lab(curFrom, curTo), label_prev: lab(prevFrom, prevTo) };
}
module.exports = { periodos };
