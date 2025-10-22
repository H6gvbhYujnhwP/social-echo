/**
 * Random Data - Observances, Facts, Pop Culture, History
 * 
 * Provides interesting content sources for "Random / Fun Facts" post type.
 * Includes country-specific observances and globally relevant content.
 */

export type RandomSource = {
  title: string
  blurb: string
  tags: string[]
}

/**
 * World observances (globally relevant)
 */
const WORLD_OBSERVANCES: RandomSource[] = [
  {
    title: 'World Productivity Day',
    blurb: 'Celebrated globally to promote efficiency and time management in the workplace.',
    tags: ['productivity', 'workplace', 'efficiency']
  },
  {
    title: 'International Coffee Day',
    blurb: 'A day to celebrate coffee culture and the people who grow, roast, and serve it.',
    tags: ['coffee', 'culture', 'business']
  },
  {
    title: 'World Creativity and Innovation Day',
    blurb: 'Encourages creative thinking and innovative problem-solving in all areas of life.',
    tags: ['creativity', 'innovation', 'business']
  },
  {
    title: 'International Day of Happiness',
    blurb: 'Recognizes the importance of happiness and well-being as universal goals.',
    tags: ['happiness', 'wellbeing', 'culture']
  },
  {
    title: 'World Entrepreneurs Day',
    blurb: 'Celebrates the spirit of entrepreneurship and small business innovation.',
    tags: ['entrepreneurship', 'business', 'innovation']
  },
  {
    title: 'International Day of Friendship',
    blurb: 'Promotes the role of friendships in fostering peace and building bridges between communities.',
    tags: ['friendship', 'networking', 'community']
  },
  {
    title: 'World Standards Day',
    blurb: 'Celebrates the importance of international standards in facilitating global trade.',
    tags: ['standards', 'quality', 'business']
  },
  {
    title: 'Global Entrepreneurship Week',
    blurb: 'A worldwide celebration of innovators and job creators who launch startups.',
    tags: ['entrepreneurship', 'startups', 'innovation']
  }
]

/**
 * UK-specific observances
 */
const UK_OBSERVANCES: RandomSource[] = [
  {
    title: 'National Tea Day (UK)',
    blurb: 'Celebrates Britain\'s favourite beverage and the culture surrounding it.',
    tags: ['tea', 'culture', 'UK']
  },
  {
    title: 'Small Business Saturday (UK)',
    blurb: 'Encourages consumers to shop locally and support small businesses across the UK.',
    tags: ['small business', 'retail', 'UK']
  },
  {
    title: 'National Customer Service Week (UK)',
    blurb: 'Recognizes the importance of customer service and the people who deliver it.',
    tags: ['customer service', 'business', 'UK']
  },
  {
    title: 'UK Cyber Security Week',
    blurb: 'Raises awareness about online safety and cybersecurity best practices.',
    tags: ['cybersecurity', 'technology', 'UK']
  }
]

/**
 * US-specific observances
 */
const US_OBSERVANCES: RandomSource[] = [
  {
    title: 'Small Business Saturday (US)',
    blurb: 'The Saturday after Thanksgiving, dedicated to supporting local small businesses.',
    tags: ['small business', 'retail', 'US']
  },
  {
    title: 'National Entrepreneurs Day (US)',
    blurb: 'Celebrates the innovators and risk-takers who drive the American economy.',
    tags: ['entrepreneurship', 'business', 'US']
  },
  {
    title: 'National Customer Service Week (US)',
    blurb: 'Honors customer service professionals and their contributions to business success.',
    tags: ['customer service', 'business', 'US']
  },
  {
    title: 'National Work from Home Day (US)',
    blurb: 'Recognizes the growing trend of remote work and its impact on productivity.',
    tags: ['remote work', 'productivity', 'US']
  }
]

/**
 * Science facts (evergreen, globally relevant)
 */
const SCIENCE_FACTS: RandomSource[] = [
  {
    title: 'The Zeigarnik Effect',
    blurb: 'People remember uncompleted or interrupted tasks better than completed ones - explaining why cliffhangers work.',
    tags: ['psychology', 'productivity', 'science']
  },
  {
    title: 'Parkinson\'s Law',
    blurb: 'Work expands to fill the time available for its completion - a key insight for time management.',
    tags: ['productivity', 'time management', 'science']
  },
  {
    title: 'The Two-Pizza Rule',
    blurb: 'Amazon\'s Jeff Bezos popularized the idea that teams should be small enough to feed with two pizzas for maximum efficiency.',
    tags: ['teamwork', 'productivity', 'business']
  },
  {
    title: 'The 10,000-Hour Rule',
    blurb: 'Malcolm Gladwell\'s theory that it takes roughly 10,000 hours of practice to achieve mastery in a field.',
    tags: ['mastery', 'learning', 'science']
  },
  {
    title: 'The Dunning-Kruger Effect',
    blurb: 'People with low ability at a task overestimate their ability, while experts underestimate theirs.',
    tags: ['psychology', 'learning', 'science']
  },
  {
    title: 'The Compound Effect',
    blurb: 'Small, consistent actions compound over time to produce significant results - the power of incremental improvement.',
    tags: ['productivity', 'growth', 'science']
  },
  {
    title: 'The Mere Exposure Effect',
    blurb: 'People develop a preference for things merely because they are familiar with them - key to branding.',
    tags: ['psychology', 'marketing', 'science']
  },
  {
    title: 'The Paradox of Choice',
    blurb: 'Too many options can lead to decision paralysis and decreased satisfaction - less is often more.',
    tags: ['psychology', 'decision making', 'science']
  }
]

/**
 * Pop culture / film references
 */
