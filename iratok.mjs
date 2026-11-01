// Iratok (bizonyítékok) megjelenítése HTML-ként — telefonon és nyomtatásban ugyanúgy.
// Irattípusok: jegyzokonyv, vallomas, level, tavirat, naplo, feljegyzes, nyugta, dokumentum, ujsag, fenykep, helyszinrajz
// Mezők: tipus, cim, datum, hely, szoveg, alairas, pecset, egett (true), abra (beépített rajz neve), kep (saját kép útvonala), felirat, rajz (helyszínrajz adatai)

export const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const INK = "#3b2a17";
const S = `fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"`;
const SF = `stroke="${INK}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"`;

/** Beépített rajzok a „fényképekhez”. Mindegyik 400×300-as vásznon. */
export const ABRAK = {
  zsebora: `<path ${S} d="M200 40 v-18 M188 22 h24"/><circle cx="200" cy="58" r="10" ${S}/>
    <circle cx="200" cy="160" r="92" ${S}/><circle cx="200" cy="160" r="80" fill="#f3e6c8" ${SF} stroke-width="2"/>
    ${Array.from({ length: 12 }, (_, i) => { const a = i * Math.PI / 6; return `<line x1="${200 + 68 * Math.sin(a)}" y1="${160 - 68 * Math.cos(a)}" x2="${200 + 76 * Math.sin(a)}" y2="${160 - 76 * Math.cos(a)}" stroke="${INK}" stroke-width="${i % 3 ? 2 : 4}"/>`; }).join("")}
    <line x1="200" y1="160" x2="${200 + 42 * Math.sin(-Math.PI / 6 * 1.75)}" y2="${160 - 42 * Math.cos(-Math.PI / 6 * 1.75)}" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
    <line x1="200" y1="160" x2="262" y2="160" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>
    <circle cx="200" cy="160" r="5" fill="${INK}"/>
    <path ${S} stroke-width="2" d="M292 120 q40 -30 70 10 q20 30 -10 60"/><path ${S} stroke-width="2" d="M300 135 q30 -20 50 8"/>`,
  setapalca: `<path ${S} stroke-width="9" d="M95 270 L300 70"/><path ${S} stroke-width="4" d="M95 270 L300 70" stroke="#f3e6c8"/>
    <ellipse cx="312" cy="58" rx="26" ry="20" transform="rotate(-45 312 58)" fill="#d8d1c0" ${SF}/>
    <path ${S} stroke-width="2" d="M298 52 q10 -8 22 0 M304 64 q10 -8 22 0"/><path ${S} d="M285 85 l18 -18"/>
    <circle cx="322" cy="44" r="3" fill="${INK}"/><circle cx="330" cy="58" r="2" fill="${INK}"/><path ${S} stroke-width="1.5" d="M335 40 q14 -6 24 4"/>`,
  zsebkendo: `<path ${S} d="M90 70 L310 60 L320 240 L100 250 Z"/><path ${S} stroke-width="1.5" stroke-dasharray="4 6" d="M105 82 L298 74 L306 226 L114 236 Z"/>
    <path fill="#7a2a1e" opacity=".75" d="M190 140 q30 -18 46 6 q14 26 -18 34 q-34 8 -38 -14 q-2 -16 10 -26z"/><circle cx="250" cy="175" r="6" fill="#7a2a1e" opacity=".6"/>
    <text x="270" y="225" font-family="Georgia,serif" font-style="italic" font-size="22" fill="${INK}">K. I.</text>`,
  lampas: `<path ${S} d="M60 250 h280"/><path ${S} d="M250 250 V90 M236 90 h28 M250 90 l40 -40"/><circle cx="292" cy="48" r="8" ${S}/>
    <g transform="rotate(-70 140 225)"><rect x="110" y="150" width="60" height="80" rx="6" ${S}/><path ${S} d="M110 150 l30 -26 l30 26 M140 124 v-14"/><path ${S} stroke-width="1.5" d="M120 165 h40 M120 215 h40"/></g>
    <path fill="${INK}" opacity=".15" d="M70 250 q60 -20 120 0z"/>`,
  sziluett: `<ellipse cx="200" cy="150" rx="120" ry="130" ${S}/><ellipse cx="200" cy="150" rx="108" ry="118" fill="#e9dcbc" ${SF} stroke-width="1.5"/>
    <path fill="#5a4630" d="M200 80 q-38 0 -40 44 q0 30 18 46 q-56 14 -68 70 q60 30 180 0 q-12 -56 -68 -70 q18 -16 18 -46 q-2 -44 -40 -44z"/>`,
  gyongysor: `${Array.from({ length: 23 }, (_, i) => { const a = Math.PI * (0.1 + 0.8 * i / 22); return `<circle cx="${200 - 150 * Math.cos(a)}" cy="${60 + 150 * Math.sin(a)}" r="10" fill="#f8f2e4" ${SF} stroke-width="2"/>`; }).join("")}
    ${Array.from({ length: 19 }, (_, i) => { const a = Math.PI * (0.15 + 0.7 * i / 18); return `<circle cx="${200 - 115 * Math.cos(a)}" cy="${60 + 115 * Math.sin(a)}" r="8" fill="#f8f2e4" ${SF} stroke-width="2"/>`; }).join("")}`,
  fokonyv: `<path ${S} d="M50 80 L200 95 L350 80 L350 240 L200 255 L50 240 Z M200 95 V255"/>
    ${Array.from({ length: 7 }, (_, i) => `<path ${S} stroke-width="1.2" d="M68 ${115 + i * 18} L185 ${125 + i * 18}"/>`).join("")}
    <path ${S} stroke-width="2.5" d="M215 120 l18 10 l-10 14 l20 8 l-8 16 l22 6 l-12 18 l20 10 l-14 16 l16 12 l-10 14"/>
    <text x="72" y="110" font-family="Courier New,monospace" font-size="13" fill="${INK}">A. S. ...... 200 P</text>`,
  kulcs: `<circle cx="120" cy="150" r="42" ${S}/><circle cx="120" cy="150" r="16" ${S}/><path ${S} d="M162 150 H330 M300 150 v26 M280 150 v18 M320 150 v20"/>`,
  boritek: `<rect x="70" y="80" width="260" height="160" ${S}/><path ${S} d="M70 80 L200 170 L330 80"/><circle cx="200" cy="170" r="16" fill="#7a2a1e" opacity=".8"/>
    <path ${S} stroke-width="1.5" d="M110 205 h90 M110 220 h60"/>`,
  uveg: `<path ${S} d="M180 50 h40 v40 q30 20 30 60 v100 q0 10 -10 10 h-80 q-10 0 -10 -10 v-100 q0 -40 30 -60 z"/><rect x="165" y="150" width="70" height="50" ${S} stroke-width="2"/>
    <path ${S} stroke-width="1.5" d="M175 168 h50 M175 182 h36"/>`,
  labnyom: `${[[90, 220, -20], [150, 170, -15], [210, 130, -18], [270, 85, -14]].map(([x, y, r], i) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(${i % 2 ? -1 : 1} 1)"><ellipse cx="0" cy="0" rx="14" ry="30" fill="${INK}" opacity=".55"/><ellipse cx="0" cy="40" rx="11" ry="12" fill="${INK}" opacity=".55"/></g>`).join("")}
    <path ${S} stroke-width="1.5" d="M300 230 h60 M300 222 v16 M360 222 v16"/><text x="308" y="258" font-family="Courier New,monospace" font-size="14" fill="${INK}">30 cm</text>`,
  malomkerek: `<circle cx="200" cy="150" r="110" ${S}/><circle cx="200" cy="150" r="22" ${S}/>
    ${Array.from({ length: 12 }, (_, i) => { const a = i * Math.PI / 6; return `<line x1="${200 + 22 * Math.cos(a)}" y1="${150 + 22 * Math.sin(a)}" x2="${200 + 110 * Math.cos(a)}" y2="${150 + 110 * Math.sin(a)}" stroke="${INK}" stroke-width="3"/><rect x="${200 + 100 * Math.cos(a) - 10}" y="${150 + 100 * Math.sin(a) - 10}" width="20" height="20" transform="rotate(${i * 30} ${200 + 100 * Math.cos(a)} ${150 + 100 * Math.sin(a)})" ${S} stroke-width="2"/>`; }).join("")}
    <path ${S} stroke-width="2" d="M40 270 q40 -12 80 0 t80 0 t80 0 t80 0"/>`,
  kes: `<path ${S} d="M90 200 L270 110 q30 -10 40 0 q-10 30 -40 30 L120 220 Z"/><path ${S} d="M90 200 l-40 30 q-10 10 0 18 q8 6 18 -2 l52 -26"/>`,
  pohar: `<path ${S} d="M150 60 h100 l-14 110 q-6 30 -36 30 q-30 0 -36 -30 z M200 200 v50 M160 250 h80"/><path fill="#7a2a1e" opacity=".5" d="M158 110 h84 l-6 56 q-6 22 -36 22 q-30 0 -36 -22z"/>`
};
export const ABRA_NEVEK = Object.keys(ABRAK);

function abraSvg(nev, cim) {
  const tartalom = ABRAK[nev] || `<rect x="80" y="70" width="240" height="160" ${S}/><text x="200" y="160" text-anchor="middle" font-family="Georgia,serif" font-size="20" fill="${INK}">${esc(cim || "tárgy")}</text>`;
  return `<svg viewBox="0 0 400 300" role="img" aria-label="${esc(cim || nev)}"><defs><filter id="szemcse"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 .23  0 0 0 0 .16  0 0 0 0 .09  0 0 0 .18 0"/></filter>
    <radialGradient id="vignetta" cx="50%" cy="50%" r="70%"><stop offset="55%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#2a1c0c" stop-opacity=".45"/></radialGradient></defs>
    <rect width="400" height="300" fill="#e8d9b5"/>${tartalom}<rect width="400" height="300" filter="url(#szemcse)"/><rect width="400" height="300" fill="url(#vignetta)"/></svg>`;
}

/** Helyszínrajz rajzolása 0–100-as koordinátákból.
 * rajz: { szobak:[{nev,x,y,w,h}], ajtok:[{x,y,irany:"v"|"f"}], jelek:[{x,y,jel,cimke}], vonalak:[{pontok:[[x,y],…],szaggatott,cimke}] } */
function rajzSvg(r) {
  const X = v => 20 + v * 5.6, Y = v => 20 + v * 3.6;
  const szobak = (r.szobak || []).map(s => `<rect x="${X(s.x)}" y="${Y(s.y)}" width="${s.w * 5.6}" height="${s.h * 3.6}" fill="none" stroke="${INK}" stroke-width="3"/>
    <text x="${X(s.x + s.w / 2)}" y="${Y(s.y) + 18}" text-anchor="middle" font-family="Courier New,monospace" font-size="13" fill="${INK}">${esc(s.nev)}</text>`).join("");
  const ajtok = (r.ajtok || []).map(a => a.irany === "v"
    ? `<line x1="${X(a.x)}" y1="${Y(a.y) - 12}" x2="${X(a.x)}" y2="${Y(a.y) + 12}" stroke="#e8d9b5" stroke-width="7"/><path d="M${X(a.x)} ${Y(a.y) - 12} q14 12 0 24" fill="none" stroke="${INK}" stroke-width="1.5"/>`
    : `<line x1="${X(a.x) - 12}" y1="${Y(a.y)}" x2="${X(a.x) + 12}" y2="${Y(a.y)}" stroke="#e8d9b5" stroke-width="7"/><path d="M${X(a.x) - 12} ${Y(a.y)} q12 14 24 0" fill="none" stroke="${INK}" stroke-width="1.5"/>`).join("");
  const vonalak = (r.vonalak || []).map(v => `<polyline points="${v.pontok.map(([x, y]) => X(x) + "," + Y(y)).join(" ")}" fill="none" stroke="#7a2a1e" stroke-width="2.5" ${v.szaggatott ? 'stroke-dasharray="7 6"' : ""}/>`).join("");
  let n = 0;
  const jelmagy = [];
  const jelek = (r.jelek || []).map(j => {
    const sz = j.jel || String(++n);
    if (j.cimke) jelmagy.push(`<li><b>${esc(sz)}</b> — ${esc(j.cimke)}</li>`);
    return `<circle cx="${X(j.x)}" cy="${Y(j.y)}" r="11" fill="#f3e6c8" stroke="#7a2a1e" stroke-width="2"/><text x="${X(j.x)}" y="${Y(j.y) + 5}" text-anchor="middle" font-family="Courier New,monospace" font-weight="700" font-size="13" fill="#7a2a1e">${esc(sz)}</text>`;
  }).join("");
  (r.vonalak || []).forEach(v => { if (v.cimke) jelmagy.push(`<li><b>- - -</b> ${esc(v.cimke)}</li>`); });
  return `<div class="rajz"><svg viewBox="0 0 600 400" role="img" aria-label="Helyszínrajz"><rect width="600" height="400" fill="#e8d9b5"/>
    <g stroke="${INK}" stroke-opacity=".08">${Array.from({ length: 20 }, (_, i) => `<line x1="${i * 30}" y1="0" x2="${i * 30}" y2="400"/>`).join("")}${Array.from({ length: 14 }, (_, i) => `<line x1="0" y1="${i * 30}" x2="600" y2="${i * 30}"/>`).join("")}</g>
    ${szobak}${ajtok}${vonalak}${jelek}<text x="580" y="388" text-anchor="end" font-family="Courier New,monospace" font-size="12" fill="${INK}">É ↑</text></svg>
    ${jelmagy.length ? `<ul class="jelmagy">${jelmagy.join("")}</ul>` : ""}</div>`;
}

const szoveg = t => `<div class="i-szoveg">${esc(t)}</div>`;
const fej = (felirat, d) => `<div class="i-fej"><span>${esc(felirat)}</span>${d.datum ? `<span>${esc(d.datum)}</span>` : ""}</div>`;
const pecset = d => d.pecset ? `<div class="i-pecset" aria-hidden="true"><span>${esc(d.pecset)}</span></div>` : "";
const alair = d => d.alairas ? `<div class="i-alairas">${esc(d.alairas)}</div>` : "";

/** Egy irat HTML-je. opt.azonosito: megjelenjen-e a kis azonosító (nyomtatásban hasznos). */
export function irat(d, opt = {}) {
  const t = d.tipus || "dokumentum";
  const azon = opt.azonosito && d.id ? `<span class="i-azon">${esc(d.id)}</span>` : "";
  const cimsor = d.cim ? `<div class="i-cim">${esc(d.cim)}</div>` : "";
  let belso;
  switch (t) {
    case "jegyzokonyv":
      belso = `${fej("JEGYZŐKÖNYV", d)}${cimsor}${d.hely ? `<div class="i-meta">${esc(d.hely)}</div>` : ""}${szoveg(d.szoveg)}${alair(d)}${pecset(d)}`; break;
    case "vallomas":
      belso = `${fej("TANÚVALLOMÁS", d)}${cimsor}${szoveg(d.szoveg)}${alair(d)}${pecset(d)}`; break;
    case "tavirat":
      belso = `<div class="i-fej"><span>TÁVIRAT</span><span>${esc(d.datum || "")}</span></div>${cimsor}${szoveg(String(d.szoveg || "").toUpperCase())}${alair(d)}`; break;
    case "level": case "naplo": case "feljegyzes":
      belso = `${d.datum ? `<div class="i-datum">${esc(d.datum)}</div>` : ""}${cimsor}${szoveg(d.szoveg)}${alair(d)}`; break;
    case "nyugta":
      belso = `${fej("NYUGTA", d)}${cimsor}${szoveg(d.szoveg)}${alair(d)}${pecset(d)}`; break;
    case "ujsag":
      belso = `<div class="i-ujsagfej">${esc(d.forras || "Fejérmegyei Hírlap")}${d.datum ? " · " + esc(d.datum) : ""}</div>${d.cim ? `<div class="i-ujsagcim">${esc(d.cim)}</div>` : ""}${szoveg(d.szoveg)}`; break;
    case "fenykep":
      belso = `<div class="i-foto">${d.kep ? `<img src="${esc(d.kep)}" alt="${esc(d.felirat || d.cim || "")}">` : abraSvg(d.abra, d.cim)}</div>
        <div class="i-felirat">${esc(d.felirat || d.cim || "")}</div>${d.szoveg ? `<div class="i-hatul"><b>A kép hátoldalán:</b> ${esc(d.szoveg)}</div>` : ""}`; break;
    case "helyszinrajz":
      belso = `${fej("HELYSZÍNRAJZ", d)}${cimsor}${d.rajz ? rajzSvg(d.rajz) : d.abra ? `<div class="i-foto">${abraSvg(d.abra, d.cim)}</div>` : ""}${d.szoveg ? szoveg(d.szoveg) : ""}${alair(d)}`; break;
    default:
      belso = `${fej(d.fejlec || "ÜGYIRAT", d)}${cimsor}${szoveg(d.szoveg)}${alair(d)}${pecset(d)}`;
  }
  return `<article class="irat i-${esc(t)}${d.egett ? " i-egett" : ""}">${azon}${belso}</article>`;
}
