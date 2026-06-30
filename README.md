# CopilotKit Journey Demo

A Vite + React demo with two routed journey pages and a CopilotKit chat drawer.

## Run

1. Paste your OpenAI key into `.env`.
2. Install dependencies:

```bash
npm install
```

3. Start the local Copilot runtime and Vite app:

```bash
npm run dev
```

Open `http://localhost:5173`.

## What the demo includes

- `/financial-profile` captures income, savings, investments, expenses, liabilities, and debt payments.
- `/product-search` captures fund search criteria and displays a fund result table.
- The chat drawer expands to 30% width and collapses to a small rail.
- Copilot receives current route, financial profile, product criteria, and visible results as app context.
- Copilot can update profile fields, update search criteria, replace results, run a sample fund search, and navigate pages through frontend tools.
- The profile and search pages include buttons that invoke registered frontend tools through CopilotKit without an LLM follow-up.
