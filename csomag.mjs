// Ügyfájl ellenőrzése és csomagolása (titkosítása) — a böngészőben (Csomagoló) és a buildben (Node) is ezt használjuk.
import * as K from "./kozos.mjs";
import { ABRA_NEVEK } from "./iratok.mjs";

const TEMAK = ["noir1920", "vadasz", "modern", "borzongos"];
const IRATTIPUSOK = ["jegyzokonyv", "vallomas", "level", "tavirat", "naplo", "feljegyzes", "nyugta", "dokumentum", "ujsag", "fenykep", "helyszinrajz"];
const NEHEZSEGEK = ["konnyu", "kozepes", "nehez"];

/* ---------------- Ellenőrzés ---------------- */
export function ellenoriz(u, fajl = "ügyfájl") {
  const hibak = [], figy = [];
  const h = m => hibak.push(m), f = m => figy.push(m);
  const kell = (obj, mezok, hol) => mezok.forEach(m => { if (obj?.[m] === undefined || obj?.[m] === "" || obj?.[m] === null) h(`${hol}: hiányzik a „${m}” mező`); });

  kell(u, ["id", "cim", "alcim", "tema", "idotartam", "bevezeto", "megbizas", "aldozat", "gyanusitottak", "dosszie", "fejtorok", "ladak", "vadirat", "megoldas", "pontozas"], fajl);
  if (u.id && !/^[a-z0-9-]+$/.test(u.id)) h(`az „id” csak kisbetű, szám és kötőjel lehet (most: ${u.id})`);
  if (u.tema && !TEMAK.includes(u.tema)) h(`ismeretlen téma: ${u.tema} (lehet: ${TEMAK.join(", ")})`);

  const azonok = new Set();
  const egyedi = (id, hol) => { if (!id) return h(`${hol}: hiányzik az „id”`); if (azonok.has(id)) h(`ismétlődő azonosító: ${id}`); azonok.add(id); };
  const iratEll = (d, hol) => {
    egyedi(d.id, hol);
    if (!IRATTIPUSOK.includes(d.tipus)) h(`${hol} (${d.id}): ismeretlen irattípus „${d.tipus}”`);
    if (d.tipus === "fenykep" && !d.kep && !d.abra) f(`${d.id}: a fényképnek nincs „abra” vagy „kep” mezője — egy üres keret jelenik meg`);
    if (d.abra && !ABRA_NEVEK.includes(d.abra)) f(`${d.id}: ismeretlen ábra „${d.abra}” (lehet: ${ABRA_NEVEK.join(", ")})`);
    if (d.tipus !== "fenykep" && d.tipus !== "helyszinrajz" && !d.szoveg) h(`${d.id}: üres irat (nincs „szoveg”)`);
  };

  (u.gyanusitottak || []).forEach((g, i) => { kell(g, ["id", "nev", "kapcsolat", "leiras"], `gyanúsított #${i + 1}`); egyedi(g.id, "gyanúsított"); });
  (u.dosszie || []).forEach(d => iratEll(d, "dosszié"));
  if (!(u.fejtorok || []).length) h("nincs egyetlen fejtörő sem");
  (u.fejtorok || []).forEach(p => {
    kell(p, ["id", "cim", "nehezseg", "kartyak", "magyarazat", "jutalom"], `fejtörő ${p.id || "?"}`);
    egyedi(p.id, "fejtörő");
    if (p.nehezseg && !NEHEZSEGEK.includes(p.nehezseg)) h(`${p.id}: a nehézség lehet ${NEHEZSEGEK.join(" / ")}`);
    (p.kartyak || []).forEach((c, i) => { if (!c.szoveg) h(`${p.id}: a ${i + 1}. kártyának nincs szövege`); if (!K.norm(c.valasz)) h(`${p.id}: a ${i + 1}. kártyának nincs (vagy csak írásjelből álló) válasza`); });
    if (!(p.sugok || []).length) f(`${p.id}: nincs súgó`);
    (p.jutalom || []).forEach(d => iratEll(d, `${p.id} jutalma`));
  });
  if (!(u.ladak || []).length) f("nincs láda — a játék ládák nélkül is működik");
  let elozo = -1;
  (u.ladak || []).forEach(l => {
    kell(l, ["id", "nev", "nyilik", "szamjegy", "kod", "rejtveny", "iratok"], `láda ${l.id || "?"}`);
    egyedi(l.id, "láda");
    const kod = String(l.kod ?? "");
    if (!/^\d+$/.test(kod)) h(`${l.id}: a kód csak számjegy lehet (most: ${kod})`);
    else if (kod.length !== +l.szamjegy) h(`${l.id}: a kód ${kod.length} jegyű, de a lakat ${l.szamjegy} jegyű`);
    if (+l.nyilik < elozo) f(`${l.id}: korábban nyílik, mint az előző láda`);
    if (+l.nyilik >= +u.idotartam) h(`${l.id}: a játék vége után nyílna`);
    elozo = +l.nyilik;
    kell(l.rejtveny, ["cim", "szoveg", "magyarazat"], `${l.id} rejtvénye`);
    (l.iratok || []).forEach(d => iratEll(d, `${l.id} iratai`));
  });
  (u.vadirat?.kerdesek || []).forEach(q => {
    if (!["tettes", "inditek", "fegyver", "ido"].includes(q.id)) h(`vádirat: ismeretlen kérdés „${q.id}” (tettes / inditek / fegyver / ido)`);
    if (!Array.isArray(q.opciok) || q.opciok.length < 2 || q.opciok.length > 8) h(`vádirat „${q.id}”: 2–8 válaszlehetőség kell`);
    if (!(q.helyes >= 0 && q.helyes < (q.opciok || []).length)) h(`vádirat „${q.id}”: a „helyes” index nem jó`);
  });
  if ((u.vadirat?.kerdesek || []).length !== 4) h("a vádiratban pontosan 4 kérdés kell: tettes, inditek, fegyver, ido");
  return { hibak, figy };
}

