// Az elérhető ügyek listája.
// GitHub Pages-en közvetlenül a repó "ugyek" mappáját olvassa (GitHub API), így egy új fájl feltöltése után
// build nélkül megjelenik (a GitHub gyorsítótára miatt legfeljebb kb. 10 perc alatt).
// Máshol (helyi próba, bemutató) az ugyek/lista.json fájlt használja.
import { listaSor } from "./csomag.mjs";

export function githubRepo() {
  const h = location.hostname;
  if (!h.endsWith(".github.io")) return null;
  const owner = h.split(".")[0];
  const elso = location.pathname.split("/").filter(Boolean)[0];
  const repo = elso && !elso.includes(".") ? elso : owner + ".github.io";
  return { owner, repo };
}

const gyorstar = new Map();
/** Egy ügyfájl betöltése (a lista már betöltötte, ha lehet) */
export async function ugyFajl(sor) {
  const fajl = sor.fajl || sor.id + ".json";
  if (gyorstar.has(fajl)) return gyorstar.get(fajl);
  const r = await fetch("ugyek/" + encodeURIComponent(fajl), { cache: "no-cache" });
  if (!r.ok) throw new Error("HTTP " + r.status);
  const u = await r.json(); gyorstar.set(fajl, u); return u;
}

export async function ugyLista() {
  const gh = githubRepo();
  if (gh) {
    try {
      const r = await fetch(`https://api.github.com/repos/${gh.owner}/${gh.repo}/contents/ugyek`, { headers: { Accept: "application/vnd.github+json" } });
      if (r.ok) {
        const fajlok = (await r.json()).filter(f => f.type === "file" && f.name.endsWith(".json") && f.name !== "lista.json");
        const sorok = await Promise.all(fajlok.map(async f => {
          try { const u = await ugyFajl({ fajl: f.name }); return u.formatum === 1 && u.jm ? { ...listaSor(u), fajl: f.name } : null; }
          catch (e) { return null; }
        }));
        return sorok.filter(Boolean).sort((a, b) => (b.sorrend - a.sorrend) || a.cim.localeCompare(b.cim, "hu"));
      }
    } catch (e) { /* tovább a lista.json-ra */ }
  }
  try {
    const r = await fetch("ugyek/lista.json", { cache: "no-cache" });
    if (r.ok) return ((await r.json()).ugyek || []).map(x => ({ ...x, fajl: x.fajl || x.id + ".json" }));
  } catch (e) {}
  return [];
}
