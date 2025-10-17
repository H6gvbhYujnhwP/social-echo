export const PAINS: Record<string, string[]> = {
  default: [
    "Ransomware shuts a business down for 9 days on average.",
    "40% of SMEs never reopen after a major data loss.",
    "Unpaid invoices kill cashflow—most SMEs write off 3–5% annually.",
    "Manual workflows waste 1 day per employee per week.",
    "Lead response times over 5 minutes cut close rates by 80%.",
  ],
  it: [
    "Ransomware dwell time now averages 24–48 hours before detonation.",
    "Phishing accounts for 9 in 10 breaches in SMBs.",
  ],
  finance: [
    "Late payments now sit at a 4-year high for UK SMEs.",
    "Interest creep adds tens of thousands over a 5-year term.",
  ]
}

export function pickPain(industry: string): string {
  const key = /it|software|tech/i.test(industry) ? 'it'
    : /finance|lending|broker/i.test(industry) ? 'finance'
    : 'default'
  const list = PAINS[key]
  return list[Math.floor(Math.random() * list.length)]
}