/* ---------------- Átalakítás publikus (titkosított) formára ---------------- */
export async function csomagol(u, JELSZO) {
  if (!JELSZO) throw new Error("Nincs játékmesteri jelszó.");
  const fejtorok = [];
  for (const p of u.fejtorok) {
    const so = K.veletlenSo();
    const kartyak = [];
    for (const [i, c] of p.kartyak.entries()) kartyak.push({ cim: c.cim || "", szoveg: c.szoveg, hash: await K.lenyomat(c.valasz, so + ":" + i) });
    const titok = await K.titkosit({ jutalom: p.jutalom, magyarazat: p.magyarazat }, K.fejtoroKulcs(p.kartyak.map(c => c.valasz)), so, K.ITER_TITOK);
    fejtorok.push({ id: p.id, cim: p.cim, felvonas: p.felvonas || 1, nyilik: +p.nyilik || 0, nehezseg: p.nehezseg, mechanika: p.mechanika || "", kartyak, sugok: p.sugok || [], so, titok });
  }
  const ladak = [];
  for (const l of u.ladak || []) {
    const so = K.veletlenSo();
    const titok = await K.titkosit({ iratok: l.iratok, magyarazat: l.rejtveny.magyarazat }, K.norm(l.kod), so, K.ITER_TITOK);
    ladak.push({ id: l.id, nev: l.nev, hely: l.hely || "", nyilik: +l.nyilik, szamjegy: +l.szamjegy,
      rejtveny: { cim: l.rejtveny.cim, szoveg: l.rejtveny.szoveg, sugok: l.rejtveny.sugok || [] },
      iratDb: (l.iratok || []).length, so, hash: await K.lenyomat(l.kod, so + ":lada"), titok });
  }
  const jmSo = K.veletlenSo();
  const jm = await K.titkosit(u, JELSZO, jmSo, K.ITER_JM);
  return {
    formatum: 1, id: u.id, cim: u.cim, alcim: u.alcim, tema: u.tema, jatekosok: u.jatekosok || "", idotartam: +u.idotartam, sorrend: u.sorrend ?? 0,
    korszak: u.korszak || "", helyszin: u.helyszin || "", bevezeto: u.bevezeto, megbizas: u.megbizas,
    aldozat: u.aldozat,
    gyanusitottak: u.gyanusitottak.map(g => ({ id: g.id, nev: g.nev, kor: g.kor, kapcsolat: g.kapcsolat, leiras: g.leiras })),
    dosszie: u.dosszie, fejtorok, ladak,
    vadirat: { nyilik: +(u.vadirat.nyilik ?? 0), kerdesek: u.vadirat.kerdesek.map(q => ({ id: q.id, kerdes: q.kerdes, opciok: q.opciok })) },
    pontozas: u.pontozas,
    jm: { so: jmSo, ...jm }
  };
}


/** Kész (csomagolt) ügyfájl-e? */
export const csomagolt = u => u && u.formatum === 1 && u.jm && u.jm.ct && Array.isArray(u.fejtorok);
/** Az ügylista egy sora */
export const listaSor = u => ({ id: u.id, cim: u.cim, alcim: u.alcim, tema: u.tema, jatekosok: u.jatekosok || "", idotartam: +u.idotartam, sorrend: u.sorrend ?? 0,
  fejtorok: (u.fejtorok || []).length, ladak: (u.ladak || []).length, sorrend: u.sorrend ?? 0 });
