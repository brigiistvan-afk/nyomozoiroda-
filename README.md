# Nyomozóiroda

Csapatos nyomozós játék 20–40 főnek: telefonos fejtörők, valódi számzáras ládák és nyomtatott iratok.
Egy ügy egy JSON-fájl. Ha feltöltesz egy újat a GitHubra, automatikusan megjelenik a játékosok appjában.
Tárhely: GitHub Pages (ingyenes).

## Mi van a csomagban

```
ugyek/                 ← a feltölthető (titkosított) ügyfájlok — ITT VANNAK A JÁTÉKOK
  utolso-orles.json    ← mintaügy: Az utolsó őrlés (1928), jelszó: proba
web/                   ← a weboldal motorja (ritkán kell hozzányúlni)
  index.html           ← csapat-app (telefon)
  jatekmester.html     ← játékmesteri konzol: óra, megoldások, nyomtatás, eredmények, kivetítő
  csomagolo.html       ← olvasható ügyfájlból titkosított, feltölthető fájlt készít
  kepek/               ← saját fotók az iratokhoz
  motor/               ← közös kód, iratsablonok, témák
forras/                ← olvasható ügyfájlok — CSAK privát repóban (lásd forras/OLVASS.md)
eszkozok/build.mjs     ← ellenőrzi az ügyeket, elkészíti az ügylistát és a weboldalt
.github/workflows/     ← minden feltöltés után automatikusan frissíti a weboldalt
```

## Első beállítás (egyszer kell, kb. 5 perc)

1. **Repó:** a GitHubon *New repository* → név: pl. `nyomozoiroda` → **Public** → *Create repository*.
2. **Feltöltés:** a repó oldalán *uploading an existing file* → húzd rá a kicsomagolt mappa **tartalmát**
   (a `.github` mappát is — ha a böngésző nem mutatja, lásd lent) → *Commit changes*.
3. **Pages bekapcsolása:** *Settings → Pages → Build and deployment → Source:* **GitHub Actions**.
4. **Első futás:** *Actions* fül → *Weboldal frissítése* → *Run workflow*. 1–2 perc múlva kész.
5. A weboldal címe: `https://FELHASZNALONEV.github.io/nyomozoiroda/`
   — a csapatok ezt nyitják meg, te a `…/jatekmester.html` oldalt.

> **A `.github` mappa feltöltése:** a rejtett mappákat a Mac Finder és a Windows Intéző nem mindig mutatja.
> Ha nem sikerül, a GitHubon: *Add file → Create new file* → név: `.github/workflows/weboldal.yml`,
> és másold bele a fájl tartalmát.

**Miért lehet nyilvános a repó?** Az `ugyek/` mappában a fájlok titkosítva vannak: a megfejtések csak
lenyomatként szerepelnek, a jutalmak és a ládák iratai csak a helyes válasszal, a teljes megoldás csak
a játékmesteri jelszóval nyílik ki. Olvasható ügyfájlt nyilvános repóba **soha** ne tölts fel.

## Új ügy feltöltése

1. Nyisd meg a weboldalon a **Csomagolót** (`…/csomagolo.html`, a játékmesteri belépőoldalról is elérhető).
2. Válaszd ki az olvasható ügyfájlt (a generátortól), add meg a játékmesteri jelszót → *Ellenőrzés és csomagolás*.
   Ha hiba van benne (hiányzó mező, rossz kódhossz, ismétlődő azonosító), magyarul kiírja.
