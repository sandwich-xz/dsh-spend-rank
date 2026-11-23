# Daily Spend Ranking

A [DeepSeek Harness](https://github.com/deepseek-ai) Web GUI plugin: a per-day, per-session spend board for your agent sessions. Pick a day, see which sessions were used, how much each one cost, and read the ranking from the most expensive down.

The UI ships in Chinese (the sidebar entry is 「花费排行」). This README is in English; see [README.zh.md](README.zh.md) for the Chinese version.

## What it does

- **Day navigation** — previous/next day, a jump-to-today button, and a 21-day bar timeline; click any bar to switch to that day. The bars use a log scale so a single outlier day does not flatten everything else.
- **Four KPIs** — the day's total spend, active sessions, billed tokens, and requests. The spend figure also shows how many sessions were priced.
- **Ranked session list** — rank, session title, workspace, model, request count, billed tokens, cost and its share of the day. A bar under each row shows the share of the top spender.
- **Subagent folding** — child agent sessions can be folded into their parent (default) or listed separately, with the folded child count shown on the row.
- **Click through** — clicking a row opens that session in the conversation panel.
- **Live catalog** — the list refreshes as the session catalog changes, and it re-reads the catalog while the one-time history backfill runs.

## Install

Requirements:

- DeepSeek Harness `0.2.0-rc.2` or newer.
- [dsh-context](https://github.com/bowenliang123/dsh-context) installed in the same profile — the per-day cost buckets come from its `contextActivity` projection.

Clone the repository and link it into the profile you run the GUI with:

```sh
git clone https://github.com/sandwich-xz/dsh-spend-rank.git
dsh plugin --profile desktop add link:$(pwd)/dsh-spend-rank
```

On Windows PowerShell, pass the absolute path: `link:D:\path\to\dsh-spend-rank`.

Reload the GUI. The sidebar gets a 「花费排行」 entry. You can also append `#spend-rank` to the GUI URL and reload to open the panel directly.

## How the cost is computed

Cost is not re-derived from raw logs. The panel reuses the billed-token buckets that dsh-context folds per session and per day (`contextActivity.days[YYYY-MM-DD].cost`): uncached input, cache read, cache write and output, split into peak and off-peak. Those buckets are priced with the models.dev list rates:

- DeepSeek peak windows (weekdays 09:00–12:00 and 14:00–18:00 Beijing time) bill at 2× the list rate; other windows bill at the list rate.
- CNY is converted with `1 CNY = 0.15 USD`, the same rate dsh-context uses.
- Models missing from the built-in price table are left unpriced: the row shows `—`, and the unpriced tokens are excluded from the total (the panel states how many sessions were affected).

**First open triggers a backfill.** Only sessions whose projections have been folded carry daily cost. On mount the panel calls dsh-context's `POST /api/dsh-context/backfill` and refreshes the session catalog every 20 seconds for a few minutes, so history fills in as the fold completes. On a large installation (hundreds of sessions) this takes a minute or two; after that the backfill is incremental.

## Limits

- Only sessions still present in the session catalog are counted; deleted sessions are not in the ranking.
- Costs are estimates and do not include requests that never reported usage.
- The daily totals match the `dsh-usage` ledger within rounding on a normal day (verified: ¥5.38 vs ¥5.39, and ¥315.70 vs ¥315.68 on a high-volume day).
- The UI is Chinese-only for now.

## Development

Plain JavaScript, no build step.

```sh
node --check client.js
node --check index.js
```

The client half is a single module registered through `window.__ModuleLoader__`; it reads the session catalog, registers a `sidebar.panellist` entry and a keyed `main` panel. After editing `client.js`, reload the GUI page.

## Privacy

Everything is local. The panel reads the session catalog and calls the same-origin dsh-context backfill route; there is no telemetry and no third-party request.

## License

MIT. See [LICENSE](LICENSE).
