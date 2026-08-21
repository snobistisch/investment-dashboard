export const OPPORTUNITY_SHORTLIST_KEY = 'equity-opportunity-shortlist-v1'

export interface OpportunityShortlistItem {
  ticker: string
  company: string
  modelVersion: string
  reviewedAt: string
}
export function readOpportunityShortlist(): OpportunityShortlistItem[] {
  try {
    const stored = window.sessionStorage.getItem(OPPORTUNITY_SHORTLIST_KEY)
    if (!stored) return []
    const parsed = JSON.parse(stored) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item): item is OpportunityShortlistItem => {
      if (!item || typeof item !== 'object') return false
      const row = item as Record<string, unknown>
      return ['ticker', 'company', 'modelVersion', 'reviewedAt'].every((key) => typeof row[key] === 'string')
    })
  } catch {
    return []
  }
}

export function writeOpportunityShortlist(items: OpportunityShortlistItem[]) {
  window.sessionStorage.setItem(OPPORTUNITY_SHORTLIST_KEY, JSON.stringify(items))
}

export function clearOpportunityShortlist() {
  window.sessionStorage.removeItem(OPPORTUNITY_SHORTLIST_KEY)
}
