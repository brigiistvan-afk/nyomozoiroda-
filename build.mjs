#!/usr/bin/env node
// Build: a weboldal összeállítása a dist/ mappába. A GitHub Actions minden feltöltés után lefuttatja.
//
//  ugyek/*.json   — kész, titkosított (csomagolt) ügyfájlok. Ezeket a Csomagoló oldal vagy a generátor készíti.
//                   Változtatás nélkül kerülnek a weboldalra. Nyilvános repóba is feltölthetők.
//  forras/*.json  — olvasható (titkosítatlan) ügyfájlok. CSAK PRIVÁT repóban használd!
//                   Ezeket a build titkosítja a JATEKMESTER_JELSZO titokkal (GitHub: Settings → Secrets → Actions).
//
// A build elkészíti az ügylistát (dist/ugyek/lista.json), így minden feltöltött ügy automatikusan megjelenik.
//
// Használat:  node eszkozok/build.mjs               (build)
//             node eszkozok/build.mjs --ellenoriz   (csak ellenőrzés)

import { readFile, writeFile, readdir, mkdir, cp, rm } from "node:fs/promises";
import { webcrypto } from "node:crypto";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

if (!globalThis.crypto) globalThis.crypto = webcrypto;
const { ellenoriz, csomagol, csomagolt, listaSor } = await import("../web/motor/csomag.mjs");

const GYOKER = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CSAK_ELLENORZES = process.argv.includes("--ellenoriz");
const JELSZO = process.env.JATEKMESTER_JELSZO || "";
const jsonok = async dir => existsSync(dir) ? (await readdir(dir)).filter(f => f.endsWith(".json") && f !== "lista.json").sort() : [];

let hibaDb = 0;
const kesz = new Map();   // id → csomagolt ügy

// 1. Kész, csomagolt ügyek
for (const f of await jsonok(path.join(GYOKER, "ugyek"))) {
  let u;
  try { u = JSON.parse(await readFile(path.join(GYOKER, "ugyek", f), "utf8")); }
  catch (e) { console.error(`✗ ugyek/${f}: hibás JSON — ${e.message}`); hibaDb++; continue; }
  if (!csomagolt(u)) { console.error(`✗ ugyek/${f}: ez nem csomagolt ügyfájl. Csomagold be a Csomagoló oldalon (csomagolo.html), vagy tedd a forras/ mappába (csak privát repóban!).`); hibaDb++; continue; }
  if (kesz.has(u.id)) { console.error(`✗ ugyek/${f}: már van ügy ezzel az azonosítóval: ${u.id}`); hibaDb++; continue; }
  console.log(`✓ ugyek/${f}: ${u.cim} — ${u.fejtorok.length} fejtörő, ${u.ladak.length} láda (csomagolt)`);
  kesz.set(u.id, u);
}

// 2. Olvasható forrásfájlok (privát repóhoz)
for (const f of await jsonok(path.join(GYOKER, "forras"))) {
  let u;
  try { u = JSON.parse(await readFile(path.join(GYOKER, "forras", f), "utf8")); }
  catch (e) { console.error(`✗ forras/${f}: hibás JSON — ${e.message}`); hibaDb++; continue; }
  const { hibak, figy } = ellenoriz(u, "forras/" + f);
  figy.forEach(m => console.warn(`  ! forras/${f}: ${m}`));
  if (hibak.length) { hibak.forEach(m => console.error(`  ✗ forras/${f}: ${m}`)); hibaDb += hibak.length; continue; }
  if (kesz.has(u.id)) { console.error(`✗ forras/${f}: már van ügy ezzel az azonosítóval: ${u.id}`); hibaDb++; continue; }
  if (CSAK_ELLENORZES) { console.log(`✓ forras/${f}: ${u.cim} — rendben`); continue; }
  if (!JELSZO) { console.error(`✗ forras/${f}: olvasható ügyfájlhoz kell a JATEKMESTER_JELSZO titok. (Nyilvános repóban inkább a Csomagolóval készíts titkosított fájlt az ugyek/ mappába.)`); hibaDb++; continue; }
  kesz.set(u.id, await csomagol(u, JELSZO));
  console.log(`✓ forras/${f}: ${u.cim} — becsomagolva`);
}

if (hibaDb) { console.error(`\n${hibaDb} hiba miatt a build leállt. A weboldalon a korábbi, működő változat marad.`); process.exit(1); }
if (CSAK_ELLENORZES) { console.log("\nAz ellenőrzés rendben."); process.exit(0); }

const DIST = path.join(GYOKER, "dist");
await rm(DIST, { recursive: true, force: true });
await cp(path.join(GYOKER, "web"), DIST, { recursive: true });
await mkdir(path.join(DIST, "ugyek"), { recursive: true });
const lista = [];
for (const u of kesz.values()) {
  await writeFile(path.join(DIST, "ugyek", u.id + ".json"), JSON.stringify(u));
  lista.push(listaSor(u));
}
lista.sort((a, b) => (b.sorrend - a.sorrend) || a.cim.localeCompare(b.cim, "hu"));
await writeFile(path.join(DIST, "ugyek", "lista.json"), JSON.stringify({ frissitve: new Date().toISOString(), ugyek: lista }, null, 1));
await writeFile(path.join(DIST, ".nojekyll"), "");
console.log(`\nKész: dist/ — ${lista.length} ügy.`);
