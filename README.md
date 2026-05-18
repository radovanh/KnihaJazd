# 📋 Kniha Jazd

Webová aplikácia pre evidenciu firemných ciest, PHM a súvisiacich nákladov.  
Podporuje viacerých používateľov a tri spôsoby ukladania dát.

---

## 🚀 Spustenie

### Lokálne (Python server)
```bash
python3 server.py
```
Aplikácia sa otvorí na **http://localhost:8765** a dáta sa ukladajú do `data.json`.

### GitHub Pages
1. Pushujte priečinok do GitHub repozitára
2. Zapnite **Settings → Pages → Deploy from branch → main**
3. Otvorte `https://<vas-username>.github.io/<nazov-repozitara>/`
4. Nakonfigurujte GitHub PAT cez **⚙️ Nastavenia ukladania dát**

---

## 💾 Ukladanie dát

| Prostredie | Uloženie |
|---|---|
| `localhost` | `data.json` na disku (Python server) + localStorage záloha |
| GitHub Pages + PAT | Commit priamo do repozitára cez GitHub API |
| GitHub Pages bez PAT | Len `localStorage` v prehliadači |

---

## 👥 Viacerí používatelia

- Každý používateľ má vlastné vozidlá, miesta, trasy, jazdy a PHM záznamy
- Používatelia sa spravujú na úvodnej obrazovke
- Všetci zdieľajú jeden `data.json` súbor (oddelené sekcie per-user)

---

## 🔑 GitHub PAT — nastavenie

1. GitHub → **Settings → Developer settings → Personal access tokens → Fine-grained tokens**
2. Scope: **Contents → Read and write** pre váš repozitár
3. Vložte token v aplikácii cez **⚙️ Nastavenia ukladania dát**

---

## Funkcie

- 🚗 Evidencia jázd s predvolenými miestami a trasami
- ⛽ Evidencia PHM (cena, litre, suma, tachometer)
- ✅ Validácia (tachometer, víkendy, sviatky, PHM bez jazdy)
- 🗺️ Definovateľné trasy a miesta
- 📊 Prehľad so štatistikami a validačnými upozorneniami
- 💾 Export/Import JSON zálohy

---

## Súbory

```
kniha_jazd/
├── index.html      — aplikácia (všetko v jedinom súbore)
├── server.py       — lokálny Python HTTP server
├── data.json       — dáta (jazdy, PHM, používatelia)
├── .nojekyll       — pre správne fungovanie GitHub Pages
└── README.md
```
