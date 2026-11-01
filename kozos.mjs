// Közös segédfüggvények — a böngésző (csapat-app, játékmesteri konzol) és a build script (Node) is ezt használja.
// Semmi DOM-függés nincs benne, így Node 18+ alatt is fut.

const subtle = globalThis.crypto.subtle;
const enc = new TextEncoder();
const dec = new TextDecoder();

export const ITER_KARTYA = 60000;   // egy fejtörő-kártya válaszának ellenőrzése
export const ITER_TITOK = 120000;   // jutalom / ládatartalom titkosítása a megfejtéssel
export const ITER_JM = 200000;      // játékmesteri rész titkosítása jelszóval

/** Válasz egységesítése: ékezet, szóköz, írásjel nélkül, nagybetűvel. "22:05" → "2205", "Rózsakert" → "ROZSAKERT". */
export function norm(x) {
  return String(x ?? "")
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export const b64 = {
  to(buf) {
    const bytes = new Uint8Array(buf); let s = "";
    for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
    return btoa(s);
  },
  from(str) {
    const s = atob(str); const out = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
    return out;
  }
};

export function veletlenSo(n = 16) {
  const a = new Uint8Array(n); globalThis.crypto.getRandomValues(a); return b64.to(a);
}

async function pbkdf2Bits(jelszo, so, iter) {
  const kulcs = await subtle.importKey("raw", enc.encode(jelszo), "PBKDF2", false, ["deriveBits"]);
  return subtle.deriveBits({ name: "PBKDF2", salt: enc.encode(so), iterations: iter, hash: "SHA-256" }, kulcs, 256);
}
async function aesKulcs(jelszo, so, iter) {
  const bits = await pbkdf2Bits(jelszo, so, iter);
  return subtle.importKey("raw", bits, "AES-GCM", false, ["encrypt", "decrypt"]);
}

/** Kártyaválasz lenyomata. */
export async function lenyomat(valasz, so) {
  return b64.to(await pbkdf2Bits(norm(valasz), so, ITER_KARTYA));
}
export async function egyezik(valasz, so, hash) {
  if (!norm(valasz)) return false;
  return (await lenyomat(valasz, so)) === hash;
}

/** Tetszőleges JSON titkosítása jelszóval (AES-GCM). */
export async function titkosit(adat, jelszo, so, iter) {
  const iv = new Uint8Array(12); globalThis.crypto.getRandomValues(iv);
  const k = await aesKulcs(jelszo, so, iter);
  const ct = await subtle.encrypt({ name: "AES-GCM", iv }, k, enc.encode(JSON.stringify(adat)));
  return { iv: b64.to(iv), ct: b64.to(ct) };
}
/** Visszafejtés. Rossz jelszónál null-t ad (nem dob). */
export async function visszafejt(csomag, jelszo, so, iter) {
  try {
    const k = await aesKulcs(jelszo, so, iter);
    const pt = await subtle.decrypt({ name: "AES-GCM", iv: b64.from(csomag.iv) }, k, b64.from(csomag.ct));
    return JSON.parse(dec.decode(pt));
  } catch (e) { return null; }
}

/** A fejtörő teljes kulcsa: a kártyák válaszai sorrendben. */
export const fejtoroKulcs = valaszok => valaszok.map(norm).join("|");

/* ---------- Eredménykód: a csapat telefonja ezt mutatja a végén, a játékmester beírja ---------- */
const ABC = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // 32 jel, könnyen olvasható (nincs 0/O, 1/I)
function ellenorzo(n, sz) { let h = 7; for (const c of String(n) + sz) h = (h * 31 + c.charCodeAt(0)) % 1024; return h; }
/** pont: 0–1023, valasztasok: 4 db 0–7 közötti index (tettes, indíték, fegyver, időpont), sorszam: a csapat 1–31 */
export function eredmenyKod(pont, valasztasok, so = "") {
  const p = Math.max(0, Math.min(1023, Math.round(pont)));
  const v = valasztasok.map(x => Math.max(0, Math.min(7, x | 0)));
  let n = p; for (const x of v) n = n * 8 + x;            // 10 + 12 bit
  const c = ellenorzo(n, so);                               // 10 bit
  let big = n * 1024 + c, s = "";
  for (let i = 0; i < 7; i++) { s = ABC[big % 32] + s; big = Math.floor(big / 32); }
  return s.slice(0, 3) + "-" + s.slice(3);
}
export function eredmenyKodOlvas(kod, so = "") {
  const s = String(kod || "").toUpperCase().replace(/[^0-9A-Z]/g, "");
  if (s.length !== 7) return null;
  let big = 0;
  for (const ch of s) { const i = ABC.indexOf(ch); if (i < 0) return null; big = big * 32 + i; }
  const c = big % 1024, n = Math.floor(big / 1024);
  if (ellenorzo(n, so) !== c) return null;
  let m = n; const v = [];
  for (let i = 0; i < 4; i++) { v.unshift(m % 8); m = Math.floor(m / 8); }
  return { pont: m, valasztasok: v };
}

/* ---------- Idő ---------- */
export const ido = m => { m = Math.max(0, Math.floor(m)); return Math.floor(m / 60) + ":" + String(m % 60).padStart(2, "0"); };
/** "1905" vagy "19:05" → a mai (vagy tegnapi, ha éjfél utáni) 19:05 időbélyege */
export function inditokodbol(kod, most = Date.now()) {
  const d = String(kod || "").replace(/\D/g, "");
  if (d.length !== 4) return null;
  const h = +d.slice(0, 2), mi = +d.slice(2);
  if (h > 23 || mi > 59) return null;
  const t = new Date(most); t.setHours(h, mi, 0, 0);
  let ts = t.getTime();
  if (ts - most > 60 * 60000) ts -= 24 * 3600000;   // éjfél után indított játék
  return ts;
}
export function inditokod(ts) { const d = new Date(ts); return String(d.getHours()).padStart(2, "0") + String(d.getMinutes()).padStart(2, "0"); }

/* ---------- Pontozás (a csapat telefonja számolja a fejtörő- és ládapontokat) ---------- */
export function fejtoroPont(pontozas, nehezseg, sugoSzam) {
  const alap = (pontozas.fejtoro || {})[nehezseg] ?? 8;
  return Math.max(Math.ceil(alap / 2), alap - sugoSzam * (pontozas.sugo ?? 2));
}
export function ladaPont(pontozas, percAKapuUtan, sugoSzam = 0) {
  const sav = pontozas.lada || [10, 8, 6, 4];      // 0–10 perc, 10–20, 20–30, utána
  const i = Math.min(sav.length - 1, Math.floor(Math.max(0, percAKapuUtan) / 10));
  return Math.max(2, sav[i] - sugoSzam * (pontozas.sugo ?? 2));
}
