window.__ModuleLoader__.load({
  id: '@local/spend-rank',
  factory(require) {
    'use strict'
    const React = require('react')
    const h = React.createElement

    /** Panel id shared by the sidebar row and the keyed `main` occupant. */
    const PANEL_ID = 'spend-rank'
    /** Row order after the shipped panels and the runtime overview. */
    const PANEL_ORDER = 31
    /** Days drawn in the mini timeline. */
    const STRIP_DAYS = 21
    /** Re-render cadence so "today" and running sessions stay honest. */
    const TICK_MS = 60000
    /** dsh-context quotes DeepSeek in USD and prints CNY with this rate. */
    const CNY_PER_USD = 1 / 0.15
    const YUAN = '\u00a5'

    /**
     * models.dev list prices, USD per 1M tokens, for the DeepSeek models this
     * deployment routes. These are the same numbers dsh-context prices against.
     * Unknown models are left unpriced rather than guessed.
     */
    const MODEL_PRICES = {
      'deepseek-flash': { input: 0.15, output: 0.6, cacheRead: 0.003, cacheWrite: 0.15 },
      'deepseek-v4-pro': { input: 0.66, output: 1.98, cacheRead: 0.022, cacheWrite: 0.66 }
    }

    const STYLE = [
      '.sr-root{position:relative;display:flex;flex-direction:column;box-sizing:border-box;width:100%;height:100%;min-width:0;min-height:0;padding:16px max(20px,calc((100% - 1080px) / 2)) 12px;gap:12px;background:var(--dsw-alias-bg-base);backdrop-filter:blur(18px) saturate(1.06);-webkit-backdrop-filter:blur(18px) saturate(1.06);color:var(--dsw-alias-label-primary);font-variant-numeric:tabular-nums;}',
      '.sr-head{display:flex;align-items:flex-start;gap:11px;flex:none;min-width:0;}',
      '.sr-brand{width:30px;height:30px;flex:none;margin-top:1px;border-radius:9px;display:flex;align-items:center;justify-content:center;color:var(--dsw-alias-brand-primary);background:color-mix(in srgb,var(--dsw-alias-brand-primary) 13%,transparent);}',
      '.sr-headText{min-width:0;display:flex;flex-direction:column;gap:2px;}',
      '.sr-title{font-size:17px;line-height:1.25;font-weight:650;letter-spacing:0.01em;white-space:nowrap;}',
      '.sr-sub{font-size:11.5px;line-height:1.4;color:var(--dsw-alias-label-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
      '.sr-controls{margin-left:auto;display:flex;align-items:center;gap:8px;flex:none;}',
      '.sr-navGroup{display:inline-flex;align-items:center;height:28px;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:var(--dsw-alias-bg-layer-1);overflow:hidden;}',
      '.sr-nav{width:26px;height:100%;display:inline-flex;align-items:center;justify-content:center;border:0;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:13px;line-height:1;cursor:pointer;padding:0;}',
      '.sr-nav:hover:not(:disabled){color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-2);}',
      '.sr-nav:disabled{opacity:0.3;cursor:default;}',
      '.sr-dateBox{display:flex;align-items:baseline;gap:5px;padding:0 8px;min-width:112px;justify-content:center;white-space:nowrap;}',
      '.sr-dateText{font-size:12.5px;font-weight:600;letter-spacing:0.01em;}',
      '.sr-dateSub{font-size:10.5px;color:var(--dsw-alias-state-idle-primary);}',
      '.sr-todayBtn{height:28px;padding:0 10px;border-radius:8px;border:1px solid var(--dsw-alias-border-l1);background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:11.5px;line-height:1;cursor:pointer;white-space:nowrap;}',
      '.sr-todayBtn:hover:not(:disabled){color:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-border-l2);}',
      '.sr-todayBtn:disabled{opacity:0.4;cursor:default;}',
      '.sr-fold{height:28px;display:inline-flex;align-items:center;gap:6px;padding:0 9px;border-radius:8px;border:1px solid var(--dsw-alias-border-l1);background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:11.5px;line-height:1;cursor:pointer;white-space:nowrap;}',
      '.sr-fold i{width:9px;height:9px;border-radius:3px;border:1.5px solid currentColor;display:inline-block;opacity:0.55;}',
      '.sr-foldOn{color:var(--dsw-alias-brand-primary);border-color:color-mix(in srgb,var(--dsw-alias-brand-primary) 42%,transparent);background:color-mix(in srgb,var(--dsw-alias-brand-primary) 9%,transparent);}',
      '.sr-foldOn i{background:currentColor;border-color:currentColor;opacity:1;}',
      '.sr-strip{display:flex;align-items:flex-end;gap:4px;height:66px;flex:none;padding:8px 12px 6px;border:1px solid color-mix(in srgb,var(--dsw-alias-label-primary) 8%,transparent);border-radius:10px;background:linear-gradient(var(--dsw-alias-bg-layer-1),var(--dsw-alias-bg-layer-1)),linear-gradient(var(--dsw-alias-bg-layer-1),var(--dsw-alias-bg-layer-1)),var(--dsw-alias-bg-base);}',
      '.sr-day{flex:1 1 0;min-width:0;height:100%;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:4px;padding:0;border:0;background:transparent;color:inherit;font:inherit;cursor:pointer;}',
      '.sr-dayBar{width:100%;max-width:28px;min-height:3px;border-radius:3px 3px 1px 1px;background:color-mix(in srgb,var(--dsw-alias-label-primary) 22%,transparent);transition:background 130ms ease;}',
      '.sr-day:hover .sr-dayBar{background:color-mix(in srgb,var(--dsw-alias-label-primary) 40%,transparent);}',
      '.sr-day--empty .sr-dayBar{background:color-mix(in srgb,var(--dsw-alias-label-primary) 12%,transparent);}',
      '.sr-day--on .sr-dayBar,.sr-day--on:hover .sr-dayBar{background:linear-gradient(180deg,var(--dsw-alias-brand-primary) 0%,color-mix(in srgb,var(--dsw-alias-brand-primary) 62%,transparent) 100%);box-shadow:0 0 0 1px color-mix(in srgb,var(--dsw-alias-brand-primary) 30%,transparent);}',
      '.sr-dayLab{font-size:9px;line-height:1;color:var(--dsw-alias-state-idle-primary);height:9px;white-space:nowrap;}',
      '.sr-day--on .sr-dayLab{color:var(--dsw-alias-brand-primary);font-weight:650;}',
      '.sr-kpis{display:grid;grid-template-columns:1.5fr 1fr 1fr 1fr;flex:none;border:1px solid color-mix(in srgb,var(--dsw-alias-label-primary) 9%,transparent);border-radius:10px;background:linear-gradient(var(--dsw-alias-bg-layer-1),var(--dsw-alias-bg-layer-1)),linear-gradient(var(--dsw-alias-bg-layer-1),var(--dsw-alias-bg-layer-1)),var(--dsw-alias-bg-base);overflow:hidden;}',
      '.sr-kpi{min-width:0;padding:9px 14px 10px;border-left:1px solid color-mix(in srgb,var(--dsw-alias-label-primary) 9%,transparent);}',
      '.sr-kpi:first-child{border-left:0;}',
      '.sr-kpiLab{font-size:10px;line-height:1.2;letter-spacing:0.05em;color:var(--dsw-alias-state-idle-primary);white-space:nowrap;}',
      '.sr-kpiVal{margin-top:3px;font-size:18px;line-height:1.15;font-weight:640;letter-spacing:-0.01em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
      '.sr-kpiVal small{margin-left:4px;font-size:10.5px;font-weight:500;letter-spacing:0;color:var(--dsw-alias-state-idle-primary);}',
      '.sr-kpi--total .sr-kpiVal{color:var(--dsw-alias-brand-primary);}',
      '.sr-list{display:flex;flex-direction:column;flex:1 1 auto;min-height:0;border:1px solid color-mix(in srgb,var(--dsw-alias-label-primary) 9%,transparent);border-radius:10px;background:linear-gradient(var(--dsw-alias-bg-layer-1),var(--dsw-alias-bg-layer-1)),linear-gradient(var(--dsw-alias-bg-layer-1),var(--dsw-alias-bg-layer-1)),var(--dsw-alias-bg-base);overflow:hidden;}',
      '.sr-listHead{display:flex;align-items:center;gap:8px;flex:none;padding:8px 14px;border-bottom:1px solid color-mix(in srgb,var(--dsw-alias-label-primary) 8%,transparent);font-size:11px;color:var(--dsw-alias-label-secondary);}',
      '.sr-listTitle{font-size:12px;font-weight:600;color:var(--dsw-alias-label-primary);}',
      '.sr-listMeta{margin-left:auto;font-size:10.5px;color:var(--dsw-alias-state-idle-primary);white-space:nowrap;}',
      '.sr-rows{flex:1 1 auto;min-height:0;overflow-y:auto;overscroll-behavior:contain;}',
      '.sr-row{display:grid;grid-template-columns:26px minmax(0,1fr) 96px;gap:10px;align-items:center;width:100%;box-sizing:border-box;padding:9px 14px 10px;border:0;border-bottom:1px solid color-mix(in srgb,var(--dsw-alias-label-primary) 8%,transparent);background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer;transition:background 120ms ease;}',
      '.sr-row:last-child{border-bottom:0;}',
      '.sr-row:hover{background:color-mix(in srgb,var(--dsw-alias-label-primary) 5%,transparent);}',
      '.sr-row:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:-2px;}',
      '.sr-rank{font-size:13px;font-weight:700;line-height:1;text-align:center;color:var(--dsw-alias-state-idle-primary);}',
      '.sr-row--1 .sr-rank{color:#c2913a;}',
      '.sr-row--2 .sr-rank{color:#8b95a7;}',
      '.sr-row--3 .sr-rank{color:#a9744a;}',
      '.sr-rowMain{min-width:0;display:flex;flex-direction:column;gap:0;}',
      '.sr-rowTitle{font-size:13px;line-height:1.35;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
      '.sr-meta{margin-top:3px;display:flex;align-items:center;gap:5px;min-width:0;font-size:10.5px;line-height:1.3;color:var(--dsw-alias-label-secondary);white-space:nowrap;overflow:hidden;}',
      '.sr-metaText{overflow:hidden;text-overflow:ellipsis;min-width:0;}',
      '.sr-sep{flex:none;color:var(--dsw-alias-state-idle-primary);opacity:0.6;}',
      '.sr-tag{flex:none;font-size:9.5px;line-height:1;padding:2px 5px;border-radius:4px;border:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-state-idle-primary);}',
      '.sr-tag--warn{color:var(--dsw-alias-state-warn-primary);border-color:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 38%,transparent);}',
      '.sr-bar{display:block;margin-top:7px;height:5px;border-radius:3px;background:color-mix(in srgb,var(--dsw-alias-label-primary) 10%,transparent);overflow:hidden;}',
      '.sr-bar i{display:block;height:100%;border-radius:3px;background:linear-gradient(90deg,color-mix(in srgb,var(--dsw-alias-brand-primary) 40%,transparent) 0%,color-mix(in srgb,var(--dsw-alias-brand-primary) 72%,transparent) 100%);}',
      '.sr-money{min-width:0;text-align:right;}',
      '.sr-amount{display:block;font-size:15px;line-height:1.2;font-weight:650;letter-spacing:-0.01em;white-space:nowrap;}',
      '.sr-share{display:block;margin-top:2px;font-size:10px;line-height:1.2;color:var(--dsw-alias-state-idle-primary);white-space:nowrap;}',
      '.sr-empty{flex:1 1 auto;min-height:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:9px;padding:32px 20px;text-align:center;}',
      '.sr-emptyGlyph{color:var(--dsw-alias-label-secondary);opacity:0.25;}',
      '.sr-emptyTitle{font-size:13px;color:var(--dsw-alias-label-secondary);}',
      '.sr-emptyHint{font-size:11.5px;line-height:1.6;color:var(--dsw-alias-state-idle-primary);max-width:320px;}',
      '.sr-emptyBtn{margin-top:2px;height:26px;padding:0 11px;border-radius:7px;border:1px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:11.5px;cursor:pointer;}',
      '.sr-emptyBtn:hover{color:var(--dsw-alias-label-primary);}',
      '.sr-foot{display:flex;align-items:center;gap:6px;flex:none;font-size:10px;line-height:1.45;color:var(--dsw-alias-label-secondary);opacity:0.72;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
      '.sr-footDot{flex:none;opacity:0.5;}',
      '@media (max-width:720px){.sr-kpis{grid-template-columns:1fr 1fr;}.sr-kpi:nth-child(3){border-left:0;border-top:1px solid var(--dsw-alias-border-l1);}.sr-kpi:nth-child(4){border-top:1px solid var(--dsw-alias-border-l1);}.sr-sub{display:none;}.sr-row{grid-template-columns:22px minmax(0,1fr) 82px;}.sr-dateBox{min-width:96px;}}',
      '@media (prefers-reduced-motion:reduce){.sr-dayBar,.sr-row{transition:none;}}'
    ].join('\n')

    const EMPTY_LIST = { ids: [], byId: {}, phase: 'pending', projectionsBySession: {} }
    const EMPTY_WORKSPACES = { items: [] }

    /** Read an optional client service without failing plugin activation. */
    function optional(ctx, name) {
      try {
        const service = ctx.get(name)
        return service === undefined ? undefined : service
      } catch (error) {
        return undefined
      }
    }

    /** Subscribe to a SnapshotStore; re-render on every published change. */
    function useSnapshot(store, fallback) {
      const [snapshot, setSnapshot] = React.useState(function () {
        return store && typeof store.getSnapshot === 'function' ? store.getSnapshot() : fallback
      })
      React.useEffect(function () {
        if (!store) return undefined
        const read = function () { setSnapshot(store.getSnapshot()) }
        read()
        return store.subscribe(read)
      }, [store])
      return snapshot
    }

    /** Re-render on a fixed cadence while the panel is mounted. */
    function useTick(ms) {
      const [, setVersion] = React.useState(0)
      React.useEffect(function () {
        const timer = window.setInterval(function () { setVersion(function (value) { return value + 1 }) }, ms)
        return function () { window.clearInterval(timer) }
      }, [ms])
    }

    function pad2(value) { return value < 10 ? '0' + value : String(value) }

    /** Local calendar key, matching the day buckets dsh-context folds. */
    function dayKeyOf(date) {
      return date.getFullYear() + '-' + pad2(date.getMonth() + 1) + '-' + pad2(date.getDate())
    }

    function parseDayKey(key) {
      const parts = String(key).split('-')
      return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
    }

    function addDays(key, delta) {
      const date = parseDayKey(key)
      date.setDate(date.getDate() + delta)
      return dayKeyOf(date)
    }

    const WEEKDAYS = ['\u5468\u65e5', '\u5468\u4e00', '\u5468\u4e8c', '\u5468\u4e09', '\u5468\u56db', '\u5468\u4e94', '\u5468\u516d']

    function weekdayOf(key) {
      return WEEKDAYS[parseDayKey(key).getDay()]
    }

    function dayTitle(key) {
      const date = parseDayKey(key)
      return (date.getMonth() + 1) + '\u6708' + date.getDate() + '\u65e5'
    }

    function dayNumber(key) {
      return parseDayKey(key).getDate()
    }

    /** Last path segment of a POSIX or Windows directory path. */
    function baseName(path) {
      if (typeof path !== 'string' || path === '') return ''
      const parts = path.split(/[\\/]+/).filter(function (part) { return part !== '' })
      return parts.length === 0 ? path : parts[parts.length - 1]
    }

    function workspaceTitles(snapshot) {
      const map = {}
      const items = snapshot && Array.isArray(snapshot.items) ? snapshot.items : []
      for (const item of items) {
        if (item && typeof item.path === 'string') map[item.path] = typeof item.title === 'string' ? item.title : ''
      }
      return map
    }

    function toNumber(value) {
      return typeof value === 'number' && isFinite(value) ? value : 0
    }

    /** Rate row for a provider/model pair, tolerating `provider/model` ids. */
    function ratesOf(model) {
      const id = String(model || '').toLowerCase()
      if (Object.prototype.hasOwnProperty.call(MODEL_PRICES, id)) return MODEL_PRICES[id]
      const tail = id.split('/').pop()
      if (tail && Object.prototype.hasOwnProperty.call(MODEL_PRICES, tail)) return MODEL_PRICES[tail]
      return null
    }

    function isDeepseek(provider) {
      return String(provider || '').toLowerCase().indexOf('deepseek') !== -1
    }

    /**
     * Turn dsh-context's billed-token buckets into USD.
     * DeepSeek bills its peak windows at twice the models.dev list rate.
     */
    function costOfBuckets(cost) {
      let usd = 0
      let tokens = 0
      let pricedTokens = 0
      const models = []
      let priced = false
      if (!cost || typeof cost !== 'object') return { usd: null, tokens: tokens, pricedTokens: pricedTokens, models: models }
      for (const provider of Object.keys(cost)) {
        const byModel = cost[provider]
        if (!byModel || typeof byModel !== 'object') continue
        for (const model of Object.keys(byModel)) {
          const entry = byModel[model]
          if (!entry || typeof entry !== 'object') continue
          const rates = ratesOf(model)
          if (models.indexOf(model) === -1) models.push(model)
          for (const bucket of ['peak', 'off']) {
            const totals = entry[bucket]
            if (!totals || typeof totals !== 'object') continue
            const uncached = toNumber(totals.uncached)
            const cacheRead = toNumber(totals.cacheRead)
            const cacheWrite = toNumber(totals.cacheWrite)
            const output = toNumber(totals.output)
            const bucketTokens = uncached + cacheRead + cacheWrite + output
            tokens += bucketTokens
            if (!rates) continue
            priced = true
            pricedTokens += bucketTokens
            const factor = bucket === 'peak' && isDeepseek(provider) ? 2 : 1
            usd += factor * (
              uncached * rates.input +
              cacheRead * rates.cacheRead +
              cacheWrite * rates.cacheWrite +
              output * rates.output
            ) / 1e6
          }
        }
      }
      return { usd: priced ? usd : null, tokens: tokens, pricedTokens: pricedTokens, models: models }
    }

    /** One session's activity folded for one day. */
    function statsOfDay(day) {
      if (!day || typeof day !== 'object') return null
      const buckets = costOfBuckets(day.cost)
      const tokens = Math.max(toNumber(day.tokens), buckets.tokens)
      return {
        costUsd: buckets.usd,
        tokens: tokens,
        pricedTokens: buckets.pricedTokens,
        requests: toNumber(day.requests),
        turns: toNumber(day.turns),
        models: buckets.models
      }
    }

    /** Projection values, whichever shape the session catalog exposes. */
    function valuesOf(snapshot, id) {
      const row = snapshot && snapshot.byId ? snapshot.byId[id] : undefined
      if (row && row.projectionValues && typeof row.projectionValues === 'object') return row.projectionValues
      const projection = snapshot && snapshot.projectionsBySession ? snapshot.projectionsBySession[id] : undefined
      if (projection && projection.values && typeof projection.values === 'object') return projection.values
      if (row && row.projections && typeof row.projections === 'object') {
        return row.projections.values || row.projections
      }
      return undefined
    }

    /** Fold every session's per-day activity once per catalog snapshot. */
    function buildModel(snapshot) {
      const byId = snapshot && snapshot.byId ? snapshot.byId : {}
      const rows = []
      const dayTotals = {}
      const allDays = Object.create(null)
      for (const id of Object.keys(byId)) {
        const row = byId[id]
        if (!row || row.blank === true) continue
        const values = valuesOf(snapshot, id)
        const activity = values && values.contextActivity
        const days = activity && activity.days
        if (!days || typeof days !== 'object') continue
        const keys = Object.keys(days)
        if (keys.length === 0) continue
        const stats = {}
        for (const key of keys) {
          const dayStats = statsOfDay(days[key])
          if (!dayStats) continue
          stats[key] = dayStats
          allDays[key] = true
          const total = dayTotals[key] || (dayTotals[key] = { costUsd: 0, tokens: 0, requests: 0, sessions: 0, priced: 0, unpriced: 0, models: [] })
          total.tokens += dayStats.tokens
          total.requests += dayStats.requests
          total.sessions += 1
          if (dayStats.costUsd === null) total.unpriced += 1
          else {
            total.costUsd += dayStats.costUsd
            total.priced += 1
          }
          for (const model of dayStats.models) {
            if (total.models.indexOf(model) === -1) total.models.push(model)
          }
        }
        rows.push({ id: id, row: row, stats: stats })
      }
      const rowById = {}
      for (const entry of rows) rowById[entry.id] = entry
      const children = new Map()
      for (const entry of rows) {
        const parentId = entry.row.parentId
        if (entry.row.origin !== 'subagent' || typeof parentId !== 'string' || parentId === '') continue
        if (!Object.prototype.hasOwnProperty.call(rowById, parentId)) continue
        const list = children.get(parentId) || []
        list.push(entry)
        children.set(parentId, list)
      }
      const dates = Object.keys(allDays).sort()
      return {
        rows: rows,
        rowById: rowById,
        children: children,
        dates: dates,
        earliestDay: dates.length > 0 ? dates[0] : null,
        latestDay: dates.length > 0 ? dates[dates.length - 1] : null,
        dayTotals: dayTotals
      }
    }

    /** Group digits in the integer part. */
    function groupDigits(text) {
      return text.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    }

    /** CNY label for a USD amount, matching dsh-context's conversion. */
    function moneyText(usd) {
      if (typeof usd !== 'number' || !isFinite(usd)) return '\u2014'
      const value = usd * CNY_PER_USD
      if (!isFinite(value) || value <= 0) return YUAN + '0'
      if (value < 0.001) return '<' + YUAN + '0.001'
      if (value < 1) return YUAN + value.toFixed(3)
      return YUAN + groupDigits(value.toFixed(2))
    }

    function tokensText(count) {
      const value = toNumber(count)
      if (value <= 0) return '0'
      if (value >= 1e9) return (value / 1e9).toFixed(2) + 'B'
      if (value >= 1e6) return (value / 1e6).toFixed(2) + 'M'
      if (value >= 1e3) return (value / 1e3).toFixed(1) + 'K'
      return String(Math.round(value))
    }

    function countText(value) {
      const count = toNumber(value)
      return count >= 10000 ? groupDigits(String(Math.round(count))) : String(Math.round(count))
    }

    function pctText(value) {
      if (!isFinite(value) || value <= 0) return '0%'
      if (value >= 10) return value.toFixed(1) + '%'
      if (value >= 1) return value.toFixed(2) + '%'
      return '<1%'
    }

    /** Short model label: drop the provider prefix, keep the family. */
    function modelText(model) {
      const id = String(model || '')
      const tail = id.split('/').pop() || id
      return tail
    }

    function SpendIcon(props) {
      const size = props && typeof props.size === 'number' ? props.size : 16
      return h('svg', {
        viewBox: '0 0 16 16',
        width: size,
        height: size,
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.4,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': 'true',
        'data-dsh-panel-entry': PANEL_ID
      },
        h('path', { key: 'base', d: 'M2.5 13.5h11' }),
        h('rect', { key: 'a', x: 3, y: 9, width: 2.6, height: 4.5, rx: 0.8, fill: 'currentColor', stroke: 'none' }),
        h('rect', { key: 'b', x: 6.8, y: 6.5, width: 2.6, height: 7, rx: 0.8, fill: 'currentColor', stroke: 'none', opacity: 0.72 }),
        h('rect', { key: 'c', x: 10.6, y: 3, width: 2.6, height: 10.5, rx: 0.8, fill: 'currentColor', stroke: 'none' })
      )
    }

    function apply(ctx) {
      const slots = ctx.slots
      if (!slots) return

      function enterSession(sessionId) {
        const layout = optional(ctx, 'layout')
        if (layout && typeof layout.selectPanel === 'function') {
          try { layout.selectPanel('conversation') } catch (error) { /* layout root not mounted yet */ }
        }
        const navigation = optional(ctx, 'uiWorkspace')
        if (navigation && typeof navigation.openSession === 'function') {
          try { navigation.openSession(sessionId) } catch (error) { /* unknown or archived id */ }
        }
      }

      function SpendPanel() {
        const sessions = optional(ctx, 'sessions')
        const list = sessions && sessions.list
        const snapshot = useSnapshot(list, EMPTY_LIST)
        const workspaces = optional(ctx, 'workspaces')
        const workspaceSnapshot = useSnapshot(workspaces && workspaces.list, EMPTY_WORKSPACES)
        const titles = workspaceTitles(workspaceSnapshot)
        useTick(TICK_MS)

        // Only sessions whose dsh-context activity projection has been folded
        // carry per-day cost. Cold sessions are folded on demand by
        // dsh-context's backfill route, so ask for it once and let the catalog
        // refresh while the fold runs in the background.
        React.useEffect(function () {
          const refresh = function () {
            try {
              const service = optional(ctx, 'sessions')
              if (service && typeof service.refresh === 'function') Promise.resolve(service.refresh()).catch(function () {})
            } catch (error) { /* catalog not ready */ }
          }
          try {
            fetch('/api/dsh-context/backfill', { method: 'POST', credentials: 'same-origin' }).catch(function () {})
          } catch (error) { /* route absent: keep the projections we already have */ }
          const firstRefresh = window.setTimeout(refresh, 4000)
          const poll = window.setInterval(refresh, 20000)
          const stop = window.setTimeout(function () { window.clearInterval(poll) }, 300000)
          return function () {
            window.clearTimeout(firstRefresh)
            window.clearInterval(poll)
            window.clearTimeout(stop)
          }
        }, [])

        const today = dayKeyOf(new Date())
        const model = React.useMemo(function () { return buildModel(snapshot) }, [snapshot])
        const [picked, setPicked] = React.useState(null)
        const [foldChildren, setFoldChildren] = React.useState(true)

        const latestDay = model.latestDay || today
        const selected = picked === null ? latestDay : picked
        const dayTotal = model.dayTotals[selected] || null
        const isToday = selected === today
        const earliest = model.earliestDay || today

        const stepDay = function (delta) {
          const next = addDays(selected, delta)
          if (next < earliest || next > today) return
          setPicked(next)
        }

        // Fold subagent sessions into their parent once per render.
        const totalsMemo = new Map()
        const totalsOf = function (entry, depth) {
          if (depth > 8) return null
          if (totalsMemo.has(entry.id)) return totalsMemo.get(entry.id)
          const own = entry.stats[selected]
          let costUsd = own ? own.costUsd : null
          let tokens = own ? own.tokens : 0
          let requests = own ? own.requests : 0
          let turns = own ? own.turns : 0
          const models = own ? own.models.slice() : []
          let unpriced = own ? (own.costUsd === null && own.tokens > 0) : false
          let childCount = 0
          let active = own !== undefined
          const kids = foldChildren ? (model.children.get(entry.id) || []) : []
          for (const kid of kids) {
            const sub = totalsOf(kid, depth + 1)
            if (!sub) continue
            active = true
            childCount += 1 + sub.childCount
            if (sub.costUsd !== null) costUsd = (costUsd === null ? 0 : costUsd) + sub.costUsd
            else if (sub.tokens > 0) unpriced = true
            tokens += sub.tokens
            requests += sub.requests
            turns += sub.turns
            for (const name of sub.models) if (models.indexOf(name) === -1) models.push(name)
          }
          if (!active) return null
          const result = {
            costUsd: costUsd,
            tokens: tokens,
            requests: requests,
            turns: turns,
            models: models,
            unpriced: unpriced,
            childCount: childCount
          }
          totalsMemo.set(entry.id, result)
          return result
        }

        const entries = []
        for (const entry of model.rows) {
          if (foldChildren) {
            const parentId = entry.row.parentId
            if (entry.row.origin === 'subagent' && typeof parentId === 'string' && model.rowById[parentId]) continue
          }
          const totals = totalsOf(entry, 0)
          if (!totals) continue
          if (totals.tokens === 0 && totals.requests === 0) continue
          entries.push({ entry: entry, totals: totals })
        }
        entries.sort(function (a, b) {
          const delta = (b.totals.costUsd || 0) - (a.totals.costUsd || 0)
          if (delta !== 0) return delta
          return b.totals.tokens - a.totals.tokens
        })

        const displayedCost = entries.reduce(function (sum, item) {
          return sum + (item.totals.costUsd || 0)
        }, 0)
        const displayedPriced = entries.filter(function (item) { return item.totals.costUsd !== null }).length
        const displayedUnpriced = entries.filter(function (item) { return item.totals.unpriced === true }).length
        const topCost = entries.length > 0 ? Math.max(0, entries[0].totals.costUsd || 0) : 0

        // Window of days drawn in the strip: always ends at today unless the
        // picked day is older than the window.
        const stripStart = addDays(today, -(STRIP_DAYS - 1))
        const stripEnd = selected < stripStart ? selected : today
        const stripDays = []
        for (let index = STRIP_DAYS - 1; index >= 0; index -= 1) stripDays.push(addDays(stripEnd, -index))
        let stripMax = 0
        for (const key of stripDays) {
          const total = model.dayTotals[key]
          if (total && total.costUsd > stripMax) stripMax = total.costUsd
        }

        const dayBars = stripDays.map(function (key) {
          const total = model.dayTotals[key]
          const cost = total ? total.costUsd : 0
          const on = key === selected
          const hasData = !!total
          // A single outlier day can be 100x a normal day; a log scale keeps the
          // small days readable while the tall bars still rank correctly.
          const norm = stripMax > 0 ? Math.log1p(cost) / Math.log1p(stripMax) : 0
          const height = cost <= 0 ? (on ? 6 : 3) : Math.max(on ? 12 : 5, Math.round(4 + norm * 34))
          return h('button', {
            key: key,
            type: 'button',
            className: 'sr-day' + (on ? ' sr-day--on' : '') + (hasData ? '' : ' sr-day--empty'),
            title: dayTitle(key) + ' ' + weekdayOf(key) + ' \u00b7 ' + (hasData ? moneyText(cost) : '\u65e0\u7528\u91cf'),
            'aria-label': dayTitle(key) + ' ' + (hasData ? moneyText(cost) : '\u65e0\u7528\u91cf'),
            'aria-pressed': on,
            onClick: function () { setPicked(key) }
          },
            h('span', { className: 'sr-dayBar', style: { height: height + 'px' } }),
            h('span', { className: 'sr-dayLab' }, String(dayNumber(key)))
          )
        })

        const kpis = h('div', { className: 'sr-kpis' },
          h('div', { key: 'cost', className: 'sr-kpi sr-kpi--total' },
            h('div', { className: 'sr-kpiLab' }, '\u5f53\u5929\u82b1\u8d39'),
            h('div', { className: 'sr-kpiVal' },
              moneyText(displayedCost),
              entries.length > 0 ? h('small', null, displayedPriced + '/' + entries.length + ' \u5df2\u8ba1\u4ef7') : null
            )
          ),
          h('div', { key: 'sessions', className: 'sr-kpi' },
            h('div', { className: 'sr-kpiLab' }, '\u4f1a\u8bdd'),
            h('div', { className: 'sr-kpiVal' }, String(entries.length))
          ),
          h('div', { key: 'tokens', className: 'sr-kpi' },
            h('div', { className: 'sr-kpiLab' }, 'Token\uff08\u8ba1\u8d39\uff09'),
            h('div', { className: 'sr-kpiVal' }, tokensText(dayTotal ? dayTotal.tokens : 0))
          ),
          h('div', { key: 'requests', className: 'sr-kpi' },
            h('div', { className: 'sr-kpiLab' }, '\u8bf7\u6c42'),
            h('div', { className: 'sr-kpiVal' }, countText(dayTotal ? dayTotal.requests : 0))
          )
        )

        const rows = entries.map(function (item, index) {
          const entry = item.entry
          const totals = item.totals
          const row = entry.row
          const title = row.displayTitle || row.title || row.id
          const project = titles[row.cwd] || baseName(row.cwd)
          const share = displayedCost > 0 && totals.costUsd ? (totals.costUsd / displayedCost) * 100 : 0
          const width = topCost > 0 ? Math.max(2, Math.round(((totals.costUsd || 0) / topCost) * 100)) : 0
          const meta = []
          if (project) meta.push(h('span', { key: 'project', className: 'sr-metaText' }, project))
          const models = totals.models.slice(0, 2)
          for (let i = 0; i < models.length; i += 1) {
            if (meta.length > 0) meta.push(h('span', { key: 'sep-m' + i, className: 'sr-sep' }, '\u00b7'))
            meta.push(h('span', { key: 'model' + i, className: 'sr-metaText' }, modelText(models[i])))
          }
          if (totals.requests > 0) {
            if (meta.length > 0) meta.push(h('span', { key: 'sep-r', className: 'sr-sep' }, '\u00b7'))
            meta.push(h('span', { key: 'req', className: 'sr-metaText' }, totals.requests + ' \u6b21\u8bf7\u6c42'))
          }
          if (totals.tokens > 0) {
            if (meta.length > 0) meta.push(h('span', { key: 'sep-t', className: 'sr-sep' }, '\u00b7'))
            meta.push(h('span', { key: 'tok', className: 'sr-metaText' }, tokensText(totals.tokens) + ' tokens'))
          }
          const tags = []
          if (totals.childCount > 0) tags.push(h('span', { key: 'child', className: 'sr-tag' }, '\u542b\u5b50\u4ee3\u7406 ' + totals.childCount))
          if (totals.costUsd === null && totals.tokens > 0) tags.push(h('span', { key: 'unpriced', className: 'sr-tag sr-tag--warn' }, '\u672a\u8ba1\u4ef7'))
          else if (totals.unpriced) tags.push(h('span', { key: 'partial', className: 'sr-tag' }, '\u90e8\u5206\u672a\u8ba1\u4ef7'))

          return h('button', {
            key: entry.id,
            type: 'button',
            className: 'sr-row' + (index < 3 ? ' sr-row--' + (index + 1) : ''),
            title: title + ' \u00b7 ' + (row.cwd || ''),
            onClick: function () { enterSession(entry.id) }
          },
            h('span', { className: 'sr-rank' }, String(index + 1)),
            h('span', { className: 'sr-rowMain' },
              h('span', { className: 'sr-rowTitle' }, title),
              h('span', { className: 'sr-meta' }, meta.length > 0 ? meta : null, tags.length > 0 ? tags : null),
              h('span', { className: 'sr-bar' }, h('i', { style: { width: width + '%' } }))
            ),
            h('span', { className: 'sr-money' },
              h('span', { className: 'sr-amount' }, totals.costUsd === null ? '\u2014' : (totals.unpriced ? '\u2248' : '') + moneyText(totals.costUsd)),
              h('span', { className: 'sr-share' }, share > 0 ? pctText(share) : (totals.tokens > 0 ? tokensText(totals.tokens) : '\u2014'))
            )
          )
        })

        const catalogSize = snapshot && snapshot.byId ? Object.keys(snapshot.byId).length : 0
        const pendingCatalog = snapshot && snapshot.phase === 'pending'
        const noActivity = !pendingCatalog && catalogSize > 0 && model.rows.length === 0
        const emptyState = h('div', { className: 'sr-empty' },
          h('div', { className: 'sr-emptyGlyph' },
            h('svg', { width: 34, height: 34, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1, strokeLinecap: 'round', 'aria-hidden': 'true' },
              h('path', { d: 'M2.5 13.5h11' }),
              h('rect', { x: 3.2, y: 9.4, width: 2.2, height: 4, rx: 0.6 }),
              h('rect', { x: 6.9, y: 7, width: 2.2, height: 6.4, rx: 0.6 }),
              h('rect', { x: 10.6, y: 4.2, width: 2.2, height: 9.2, rx: 0.6 })
            )
          ),
          h('div', { className: 'sr-emptyTitle' }, pendingCatalog
            ? '\u6b63\u5728\u8bfb\u53d6\u4f1a\u8bdd\u7528\u91cf\u2026'
            : (noActivity ? '\u6ca1\u6709\u8bfb\u5230\u6bcf\u65e5\u82b1\u8d39\u6570\u636e' : '\u8fd9\u4e00\u5929\u6ca1\u6709\u4f1a\u8bdd\u82b1\u8d39')),
          h('div', { className: 'sr-emptyHint' }, pendingCatalog
            ? '\u4f1a\u8bdd\u76ee\u5f55\u52a0\u8f7d\u5b8c\u6210\u540e\uff0c\u8fd9\u91cc\u4f1a\u6309\u5f53\u5929\u82b1\u8d39\u4ece\u9ad8\u5230\u4f4e\u6392\u5e8f\u3002'
            : (noActivity
              ? '\u6bcf\u65e5\u82b1\u8d39\u6765\u81ea dsh-context \u7684 contextActivity \u6295\u5f71\u3002\u786e\u8ba4\u5df2\u5b89\u88c5 dsh-context\uff0c\u6216\u7b49\u4e00\u4f1a\u513f\u56de\u586b\u5b8c\u6210\u540e\u518d\u770b\u3002'
              : '\u70b9\u4e0a\u65b9\u65f6\u95f4\u7ebf\u4e0a\u7684\u67f1\u5b50\u6362\u4e00\u5929\uff0c\u6216\u8005\u70b9\u53f3\u4e0a\u89d2\u7684\u300c\u4eca\u5929\u300d\u3002\u4ece\u672a\u6253\u5f00\u8fc7\u7684\u5386\u53f2\u4f1a\u8bdd\u4f1a\u5728\u56de\u586b\u5b8c\u6210\u540e\u51fa\u73b0\u3002')),
          model.latestDay && selected !== model.latestDay
            ? h('button', { type: 'button', className: 'sr-emptyBtn', onClick: function () { setPicked(model.latestDay) } },
                '\u56de\u5230\u6700\u8fd1\u6709\u6570\u636e\u7684 ' + dayTitle(model.latestDay))
            : null
        )

        const listBody = entries.length > 0
          ? h('div', { className: 'sr-rows' }, rows)
          : emptyState

        return h('div', { className: 'sr-root', 'data-dsh-plugin': PANEL_ID },
          h('style', null, STYLE),
          h('div', { className: 'sr-head' },
            h('span', { className: 'sr-brand' },
              h('svg', { width: 17, height: 17, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.3, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': 'true' },
                h('path', { d: 'M2.5 13.5h11' }),
                h('path', { d: 'M4 10.5v2.4M8 7v5.9M12 3.2v9.7' })
              )
            ),
            h('div', { className: 'sr-headText' },
              h('div', { className: 'sr-title' }, '\u6bcf\u65e5\u82b1\u8d39\u6392\u884c'),
              h('div', { className: 'sr-sub' }, '\u6bcf\u5929\u7528\u4e86\u54ea\u4e9b\u4f1a\u8bdd\uff0c\u5404\u82b1\u4e86\u591a\u5c11\u94b1')
            ),
            h('div', { className: 'sr-controls' },
              h('div', { className: 'sr-navGroup' },
                h('button', {
                  type: 'button',
                  className: 'sr-nav',
                  title: '\u524d\u4e00\u5929',
                  'aria-label': '\u524d\u4e00\u5929',
                  disabled: selected <= earliest,
                  onClick: function () { stepDay(-1) }
                }, '\u2039'),
                h('div', { className: 'sr-dateBox' },
                  h('span', { className: 'sr-dateText' }, dayTitle(selected)),
                  h('span', { className: 'sr-dateSub' }, weekdayOf(selected) + (isToday ? ' \u00b7 \u4eca\u5929' : ''))
                ),
                h('button', {
                  type: 'button',
                  className: 'sr-nav',
                  title: '\u540e\u4e00\u5929',
                  'aria-label': '\u540e\u4e00\u5929',
                  disabled: selected >= today,
                  onClick: function () { stepDay(1) }
                }, '\u203a')
              ),
              h('button', {
                type: 'button',
                className: 'sr-todayBtn',
                disabled: isToday,
                onClick: function () { setPicked(today) }
              }, '\u4eca\u5929'),
              h('button', {
                type: 'button',
                className: 'sr-fold' + (foldChildren ? ' sr-foldOn' : ''),
                title: '\u5c06\u5b50\u667a\u80fd\u4f53\u4f1a\u8bdd\u7684\u82b1\u8d39\u5408\u5e76\u8fdb\u5b83\u4eec\u7684\u4e3b\u4f1a\u8bdd',
                'aria-pressed': foldChildren,
                onClick: function () { setFoldChildren(function (value) { return !value }) }
              },
                h('i'),
                '\u542b\u5b50\u4ee3\u7406'
              )
            )
          ),
          h('div', { className: 'sr-strip' }, dayBars),
          kpis,
          h('div', { className: 'sr-list' },
            h('div', { className: 'sr-listHead' },
              h('span', { className: 'sr-listTitle' }, '\u4f1a\u8bdd\u6392\u884c'),
              h('span', { className: 'sr-listMeta' }, entries.length > 0 ? entries.length + ' \u4e2a\u4f1a\u8bdd \u00b7 \u6309\u82b1\u8d39\u964d\u5e8f' : '\u6682\u65e0\u6570\u636e')
            ),
            listBody
          ),
          h('div', { className: 'sr-foot' },
            h('span', null, '\u8d39\u7528\u6309 models.dev \u6302\u724c\u4ef7\u4f30\u7b97\uff1bDeepSeek \u5cf0\u65f6\uff08\u5de5\u4f5c\u65e5 9\u201312 / 14\u201318 \u70b9\uff09\u00d72'),
            h('span', { className: 'sr-footDot' }, '\u00b7'),
            h('span', null, '\u00a51 = $0.15'),
            displayedUnpriced > 0 ? h('span', { className: 'sr-footDot' }, '\u00b7') : null,
            displayedUnpriced > 0 ? h('span', null, displayedUnpriced + ' \u4e2a\u4f1a\u8bdd\u542b\u672a\u6536\u5f55\u6a21\u578b\uff0c\u672a\u8ba1\u4ef7\u90e8\u5206\u4e0d\u8ba1\u5165\u5408\u8ba1') : null
          )
        )
      }

      const disposers = []
      const add = function (disposer) { if (typeof disposer === 'function') disposers.push(disposer) }

      add(slots.inject('sidebar.panellist', function () {
        return slots.register({
          name: 'sidebar.panellist',
          id: PANEL_ID,
          order: PANEL_ORDER,
          label: function () { return '\u82b1\u8d39\u6392\u884c' }
        }, SpendIcon)
      }))

      add(slots.inject('main', function () {
        return slots.register({ name: 'main', key: PANEL_ID }, SpendPanel)
      }))

      ctx.effect(function () {
        if (typeof window === 'undefined') return undefined
        if (window.location.hash !== '#spend-rank') return undefined
        const timers = [200, 900, 2000, 3500].map(function (delay) {
          return window.setTimeout(function () {
            const layout = optional(ctx, 'layout')
            if (layout && typeof layout.selectPanel === 'function') {
              try { layout.selectPanel(PANEL_ID) } catch (error) { /* layout root not mounted yet */ }
            }
          }, delay)
        })
        return function () { for (const timer of timers) window.clearTimeout(timer) }
      }, 'spend-rank: deep link')

      ctx.effect(function () {
        return function () {
          for (const dispose of disposers.splice(0)) {
            try { dispose() } catch (error) { /* already disposed by the slot owner */ }
          }
        }
      }, 'spend-rank: slots')
    }

    return { inject: ['slots'], apply: apply }
  }
})
