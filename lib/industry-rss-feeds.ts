/**
 * Industry-specific RSS feed mapping
 * Auto-populates relevant RSS feeds based on user's industry
 */

export interface IndustryRssFeed {
  url: string
  name: string
}

export const INDUSTRY_RSS_FEEDS: Record<string, IndustryRssFeed[]> = {
  // Financial Services
  'financial services': [
    { url: 'https://www.fca.org.uk/news/rss.xml', name: 'FCA Publications' },
    { url: 'https://www.banking.co.uk/news/feed', name: 'Banking News UK' },
    { url: 'https://www.leasinglife.com/feed', name: 'Leasing Life' },
    { url: 'https://assetfinanceconnect.com/feed', name: 'Asset Finance Connect' },
  ],
  
  // Leasing / Asset Finance
  'leasing': [
    { url: 'https://www.leasinglife.com/feed', name: 'Leasing Life' },
    { url: 'https://assetfinanceconnect.com/feed', name: 'Asset Finance Connect' },
    { url: 'https://www.fca.org.uk/news/rss.xml', name: 'FCA Publications' },
  ],
  
  'asset finance': [
    { url: 'https://assetfinanceconnect.com/feed', name: 'Asset Finance Connect' },
    { url: 'https://www.leasinglife.com/feed', name: 'Leasing Life' },
    { url: 'https://www.fca.org.uk/news/rss.xml', name: 'FCA Publications' },
  ],
  
  // Legal Services
  'legal services': [
    { url: 'https://www.lawgazette.co.uk/rss', name: 'Law Gazette' },
    { url: 'https://www.thelawyer.com/feed/', name: 'The Lawyer' },
    { url: 'https://www.legalfutures.co.uk/feed', name: 'Legal Futures' },
  ],
  
  'law': [
    { url: 'https://www.lawgazette.co.uk/rss', name: 'Law Gazette' },
    { url: 'https://www.thelawyer.com/feed/', name: 'The Lawyer' },
    { url: 'https://www.legalfutures.co.uk/feed', name: 'Legal Futures' },
  ],
  
  // Healthcare
  'healthcare': [
    { url: 'https://www.hsj.co.uk/rss.xml', name: 'Health Service Journal' },
    { url: 'https://www.pulsetoday.co.uk/feed/', name: 'Pulse Today' },
    { url: 'https://www.digitalhealth.net/feed/', name: 'Digital Health' },
  ],
  
  // Technology / IT
  'technology': [
    { url: 'https://techcrunch.com/feed/', name: 'TechCrunch' },
    { url: 'https://www.wired.co.uk/rss', name: 'Wired UK' },
    { url: 'https://www.theregister.com/headlines.atom', name: 'The Register' },
  ],
  
  'it services': [
    { url: 'https://www.computerweekly.com/rss/All-Computer-Weekly-content.xml', name: 'Computer Weekly' },
    { url: 'https://www.theregister.com/headlines.atom', name: 'The Register' },
    { url: 'https://www.itpro.co.uk/rss', name: 'IT Pro' },
  ],
  
  // Marketing / Digital Marketing
  'marketing': [
    { url: 'https://www.marketingweek.com/feed/', name: 'Marketing Week' },
    { url: 'https://www.thedrum.com/rss/news', name: 'The Drum' },
    { url: 'https://searchengineland.com/feed', name: 'Search Engine Land' },
  ],
  
  'digital marketing': [
    { url: 'https://searchengineland.com/feed', name: 'Search Engine Land' },
    { url: 'https://www.marketingweek.com/feed/', name: 'Marketing Week' },
    { url: 'https://www.thedrum.com/rss/news', name: 'The Drum' },
  ],
  
  // Real Estate / Property
  'real estate': [
    { url: 'https://www.propertyweek.com/rss', name: 'Property Week' },
    { url: 'https://www.estateagenttoday.co.uk/feed/', name: 'Estate Agent Today' },
    { url: 'https://www.propertyindustryeye.com/feed/', name: 'Property Industry Eye' },
  ],
  
  'property': [
    { url: 'https://www.propertyweek.com/rss', name: 'Property Week' },
    { url: 'https://www.estateagenttoday.co.uk/feed/', name: 'Estate Agent Today' },
    { url: 'https://www.propertyindustryeye.com/feed/', name: 'Property Industry Eye' },
  ],
  
  // Hospitality / Food & Beverage
  'hospitality': [
    { url: 'https://www.caterersearch.com/rss', name: 'Caterer & Hotelkeeper' },
    { url: 'https://www.bighospitality.co.uk/RSS/RSS-Feed/News', name: 'BigHospitality' },
    { url: 'https://www.morningadvertiser.co.uk/rss', name: 'Morning Advertiser' },
  ],
  
  'restaurant': [
    { url: 'https://www.bighospitality.co.uk/RSS/RSS-Feed/News', name: 'BigHospitality' },
    { url: 'https://www.caterersearch.com/rss', name: 'Caterer & Hotelkeeper' },
  ],
  
  // Retail
  'retail': [
    { url: 'https://www.retailgazette.co.uk/feed/', name: 'Retail Gazette' },
    { url: 'https://www.retailtimes.co.uk/feed/', name: 'Retail Times' },
    { url: 'https://www.insideretail.co.uk/feed/', name: 'Inside Retail' },
  ],
  
  // Construction
  'construction': [
    { url: 'https://www.constructionnews.co.uk/rss', name: 'Construction News' },
    { url: 'https://www.building.co.uk/rss', name: 'Building Magazine' },
    { url: 'https://www.constructionenquirer.com/feed/', name: 'Construction Enquirer' },
  ],
  
  // Automotive
  'automotive': [
    { url: 'https://www.am-online.com/rss', name: 'AM Online' },
    { url: 'https://www.autoexpress.co.uk/feed', name: 'Auto Express' },
    { url: 'https://independentgarageassociation.co.uk/news/feed', name: 'Independent Garage Association' },
  ],
  
  // Accounting / Finance
  'accounting': [
    { url: 'https://www.accountancyage.com/feed/', name: 'Accountancy Age' },
    { url: 'https://www.accountingweb.co.uk/rss', name: 'AccountingWEB' },
    { url: 'https://www.icaew.com/rss', name: 'ICAEW' },
  ],
  
  // HR / Recruitment
  'hr': [
    { url: 'https://www.hrmagazine.co.uk/rss', name: 'HR Magazine' },
    { url: 'https://www.personneltoday.com/feed/', name: 'Personnel Today' },
    { url: 'https://www.cipd.co.uk/news/rss', name: 'CIPD' },
  ],
  
  'recruitment': [
    { url: 'https://www.recruiter.co.uk/feed', name: 'Recruiter' },
    { url: 'https://www.personneltoday.com/feed/', name: 'Personnel Today' },
  ],
  
  // Insurance
  'insurance': [
    { url: 'https://www.insurancetimes.co.uk/rss', name: 'Insurance Times' },
    { url: 'https://www.insuranceage.co.uk/rss', name: 'Insurance Age' },
    { url: 'https://www.postonline.co.uk/rss', name: 'Post Magazine' },
  ],
  
  // Manufacturing
  'manufacturing': [
    { url: 'https://www.themanufacturer.com/feed/', name: 'The Manufacturer' },
    { url: 'https://www.machinery.co.uk/feed/', name: 'Machinery' },
    { url: 'https://www.engineeringnews.co.uk/feed/', name: 'Engineering News' },
  ],
  
  // Education
  'education': [
    { url: 'https://www.tes.com/rss', name: 'TES' },
    { url: 'https://www.schoolsweek.co.uk/feed/', name: 'Schools Week' },
    { url: 'https://www.bera.ac.uk/feed', name: 'BERA' },
  ],
}

/**
 * Get RSS feeds for a given industry
 * Uses fuzzy matching to find the best match
 */
export function getRssFeedsForIndustry(industry: string): IndustryRssFeed[] {
  if (!industry) return []
  
  const normalizedIndustry = industry.toLowerCase().trim()
  
  // Exact match
  if (INDUSTRY_RSS_FEEDS[normalizedIndustry]) {
    return INDUSTRY_RSS_FEEDS[normalizedIndustry]
  }
  
  // Partial match - find the first key that contains the industry or vice versa
  for (const [key, feeds] of Object.entries(INDUSTRY_RSS_FEEDS)) {
    if (normalizedIndustry.includes(key) || key.includes(normalizedIndustry)) {
      return feeds
    }
  }
  
  // No match found
  return []
}

/**
 * Check if an industry has predefined RSS feeds
 */
export function hasRssFeedsForIndustry(industry: string): boolean {
  return getRssFeedsForIndustry(industry).length > 0
}
