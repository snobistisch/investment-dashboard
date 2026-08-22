import type { EquityChartSeries, MarketQuote } from '../../data/market-data'
import { money, signedPct } from './format'

function path(values: (number | null)[], min: number, max: number, width: number, height: number) {
  const span = Math.max(max - min, 1e-9)
  let output = ''
  let drawing = false
  values.forEach((value, index) => {
    if (value === null || !Number.isFinite(value)) {
      drawing = false
      return
    }
    const x = values.length === 1 ? 0 : index / (values.length - 1) * width
    const y = height - (value - min) / span * height
    output += `${drawing ? 'L' : 'M'}${x.toFixed(2)},${y.toFixed(2)} `
    drawing = true
  })
  return output.trim()
}

export function EquityPriceChart({
  ticker,
  series,
  quote,
  compact = false,
}: {
  ticker: string
  series?: EquityChartSeries
  quote?: MarketQuote
  compact?: boolean
}) {
  const points = series?.points ?? []
  if (points.length < 2) {
    return <div className="flex min-h-28 items-center justify-center border border-term-line bg-term-bg p-3 text-[10px] uppercase tracking-wider text-term-dim">No chart history for {ticker}</div>
  }
  const closes = points.map((point) => point[1])
  const averages = points.map((point) => point[2])
  const finite = [...closes, ...averages.filter((value): value is number => value !== null)]
  const rawMin = Math.min(...finite)
  const rawMax = Math.max(...finite)
  const padding = Math.max((rawMax - rawMin) * 0.08, rawMax * 0.01)
  const min = Math.max(0, rawMin - padding)
  const max = rawMax + padding
  const width = 800
  const height = compact ? 150 : 240
  const closePath = path(closes, min, max, width, height)
  const averagePath = path(averages, min, max, width, height)
  const trend = quote?.trend200
  const tone = trend?.above ? 'text-term-green' : trend ? 'text-term-red' : 'text-term-yellow'
  const start = points[0][0]
  const end = points[points.length - 1][0]

  return (
    <figure className="border border-term-line bg-term-bg p-2" aria-label={`${ticker} daily close with 200-day moving average`}>
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2 text-[10px]">
        <span className="font-bold text-term-amber">{ticker} · {money(closes[closes.length - 1], series?.currency ?? quote?.currency ?? 'USD')}</span>
        <span className={tone}>
          {trend ? `${trend.above ? 'ABOVE' : 'BELOW'} 200MA · ${signedPct(trend.distancePct)}` : '200MA NOT YET AVAILABLE'}
        </span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className={`w-full ${compact ? 'h-28' : 'h-48 sm:h-60'}`} role="img" aria-label={`${ticker} close from ${start} to ${end}; 200MA ${trend ? trend.ma200.toFixed(2) : 'unavailable'}`}>
        {[0.25, 0.5, 0.75].map((fraction) => <line key={fraction} x1="0" x2={width} y1={height * fraction} y2={height * fraction} stroke="currentColor" className="text-term-line" strokeWidth="1" />)}
        {averagePath && <path d={averagePath} fill="none" stroke="currentColor" className="text-term-cyan" strokeWidth={compact ? 4 : 3} vectorEffect="non-scaling-stroke" />}
        <path d={closePath} fill="none" stroke="currentColor" className="text-term-amber" strokeWidth={compact ? 2 : 1.75} vectorEffect="non-scaling-stroke" />
      </svg>
      <figcaption className="mt-1 flex justify-between gap-3 text-[9px] uppercase tracking-wider text-term-dim">
        <span>{start}</span>
        <span><span className="text-term-amber">Close</span> · <span className="text-term-cyan">200MA</span></span>
        <span>{end}</span>
      </figcaption>
    </figure>
  )
}

