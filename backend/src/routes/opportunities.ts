import { Router, Request, Response } from 'express'

const router = Router()

interface Opportunity {
  id: string
  title: string
  country: string
  location: string
  category: string
  skills: string[]
  description: string
  payMin: number
  payMax: number
  deadline: string
}

const opportunities: Opportunity[] = [
  {
    id: 'opp-001',
    title: 'Wedding Photographer',
    country: 'Uganda',
    location: 'Kampala',
    category: 'Photography',
    skills: ['Photography', 'Event Photography', 'Portrait Photography'],
    description: 'Photographer needed for a weekend wedding event.',
    payMin: 450000,
    payMax: 700000,
    deadline: '2026-09-20',
  },
  {
    id: 'opp-002',
    title: 'Construction Assistant',
    country: 'Uganda',
    location: 'Kampala',
    category: 'Construction',
    skills: ['Construction', 'Masonry', 'Brickwork'],
    description: 'Skilled construction worker needed for a residential project.',
    payMin: 300000,
    payMax: 550000,
    deadline: '2026-09-18',
  },
  {
    id: 'opp-003',
    title: 'Professional Plumber',
    country: 'Uganda',
    location: 'Entebbe',
    category: 'Plumbing',
    skills: ['Plumbing', 'Pipe Fitting', 'Drainage Repair'],
    description: 'Plumber required for residential plumbing installations.',
    payMin: 350000,
    payMax: 600000,
    deadline: '2026-09-22',
  },
  {
    id: 'opp-004',
    title: 'Fashion Photographer',
    country: 'Kenya',
    location: 'Nairobi',
    category: 'Photography',
    skills: ['Photography', 'Fashion Photography', 'Photo Editing'],
    description: 'Photographer needed for a fashion campaign.',
    payMin: 500000,
    payMax: 900000,
    deadline: '2026-09-25',
  },
  {
    id: 'opp-005',
    title: 'Tailor for Custom Garments',
    country: 'Kenya',
    location: 'Nairobi',
    category: 'Fashion & Tailoring',
    skills: ['Tailoring', 'Sewing', 'Garment Construction'],
    description: 'Experienced tailor needed for custom clothing production.',
    payMin: 400000,
    payMax: 750000,
    deadline: '2026-09-28',
  },
]

router.get('/', (req: Request, res: Response): void => {
  try {
    const country = String(req.query.country || '').trim().toLowerCase()
    const trade = String(req.query.trade || '').trim().toLowerCase()

    const skills = String(req.query.skills || '')
      .split(',')
      .map(skill => skill.trim().toLowerCase())
      .filter(Boolean)

    const filtered = opportunities
      .map(opportunity => {
        const categoryMatch =
          trade &&
          opportunity.category.toLowerCase() === trade

        const skillMatches = skills.filter(skill =>
          opportunity.skills.some(opSkill =>
            opSkill.toLowerCase().includes(skill) ||
            skill.includes(opSkill.toLowerCase())
          )
        ).length

        const countryMatch =
          !country ||
          opportunity.country.toLowerCase() === country

        if (!countryMatch) {
          return null
        }

        const matchScore =
          (categoryMatch ? 60 : 0) +
          Math.min(skillMatches * 15, 40)

        return {
          ...opportunity,
          matchScore,
        }
      })
      .filter(Boolean)
      .sort((a, b) => (b?.matchScore || 0) - (a?.matchScore || 0))

    res.status(200).json({
      success: true,
      count: filtered.length,
      opportunities: filtered,
    })
  } catch (error) {
    console.error('Opportunity Error:', error)

    res.status(500).json({
      success: false,
      error: 'Failed to load opportunities.',
    })
  }
})

export default router
