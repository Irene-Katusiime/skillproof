import { useEffect, useMemo, useState } from 'react'
import {
  Briefcase,
  MapPin,
  Calendar,
  Banknote,
  Search,
  Sparkles,
  AlertCircle,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import PageHeader from '../components/PageHeader'

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
  matchScore: number
}

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

function formatMoney(value: number) {
  return `UGX ${value.toLocaleString()}`
}

export default function FindOpportunities() {
  const { profile } = useApp()

  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const country = useMemo(
    () => extractCountry(profile.location),
    [profile.location]
  )

  const trade = profile.profession || ''

  const skills = profile.skills.map(skill => skill.name)

  useEffect(() => {
    const loadOpportunities = async () => {
      try {
        setLoading(true)
        setError('')

        const params = new URLSearchParams({
          country,
          skills: skills.join(','),
        })

        const response = await fetch(
          `/api/opportunities?${params.toString()}`
        )

        const result = await response.json()

        if (!response.ok || !result.success) {
          throw new Error(
            result.error || 'Failed to load opportunities.'
          )
        }

        setOpportunities(result.opportunities || [])
      } catch (err: any) {
        console.error('Opportunity loading error:', err)
        setError(
          err.message || 'Could not load opportunities.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadOpportunities()
  }, [country, trade, profile.skills])

  const filteredOpportunities = opportunities.filter(opportunity => {
    const query = search.toLowerCase().trim()

    if (!query) return true

    return (
      opportunity.title.toLowerCase().includes(query) ||
      opportunity.category.toLowerCase().includes(query) ||
      opportunity.location.toLowerCase().includes(query) ||
      opportunity.skills.some(skill =>
        skill.toLowerCase().includes(query)
      )
    )
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Find Opportunities"
        subtitle={`Available opportunities matched to your trade and location in ${country}`}
      />

      {/* Profile matching summary */}
      <div className="card bg-gradient-to-r from-orange-50 to-amber-50 border-orange-100">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
            <Sparkles size={20} className="text-orange-500" />
          </div>

          <div className="flex-1">
            <h2 className="font-bold text-gray-800">
              Opportunities matched to you
            </h2>

            <p className="text-sm text-gray-600 mt-1">
              We are looking for opportunities based on your
              country, trade and verified skills.
            </p>

            <div className="flex flex-wrap gap-2 mt-3">
              <span className="badge-orange">
                {country}
              </span>

              {trade && (
                <span className="badge-gray">
                  {trade}
                </span>
              )}

              {profile.skills.slice(0, 4).map(skill => (
                <span
                  key={skill.id}
                  className="badge-gray"
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search opportunities..."
          className="input pl-11 w-full"
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="card text-center py-12">
          <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto" />

          <p className="text-sm text-gray-500 mt-4">
            Finding opportunities for you...
          </p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="card text-center py-12">
          <AlertCircle
            size={40}
            className="mx-auto text-red-400"
          />

          <h3 className="font-bold text-gray-800 mt-4">
            Could not load opportunities
          </h3>

          <p className="text-sm text-gray-500 mt-1">
            {error}
          </p>
        </div>
      )}

      {/* No opportunities */}
      {!loading &&
        !error &&
        filteredOpportunities.length === 0 && (
          <div className="card text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto">
              <Briefcase
                size={28}
                className="text-gray-400"
              />
            </div>

            <h3 className="font-bold text-gray-800 mt-5">
              No available opportunities
            </h3>

            <p className="text-sm text-gray-500 max-w-md mx-auto mt-2">
              There are currently no opportunities matching
              your trade and location. Check back later for
              new opportunities.
            </p>
          </div>
        )}

      {/* Opportunities */}
      {!loading &&
        !error &&
        filteredOpportunities.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-gray-800">
                  Available Opportunities
                </h2>

                <p className="text-xs text-gray-500 mt-1">
                  {filteredOpportunities.length}{' '}
                  {filteredOpportunities.length === 1
                    ? 'opportunity'
                    : 'opportunities'}{' '}
                  available
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredOpportunities.map(opportunity => (
                <div
                  key={opportunity.id}
                  className="card hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                        <Briefcase
                          size={20}
                          className="text-orange-500"
                        />
                      </div>

                      <div>
                        <h3 className="font-bold text-gray-800">
                          {opportunity.title}
                        </h3>

                        <span className="badge-orange text-[10px] mt-1 inline-flex">
                          {opportunity.category}
                        </span>
                      </div>
                    </div>

                    <span className="badge-green shrink-0">
                      {opportunity.matchScore}% match
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 leading-relaxed mt-4">
                    {opportunity.description}
                  </p>

                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="flex items-center gap-2">
                      <MapPin
                        size={15}
                        className="text-gray-400"
                      />

                      <span className="text-xs text-gray-600">
                        {opportunity.location}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar
                        size={15}
                        className="text-gray-400"
                      />

                      <span className="text-xs text-gray-600">
                        {new Date(
                          opportunity.deadline
                        ).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <Banknote
                      size={15}
                      className="text-gray-400"
                    />

                    <span className="text-sm font-semibold text-gray-700">
                      {formatMoney(opportunity.payMin)}
                      {' – '}
                      {formatMoney(opportunity.payMax)}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-gray-100">
                    {opportunity.skills.map(skill => (
                      <span
                        key={skill}
                        className="badge-gray text-[10px]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="btn-primary w-full mt-4"
                    onClick={() => {
                      alert(
                        `Application for "${opportunity.title}" will be connected to the employer.`
                      )
                    }}
                  >
                    View Opportunity
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
    </div>
  )
}
