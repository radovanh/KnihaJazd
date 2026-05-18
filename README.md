# 📋 Kniha Jazd — Firemná evidencia jázd

Webová aplikácia pre evidenciu firemných ciest, PHM a súvisiacich nákladov.

## Spustenie

**Požiadavky:** Python 3.6+

```bash
python3 server.py
```

Aplikácia sa automaticky otvorí na adrese: **http://localhost:8765**

Na zastavenie stlačte `Ctrl+C`.

---

## Funkcie

### 🚗 Evidencia jázd
- Pridávanie, úprava a mazanie záznamov jázd
- Predvolené miesta a trasy pre rýchle zadávanie
- Automatický výpočet prejdenej vzdialenosti
- Filtrovanie podľa mesiaca, vozidla a vyhľadávanie

### ⛽ Evidencia PHM
- Záznamy tankovania s cenou, množstvom a sumou
- Automatický výpočet celkovej sumy z ceny × množstvo
- Kontrola existencie jazdy v deň tankovania
- Štatistiky spotreby

### ✅ Validácia
- **Kontrola tachometra:** upozornenie pri nezhodujúcich sa hodnotách medzi jazdami
- **Víkendy:** upozornenie pri jazdách cez sobotu/nedeľu
- **Sviatky:** upozornenie pri jazdách na sviatky
- **PHM bez jazdy:** upozornenie pri tankovacích záznamoch bez príslušnej jazdy
- **Nekonzistentná vzdialenosť:** upozornenie pri vzdialenosti 0 km

### 🗺️ Trasy a Miesta
- Definícia predvolených trás so vzdialenosťou a dôvodom jazdy
- Správa miest/cieľov s adresami
- Automatické vyplnenie adresy pri výbere trasy

### ⚙️ Nastavenia
- Správa vozidiel (názov + EČV)
- Dôvody jázd
- Sviatky (SK + vlastné)
- Export/Import dát vo formáte JSON

---

## Dáta

Všetky dáta sú ukladané do súboru `data.json` v priečinku aplikácie.

Zálohovanie: použite **Nastavenia → Exportovať JSON**.

---

## Štruktúra súborov

```
kniha_jazd/
├── index.html      — webová aplikácia
├── server.py       — lokálny HTTP server
├── data.json       — dáta (jazdy, PHM, nastavenia)
└── README.md       — tento súbor
```
