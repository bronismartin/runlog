# 🏃 RunLog – Zápisník běhů

Jednoduchá webová aplikace pro záznam a sledování běhů. Nasazená na **Microsoft Azure Static Web Apps** s CI/CD přes **GitHub Actions**.

## Funkce

- **Přidávání běhů** – datum, vzdálenost, čas, pocit, poznámka
- **Automatický výpočet tempa** (min/km)
- **Souhrnné statistiky** – celkové km, počet běhů, průměrné tempo, km tento měsíc
- **Filtrování** – vše / tento týden / tento měsíc
- **Lokální úložiště** – data se ukládají v prohlížeči (localStorage)
- **Responzivní design** – funguje na mobilu i desktopu

## Nasazení na Azure

### Krok 1: Vytvořte GitHub repozitář

```bash
git init
git add .
git commit -m "Initial commit – RunLog app"
git remote add origin https://github.com/VAŠE-JMÉNO/runlog.git
git branch -M main
git push -u origin main
```

### Krok 2: Vytvořte Azure Static Web App

1. Přihlaste se na [Azure Portal](https://portal.azure.com)
2. Klikněte **Vytvořit prostředek** → hledejte **Static Web App**
3. Vyplňte:
   - **Název**: `runlog`
   - **Plán**: Free
   - **Zdroj**: GitHub
   - **Organizace/Repo/Větev**: vyberte váš repozitář a větev `main`
   - **Nastavení sestavení**:
     - App location: `/`
     - Output location: *(nechte prázdné)*
4. Klikněte **Vytvořit**

Azure automaticky přidá deployment token do vašeho GitHub repo jako secret `AZURE_STATIC_WEB_APPS_API_TOKEN`.

### Krok 3: Hotovo!

Každý push do `main` automaticky nasadí novou verzi. URL najdete v Azure Portal v přehledu vaší Static Web App.

## Lokální vývoj

Stačí otevřít `index.html` v prohlížeči, nebo:

```bash
npx serve .
```

## Struktura projektu

```
runlog/
├── index.html                        # Celá aplikace (SPA)
├── staticwebapp.config.json          # Konfigurace Azure Static Web Apps
├── .github/
│   └── workflows/
│       └── azure-static-web-apps.yml # CI/CD pipeline
└── README.md
```

## Licence

MIT
