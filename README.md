# Nyomozóiroda

Csapatos nyomozós játék 20–40 főnek: telefonos fejtörők, valódi számzáras ládák és nyomtatott iratok.
Ingyenes tárhely: GitHub Pages. Egy ügy egy fájl. Ha feltöltesz egy újat az `ugyek` mappába, megjelenik a játékosok appjában.

## Mi van a repóban

```
index.html          ← csapat-app (telefon)
jatekmester.html    ← játékmesteri konzol: óra, megoldások, nyomtatás, eredmények, kivetítő
csomagolo.html      ← olvasható ügyfájlból titkosított, feltölthető fájlt készít
motor/              ← a játék motorja (nem kell hozzányúlni)
ugyek/              ← A JÁTÉKOK — ide kerülnek a csomagolt ügyfájlok
  utolso-orles.json ← mintaügy: Az utolsó őrlés (1928), jelszó: proba
kepek/              ← saját fotók az iratokhoz
```

## Beállítás (egyszer)

1. GitHub → **New repository** → név pl. `nyomozoiroda` → **Public** → **Create repository**.
2. **uploading an existing file** → húzd rá a mappa **tartalmát** (index.html, jatekmester.html, csomagolo.html, motor, ugyek, kepek, README.md) → **Commit changes**.
3. **Settings → Pages → Build and deployment**:
   - Source: **Deploy from a branch**
   - Branch: **main** és **/ (root)** → **Save**
4. 1–2 perc múlva a Pages oldal tetején megjelenik a cím: `https://FELHASZNALONEV.github.io/nyomozoiroda/`
   — ezt nyitják meg a csapatok. A konzol: `…/jatekmester.html`.

## Új ügy

1. Nyisd meg a **Csomagolót** (`…/csomagolo.html`).
2. Válaszd ki az olvasható ügyfájlt, add meg a játékmesteri jelszót → **Ellenőrzés és csomagolás** → letöltés.
3. A repóban lépj be az **ugyek** mappába → **Add file → Upload files** → húzd rá → **Commit changes**.
4. Legfeljebb kb. 10 perc múlva megjelenik az appban (a GitHub ennyi ideig tárolja a régi változatot).

Javítás: ugyanazzal a fájlnévvel töltsd fel újra. Törlés: töröld a fájlt az `ugyek` mappából.
Olvasható (titkosítatlan) ügyfájlt **soha** ne tölts fel a nyilvános repóba.

**A mintaügy jelszava `proba`** — csomagold újra a saját jelszavaddal (a forrását külön kaptad: `utolso-orles-forras.json`).

## Egy játék menete

| Ki | Mit csinál |
|---|---|
| Előtte | Konzol → **Nyomtatás**: csapatszám, nyomtatás (játékmesteri lap, láda-beállító, címkék, QR-plakát, borítékok). Borítékok a ládákba, lakatok a kódra. |
| Kezdés | Konzol → **Óra indítása** → a 4 jegyű **indítókódot** kivetíted. |
| Csapatok | Csapatonként egy telefon: ügy kiválasztása, csapatnév, indítókód. Minden telefonon ugyanaz az óra fut. |
| Játék | A fejtörők függetlenek, bármilyen sorrendben megoldhatók. A ládák időzárral nyílnak; a helyes kód beírásakor a telefon rögzíti az időt (gyorsabb = több pont), és megmondja, mit kell tenni a ládánál. |
| Vége | Vádirat a telefonon → **eredménykód** → beírod a konzol **Eredmények** fülén → ranglista a **Kivetítőn**. |

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
| `fenykep` | régi fénykép. `abra`: beépített rajz, vagy `kep`: saját kép útvonala (pl. `kepek/foto1.jpg` a `kepek/` mappából). `felirat`: a kép alá, `szoveg`: a kép hátoldalára |
| `helyszinrajz` | alaprajz a `rajz` mezőből (szobák, ajtók, számozott jelek, szaggatott vonalak, 0–100-as koordinátákkal; lásd a mintaügy D04 iratát) |

Beépített rajzok (`abra`): `zsebora`, `setapalca`, `zsebkendo`, `lampas`, `sziluett`, `gyongysor`, `fokonyv`,
`kulcs`, `boritek`, `uveg`, `labnyom`, `malomkerek`, `kes`, `pohar`.

**Saját fotó:** tedd a képet a `kepek/` mappába, és az iratban: `"tipus": "fenykep", "kep": "kepek/kep.jpg"`.

### Jó tudni egy új ügy írásakor

- A fejtörők legyenek **függetlenek**: mindegyik megoldható legyen a dosszié és a nyílt iratok alapján, egy másik fejtörő megfejtése nélkül.
- A megfejtés legyen **az ügy része** (időpont, összeg, név), ne elvont logikai feladat.
- Minden fejtörőnek **egyetlen** jó válasza legyen. A válasz összehasonlításakor az ékezet, a szóköz és az írásjel nem számít („22:05” = „2205”, „Rózsakert” = „ROZSAKERT”).
- Az utolsó láda kódja jó, ha több láda iratából áll össze: ettől a csapatok alkudni kezdenek egymással.