3. A letöltött fájlt töltsd fel a repó **ugyek/** mappájába (*Add file → Upload files → Commit*).
4. 1–2 perc múlva az új ügy megjelenik a csapat-app ügyválasztójában és a konzolban.
   Az *Actions* fülön látod, hogy kész-e (zöld pipa). Ha piros, a naplóban le van írva, mi a gond,
   és addig a régi, működő változat marad élesben.

**A mintaügy jelszava `proba`.** Csomagold újra a saját jelszavaddal: a forrását
(`utolso-orles-forras.json`) külön kaptad meg. Ezt **ne** tedd a nyilvános repóba.

**Ügy törlése:** töröld a fájlt az `ugyek/` mappából. **Sorrend:** az ügyfájlban a `"sorrend": 10` mező
előrébb hozza a listában.

## Egy játék menete

| Ki | Mit csinál |
|---|---|
| Előtte | Konzol → **Nyomtatás**: beállítod a csapatok számát, kinyomtatod a csomagot (játékmesteri lap, láda-beállító, címkék, QR-plakát, borítékok tartalma). A borítékokat a ládákba teszed, a lakatokat a kódra állítod. |
| Kezdés | Konzol → **Óra indítása**. Megjelenik a 4 jegyű **indítókód**, ezt kivetíted. |
| Csapatok | Csapatonként egy telefon: megnyitják az oldalt, kiválasztják az ügyet, beírják a csapatnevet és az indítókódot. Ettől minden telefonon ugyanaz az óra fut. |
| Játék | A fejtörők **egymástól függetlenek**, bármilyen sorrendben megoldhatók, így a csapatok a saját tempójukban haladnak. A felvonások időre nyílnak. A **ládák időzárral** nyílnak: a láda feladványa csak az időkapu után látszik, a helyes kód beírásakor a telefon rögzíti az időt. Minél hamarabb nyitják ki, annál több pont jár. |
| Láda | A telefon megmondja a teendőt: kinyitni, a saját borítékot kivenni, visszazárni, összekeverni. A boríték iratai a telefonon is megjelennek. |
| Vége | A csapatok a telefonon leadják a vádiratot, és kapnak egy **eredménykódot** (pl. `K7M-Q2XP`). Ezt beírod a konzol **Eredmények** fülén, és kész a ranglista. A **Kivetítő** nézet mutatja az órát, az indítókódot, a következő ládát, a bejelentéseket és az állást. |

**Internet nélkül is működik?** Az oldal betöltéséhez kell net, utána a játék a telefonon fut (a pontok és megfejtések helyben tárolódnak).

**Ki lehet-e lesni a megoldást?** A megfejtések csak lenyomatként szerepelnek, a jutalmak és a ládák iratai titkosítva vannak, és csak a helyes válasszal nyílnak ki. A megoldás csak a játékmesteri jelszóval olvasható. (Egy programozó a 3–4 jegyű kódokat sok próbálkozással elvileg kitalálhatná, de egy rendezvényen ez nem reális veszély.)

## Helyi kipróbálás (opcionális)

```
npm run ellenoriz        # csak ellenőrzi a forras/ mappát
npm run proba            # build + helyi szerver (http://localhost:3000)
```
Node 18+ kell. A `dist/` mappát ne töltsd fel, azt a GitHub Actions készíti el.

---

## Az ügyfájl formátuma

Ez az olvasható ügyfájl formátuma (a generátor is ilyet készít), ezt kell becsomagolni. Teljes példa: `utolso-orles-forras.json`.

```jsonc
{
  "id": "vadaszbal-1890",            // kisbetű, szám, kötőjel — egyedi
  "cim": "…", "alcim": "…",
  "tema": "noir1920",                // noir1920 | vadasz | modern | borzongos
  "jatekosok": "20–40 fő, 4–7 csapat",
  "idotartam": 180,                  // perc
  "korszak": "…", "helyszin": "…",
  "bevezeto": "…",                   // a csapatok ezt olvassák elsőként (\n = új bekezdés)
  "megbizas": "…",
  "aldozat": { "nev": "…", "kor": 62, "leiras": "…", "megtalalas": "…" },
  "gyanusitottak": [ { "id": "s1", "nev": "…", "kor": 44, "kapcsolat": "…", "leiras": "…",
                       "inditek": "…", "valojaban": "…" } ],     // inditek/valojaban: csak a játékmester látja
  "dosszie": [ IRAT, … ],            // a csapatok az elején megkapják
  "fejtorok": [ {
      "id": "F1", "cim": "…", "felvonas": 1, "nyilik": 0,          // nyilik: hányadik perctől látszik
      "nehezseg": "konnyu",                                         // konnyu | kozepes | nehez
      "mechanika": "Időrend",
      "kartyak": [ { "cim": "…", "szoveg": "…", "valasz": "48163" } ],  // több kártya = több részfeladat
      "sugok": [ "…", "…" ],
      "magyarazat": "…",
      "jutalom": [ IRAT, … ]          // megfejtés után a csapat megkapja
  } ],
  "ladak": [ {
      "id": "L1", "nev": "…", "hely": "hová tedd a helyszínen",
      "nyilik": 30, "szamjegy": 3, "kod": "246",                    // a kód hossza = a lakat számjegyei
      "rejtveny": { "cim": "…", "szoveg": "…", "sugok": [ … ], "magyarazat": "…" },
      "iratok": [ IRAT, … ]           // ezek kerülnek nyomtatva a borítékba
  } ],
  "vadirat": { "nyilik": 120, "kerdesek": [          // pontosan ez a 4 kérdés, kérdésenként 2–8 opció
      { "id": "tettes",  "kerdes": "Ki a tettes?",   "opciok": [ … ], "helyes": 3 },
      { "id": "inditek", "kerdes": "…", "opciok": [ … ], "helyes": 0 },
      { "id": "fegyver", "kerdes": "…", "opciok": [ … ], "helyes": 2 },
      { "id": "ido",     "kerdes": "…", "opciok": [ … ], "helyes": 1 } ] },
  "megoldas": { "tettes": "…", "inditek": "…", "fegyver": "…", "valodiIdo": "21:52", "hamisIdo": "22:15",
                "modszer": "…", "lanc": [ "…" ], "vallomas": "…" },
  "forgatokonyv": [ { "perc": 0, "cim": "…", "teendo": "…" } ],
  "pontozas": { "fejtoro": { "konnyu": 6, "kozepes": 8, "nehez": 10 }, "sugo": 2,
                "lada": [10, 8, 6, 4],            // 0–10., 10–20., 20–30. perc a nyílás után, utána
                "vadirat": { "tettes": 15, "inditek": 6, "fegyver": 5, "ido": 6 } }
}
```

### Iratok (IRAT)

Minden irat: `{ "id": "egyedi", "tipus": "…", "cim": "…", "datum": "…", "szoveg": "…", "alairas": "…", "pecset": "…" }`

| tipus | Kinézet |
|---|---|
| `jegyzokonyv` | írógépes jegyzőkönyv fejléccel, aláírással, pecséttel (`hely` is megadható) |
| `vallomas` | tanúvallomás |
| `level` | kézírásos levél |
| `naplo` | vonalas füzetlap, kézírás |
| `feljegyzes` | sárga cetli, kézírás |
| `tavirat` | táviratűrlap |
| `nyugta` | keskeny nyugta |
| `dokumentum` | hivatalos irat; a `fejlec` mező adja a fejlécet (pl. „SZAKVÉLEMÉNY”), `"egett": true` = félig elégett papír |
| `ujsag` | újságkivágás (`forras`: az újság neve) |
| `fenykep` | régi fénykép. `abra`: beépített rajz, vagy `kep`: saját kép útvonala (pl. `kepek/foto1.jpg` a `web/kepek/` mappából). `felirat`: a kép alá, `szoveg`: a kép hátoldalára |
| `helyszinrajz` | alaprajz a `rajz` mezőből (szobák, ajtók, számozott jelek, szaggatott vonalak, 0–100-as koordinátákkal; lásd a mintaügy D04 iratát) |

Beépített rajzok (`abra`): `zsebora`, `setapalca`, `zsebkendo`, `lampas`, `sziluett`, `gyongysor`, `fokonyv`,
`kulcs`, `boritek`, `uveg`, `labnyom`, `malomkerek`, `kes`, `pohar`.

**Saját fotó:** tedd a képet a `web/kepek/` mappába, és az iratban: `"tipus": "fenykep", "kep": "kepek/kep.jpg"`.

### Jó tudni egy új ügy írásakor

- A fejtörők legyenek **függetlenek**: mindegyik megoldható legyen a dosszié és a nyílt iratok alapján, egy másik fejtörő megfejtése nélkül.
- A megfejtés legyen **az ügy része** (időpont, összeg, név), ne elvont logikai feladat.
- Minden fejtörőnek **egyetlen** jó válasza legyen. A válasz összehasonlításakor az ékezet, a szóköz és az írásjel nem számít („22:05” = „2205”, „Rózsakert” = „ROZSAKERT”).
- Az utolsó láda kódja jó, ha több láda iratából áll össze: ettől a csapatok alkudni kezdenek egymással.
