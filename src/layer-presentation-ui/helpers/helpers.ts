
// ---------- Mock data ----------
const now = new Date();
export const daysAgo = (n: number) => {
  const d = new Date(now);
  d.setDate(d.getDate() - n);
  return d;
};