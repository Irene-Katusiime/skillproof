import { Router, Request, Response } from 'express'

const router = Router()

interface Opportunity {
  id: string
  employerId: string
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

interface OpportunityWithMatch extends Opportunity {
  matchScore: number
  matchedSkills?: string[]
}

const opportunities: Opportunity[] = [
  {
    id: 'opp-001',
    employerId: 'seed-employer',
    title: 'Wedding Photographer',
    country: 'Uganda',
    location: 'Kampala',
    category: 'Photography',
    skills: [
      'Photography',
      'Event Photography',
      'Portrait Photography',
    ],
    description:
      'Photographer needed for a weekend wedding event.',
    payMin: 450000,
    payMax: 700000,
    deadline: '2026-09-20',
  },

  {
    id: 'opp-002',
    employerId: 'seed-employer',
    title: 'Construction Assistant',
    country: 'Uganda',
    location: 'Kampala',
    category: 'Construction',
    skills: [
      'Construction',
      'Masonry',
      'Brickwork',
    ],
    description:
      'Skilled construction worker needed for a residential project.',
    payMin: 300000,
    payMax: 550000,
    deadline: '2026-09-18',
  },

  {
    id: 'opp-003',
    employerId: 'seed-employer',
    title: 'Professional Plumber',
    country: 'Uganda',
    location: 'Entebbe',
    category: 'Plumbing',
    skills: [
      'Plumbing',
      'Pipe Fitting',
      'Drainage Repair',
    ],
    description:
      'Plumber required for residential plumbing installations.',
    payMin: 350000,
    payMax: 600000,
    deadline: '2026-09-22',
  },

  {
    id: 'opp-004',
    employerId: 'seed-employer',
    title: 'Fashion Photographer',
    country: 'Kenya',
    location: 'Nairobi',
    category: 'Photography',
    skills: [
      'Photography',
      'Fashion Photography',
      'Photo Editing',
    ],
    description:
      'Photographer needed for a fashion campaign.',
    payMin: 500000,
    payMax: 900000,
    deadline: '2026-09-25',
  },

  {
    id: 'opp-005',
    employerId: 'seed-employer',
    title: 'Tailor for Custom Garments',
    country: 'Kenya',
    location: 'Nairobi',
    category: 'Fashion & Tailoring',
    skills: [
      'Tailoring',
      'Sewing',
      'Garment Construction',
    ],
    description:
      'Experienced tailor needed for custom clothing production.',
    payMin: 400000,
    payMax: 750000,
    deadline: '2026-09-28',
  },
]

/**
 * Normalize skill names so that:
 *
 * "Photography"
 * "photography"
 * "  Photography  "
 *
 * are treated as the same skill.
 */
function normalizeSkill(skill: string): string {
  return skill
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

/**
 * Calculate how many of the employer's required
 * skills the worker has.
 *
 * Example:
 *
 * Required:
 * Photography
 * Editing
 * Lighting
 * Photoshop
 * Retouching
 *
 * Worker has:
 * Photography
 * Editing
 * Lighting
 * Photoshop
 *
 * Match = 4 / 5 = 80%
 */
function calculateSkillMatch(
  workerSkills: string[],
  requiredSkills: string[]
): {
  matchedSkills: string[]
  matchScore: number
} {
  const workerSkillSet = new Set(
    workerSkills
      .map(normalizeSkill)
      .filter(Boolean)
  )

  const required = [
    ...new Set(
      requiredSkills
        .map(normalizeSkill)
        .filter(Boolean)
    ),
  ]

  const matchedSkills = required.filter(
    skill => workerSkillSet.has(skill)
  )

  const matchScore =
    required.length === 0
      ? 0
      : Math.round(
          (matchedSkills.length / required.length) *
            100
        )

  return {
    matchedSkills,
    matchScore,
  }
}

/**
 * Try to determine the country from the location
 * if the employer does not explicitly provide one.
 */
function extractCountry(location: string): string {
  const countries = [
    'Uganda',
    'Kenya',
    'Tanzania',
    'Ghana',
    'Nigeria',
    'Rwanda',
    'South Africa',
  ]

  const lower = location.toLowerCase()

  return (
    countries.find(country =>
      lower.includes(country.toLowerCase())
    ) || 'Uganda'
  )
}

/*
|--------------------------------------------------------------------------
| GET /api/opportunities
|--------------------------------------------------------------------------
|
| WORKER:
|
| /api/opportunities?country=Uganda&skills=Photography,Editing
|
| The backend calculates:
|
| matched required skills / total required skills * 100
|
| Only opportunities with matchScore >= 70 are returned.
|
|
| EMPLOYER:
|
| /api/opportunities?employerId=employer-123
|
| Returns only that employer's opportunities.
|
|--------------------------------------------------------------------------
*/

router.get(
  '/',
  (req: Request, res: Response): void => {
    try {
      const employerId = String(
        req.query.employerId || ''
      ).trim()

      const country = String(
        req.query.country || ''
      )
        .trim()
        .toLowerCase()

      const workerSkills = String(
        req.query.skills || ''
      )
        .split(',')
        .map(skill => skill.trim())
        .filter(Boolean)

      /*
       * ---------------------------------------------------------------
       * EMPLOYER REQUEST
       * ---------------------------------------------------------------
       *
       * If employerId exists, return ONLY jobs posted
       * by that employer.
       *
       * IMPORTANT:
       * We return here after sending the response so that
       * the request does NOT continue into worker matching.
       */

      if (employerId) {
        const employerOpportunities =
          opportunities.filter(
            opportunity =>
              opportunity.employerId === employerId
          )

        const result: OpportunityWithMatch[] =
          employerOpportunities.map(
            opportunity => ({
              ...opportunity,
              matchScore: 100,
            })
          )

        res.status(200).json({
          success: true,
          count: result.length,
          opportunities: result,
        })

        return
      }

      /*
       * ---------------------------------------------------------------
       * WORKER REQUEST
       * ---------------------------------------------------------------
       *
       * Calculate the worker's skill match for every
       * opportunity.
       */

      const filtered: OpportunityWithMatch[] =
        opportunities
          .filter(opportunity => {
            /*
             * If no country was supplied, don't filter
             * by country.
             */
            if (!country) {
              return true
            }

            return (
              opportunity.country.toLowerCase() ===
              country
            )
          })
          .map(opportunity => {
            const {
              matchedSkills,
              matchScore,
            } = calculateSkillMatch(
              workerSkills,
              opportunity.skills
            )

            return {
              ...opportunity,
              matchScore,
              matchedSkills,
            }
          })

          /*
           * -----------------------------------------------------------
           * THE 70% RULE
           * -----------------------------------------------------------
           *
           * A worker must match at least 70% of the
           * employer's required skills.
           *
           * 5 required / 5 matched = 100% -> SHOW
           * 5 required / 4 matched = 80%  -> SHOW
           * 5 required / 3 matched = 60%  -> HIDE
           * 5 required / 2 matched = 40%  -> HIDE
           */
          .filter(
            opportunity =>
              opportunity.matchScore >= 70
          )

          /*
           * Highest matching opportunities first.
           */
          .sort(
            (a, b) =>
              b.matchScore - a.matchScore
          )

      res.status(200).json({
        success: true,
        count: filtered.length,
        opportunities: filtered,
      })
    } catch (error) {
      console.error(
        'Opportunity Error:',
        error
      )

      res.status(500).json({
        success: false,
        error:
          'Failed to load opportunities.',
      })
    }
  }
)

/*
|--------------------------------------------------------------------------
| POST /api/opportunities
|--------------------------------------------------------------------------
|
| Employer creates a new opportunity.
|
| Body:
|
| {
|   employerId: "employer-123",
|   title: "Photographer",
|   location: "Kampala",
|   country: "Uganda",
|   category: "Photography",
|   skills: [
|     "Photography",
|     "Photo Editing",
|     "Portrait Photography"
|   ],
|   description: "...",
|   payMin: 400000,
|   payMax: 600000,
|   deadline: "2026-09-30"
| }
|
|--------------------------------------------------------------------------
*/

router.post(
  '/',
  (req: Request, res: Response): void => {
    try {
      const {
        employerId,
        title,
        location,
        country,
        category,
        skills,
        description,
        payMin,
        payMax,
        deadline,
      } = req.body

      /*
       * ---------------------------------------------------------------
       * VALIDATION
       * ---------------------------------------------------------------
       */

      if (
        typeof employerId !== 'string' ||
        !employerId.trim()
      ) {
        res.status(400).json({
          success: false,
          error:
            'Employer ID is required.',
        })

        return
      }

      if (
        typeof title !== 'string' ||
        !title.trim()
      ) {
        res.status(400).json({
          success: false,
          error:
            'Job title is required.',
        })

        return
      }

      if (
        typeof location !== 'string' ||
        !location.trim()
      ) {
        res.status(400).json({
          success: false,
          error:
            'Location is required.',
        })

        return
      }

      /*
       * The employer MUST provide at least one
       * required skill.
       */
      if (
        !Array.isArray(skills) ||
        skills.length === 0
      ) {
        res.status(400).json({
          success: false,
          error:
            'At least one required skill must be selected.',
        })

        return
      }

      /*
       * ---------------------------------------------------------------
       * CLEAN REQUIRED SKILLS
       * ---------------------------------------------------------------
       *
       * Remove:
       * - empty values
       * - duplicates
       * - unnecessary whitespace
       */

      const cleanedSkills = [
        ...new Set(
          skills
            .map((skill: unknown) =>
              String(skill).trim()
            )
            .filter(Boolean)
        ),
      ]

      if (cleanedSkills.length === 0) {
        res.status(400).json({
          success: false,
          error:
            'At least one valid required skill is needed.',
        })

        return
      }

      /*
       * ---------------------------------------------------------------
       * CREATE OPPORTUNITY
       * ---------------------------------------------------------------
       */

      const cleanLocation =
        location.trim()

      const cleanCountry =
        typeof country === 'string'
          ? country.trim()
          : ''

      const opportunity: Opportunity = {
        id: `opp-${Date.now()}`,

        employerId:
          employerId.trim(),

        title:
          title.trim(),

        country:
          cleanCountry ||
          extractCountry(
            cleanLocation
          ),

        location:
          cleanLocation,

        category:
          typeof category === 'string'
            ? category.trim()
            : '',

        skills:
          cleanedSkills,

        description:
          typeof description === 'string'
            ? description.trim()
            : '',

        payMin:
          Number.isFinite(
            Number(payMin)
          )
            ? Number(payMin)
            : 0,

        payMax:
          Number.isFinite(
            Number(payMax)
          )
            ? Number(payMax)
            : 0,

        deadline:
          typeof deadline === 'string'
            ? deadline
            : '',
      }

      /*
       * Add newest opportunity to the beginning
       * of the list.
       */
      opportunities.unshift(
        opportunity
      )

      /*
       * Return the newly created opportunity.
       */
      res.status(201).json({
        success: true,
        opportunity: {
          ...opportunity,
          matchScore: 100,
        },
      })
    } catch (error) {
      console.error(
        'Create Opportunity Error:',
        error
      )

      res.status(500).json({
        success: false,
        error:
          'Failed to create opportunity.',
      })
    }
  }
)

export default router