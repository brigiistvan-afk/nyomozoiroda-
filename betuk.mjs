// Betűk és téma.
// A felület a telefon saját rendszerbetűjét használja (iPhone: San Francisco, Android: Roboto) — ez a legolvashatóbb,
// és nem kell letölteni. Letöltött díszbetű csak a nagy címekhez, az iratokhoz és a kézíráshoz kell.
const ALAP = "family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400&family=Courier+Prime:wght@400;700&family=Caveat:wght@500;700";
const DISZ = {
  noir1920: "family=DM+Serif+Display:ital@0;1",
  vadasz: "family=Cormorant+Garamond:wght@600;700",
  modern: "family=Archivo:wght@700;800",
  borzongos: "family=IM+Fell+English:ital@0;1"
};
export function temaBeallit(tema) {
  const t = DISZ[tema] ? tema : "noir1920";
  document.documentElement.dataset.skin = t;
  let l = document.getElementById("betuk");
  if (!l) { l = document.createElement("link"); l.id = "betuk"; l.rel = "stylesheet"; document.head.appendChild(l); }
  l.href = `https://fonts.googleapis.com/css2?${ALAP}&${DISZ[t]}&display=swap`;
}