const POP_CULTURE: RandomSource[] = [
  {
    title: 'The Godfather\'s Business Lessons',
    blurb: '"It\'s not personal, it\'s strictly business" - a reminder to separate emotions from business decisions.',
    tags: ['film', 'business', 'culture']
  },
  {
    title: 'Star Wars and Leadership',
    blurb: '"Do or do not, there is no try" - Yoda\'s wisdom on commitment and decisive action.',
    tags: ['film', 'leadership', 'culture']
  },
  {
    title: 'The Social Network\'s Startup Culture',
    blurb: 'The film that captured the intensity and innovation of Silicon Valley\'s startup scene.',
    tags: ['film', 'startups', 'culture']
  },
  {
    title: 'Breaking Bad\'s Transformation',
    blurb: 'A story about reinvention and the power (and danger) of ambition.',
    tags: ['TV', 'transformation', 'culture']
  },
  {
    title: 'The Office\'s Workplace Humor',
    blurb: 'A satirical look at office culture that resonates with millions of workers worldwide.',
    tags: ['TV', 'workplace', 'culture']
  }
]

/**
 * "This Day in History" (business/tech focused)
 */
const THIS_DAY_HISTORY: RandomSource[] = [
  {
    title: 'Apple Founded (April 1, 1976)',
    blurb: 'Steve Jobs and Steve Wozniak founded Apple Computer in a garage, starting a tech revolution.',
    tags: ['history', 'technology', 'startups']
  },
  {
    title: 'Amazon Launched (July 16, 1995)',
    blurb: 'Jeff Bezos launched Amazon.com as an online bookstore, which would become an e-commerce giant.',
    tags: ['history', 'e-commerce', 'startups']
  },
  {
    title: 'Microsoft Founded (April 4, 1975)',
    blurb: 'Bill Gates and Paul Allen founded Microsoft, shaping the personal computer revolution.',
    tags: ['history', 'technology', 'startups']
  },
  {
    title: 'Google Incorporated (September 4, 1998)',
    blurb: 'Larry Page and Sergey Brin incorporated Google, transforming how we access information.',
    tags: ['history', 'technology', 'startups']
  },
  {
    title: 'Facebook Launched (February 4, 2004)',
    blurb: 'Mark Zuckerberg launched Facebook from his Harvard dorm room, changing social connection forever.',
    tags: ['history', 'social media', 'startups']
  },
  {
    title: 'Tesla Motors Founded (July 1, 2003)',
    blurb: 'Martin Eberhard and Marc Tarpenning founded Tesla, pioneering electric vehicle innovation.',
    tags: ['history', 'technology', 'innovation']
  }
]

/**
 * Major holidays by country
 */
const HOLIDAYS_BY_COUNTRY: Record<string, RandomSource[]> = {
  'United Kingdom': [
    {
      title: 'Boxing Day',
      blurb: 'The day after Christmas, traditionally for giving gifts to service workers and the less fortunate.',
      tags: ['holiday', 'UK', 'culture']
    },
    {
      title: 'Guy Fawkes Night',
      blurb: 'November 5th celebration commemorating the foiling of the Gunpowder Plot in 1605.',
      tags: ['holiday', 'UK', 'culture']
    }
  ],
  'United States': [
    {
      title: 'Thanksgiving',
      blurb: 'A national holiday for giving thanks, typically celebrated with family gatherings and feasts.',
      tags: ['holiday', 'US', 'culture']
    },
    {
      title: 'Independence Day',
      blurb: 'July 4th celebration of American independence and national pride.',
      tags: ['holiday', 'US', 'culture']
    }
  ],
  'Canada': [
    {
      title: 'Canada Day',
      blurb: 'July 1st celebration of Canadian confederation and national identity.',
      tags: ['holiday', 'Canada', 'culture']
    }
  ],
  'Australia': [
    {
      title: 'Australia Day',
      blurb: 'January 26th national day celebrating Australian culture and achievements.',
      tags: ['holiday', 'Australia', 'culture']
    }
  ],
  'Ireland': [
    {
      title: 'St. Patrick\'s Day',
      blurb: 'March 17th celebration of Irish culture and heritage, recognized worldwide.',
      tags: ['holiday', 'Ireland', 'culture']
    }
  ]
}

/**
 * Get observances by country
 */
export function getObservancesByCountry(country?: string): RandomSource[] {
  const world = WORLD_OBSERVANCES
  
  if (!country) return world
  
  if (country === 'United Kingdom') {
    return [...world, ...UK_OBSERVANCES]
  }
  
  if (country === 'United States') {
    return [...world, ...US_OBSERVANCES]
  }
  
  return world
}

/**
 * Get holidays by country
 */
export function getHolidaysByCountry(country?: string): RandomSource[] {
  if (!country) return []
  
  return HOLIDAYS_BY_COUNTRY[country] || []
}

/**
 * Get all random sources (observances, facts, pop culture, history)
 */
export function getAllRandomSources(country?: string): RandomSource[] {
  return [
    ...getObservancesByCountry(country),
    ...SCIENCE_FACTS,
    ...POP_CULTURE,
    ...THIS_DAY_HISTORY,
    ...getHolidaysByCountry(country)
  ]
}

/**
 * Pick a random source based on seed and country
 */
export function pickRandomSource(seed: number, country?: string): RandomSource {
  const sources = getAllRandomSources(country)
  return sources[seed % sources.length]
}

/**
 * Get source info for debugging
 */
export function getSourceStats(country?: string): {
  total: number
  observances: number
  science: number
  popCulture: number
  history: number
  holidays: number
} {
  return {
    total: getAllRandomSources(country).length,
    observances: getObservancesByCountry(country).length,
    science: SCIENCE_FACTS.length,
    popCulture: POP_CULTURE.length,
    history: THIS_DAY_HISTORY.length,
    holidays: getHolidaysByCountry(country).length
  }
}

