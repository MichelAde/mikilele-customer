'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { Building2, ChevronDown, Plus, Check } from 'lucide-react'

interface Organization {
  id: string
  name: string
  subdomain: string
  logo_url: string | null
  brand_color: string
}

export default function OrganizationSwitcher() {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetchOrganizations()
  }, [])

  async function fetchOrganizations() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      console.log('🔍 Fetching orgs for user:', user?.id)
      
      if (!user) {
        console.log('❌ No user found')
        return
      }
  
      // Fetch memberships with organization data
      const { data: memberships, error } = await supabase
        .from('organization_members')
        .select(`
          organization_id,
          role,
          organization:organization_id (
            id,
            name,
            subdomain,
            logo_url,
            brand_color
          )
        `)
        .eq('user_id', user.id)
  
      console.log('📊 Memberships query result:', { memberships, error })
  
      if (error) {
        console.error('❌ Error fetching memberships:', error)
        return
      }
  
      if (memberships && memberships.length > 0) {
        const orgs = memberships
          .map((m: any) => m.organization)
          .filter(Boolean)
        
        console.log('✅ Organizations found:', orgs)
        setOrganizations(orgs)
  
        // Set selected org from URL param or first org
        const orgId = searchParams.get('org')
        if (orgId) {
          const org = orgs.find((o: any) => o.id === orgId)
          if (org) {
            setSelectedOrg(org)
            localStorage.setItem('selectedOrgId', org.id)
          }
        } else {
          const savedOrgId = localStorage.getItem('selectedOrgId')
          const org = savedOrgId 
            ? orgs.find((o: any) => o.id === savedOrgId)
            : orgs[0]
          if (org) setSelectedOrg(org)
        }
      } else {
        console.log('⚠️ No memberships found')
      }
    } catch (error) {
      console.error('💥 Exception in fetchOrganizations:', error)
    } finally {
      setLoading(false)
    }
  }

  function switchOrganization(org: Organization) {
    setSelectedOrg(org)
    localStorage.setItem('selectedOrgId', org.id)
    router.push(`/admin?org=${org.id}`)
    setIsOpen(false)
  }

  if (loading) {
    return (
      <div className="w-64 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
    )
  }

  if (organizations.length === 0) {
    return null
  }

  return (
    <div className="relative">
      {/* Selected Organization Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg hover:border-purple-300 transition"
      >
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
          style={{ backgroundColor: selectedOrg?.brand_color || '#7C3AED' }}
        >
          {selectedOrg?.logo_url ? (
            <img src={selectedOrg.logo_url} alt="" className="w-full h-full object-cover rounded-lg" />
          ) : (
            <Building2 className="w-6 h-6" />
          )}
        </div>
        <div className="flex-1 text-left">
          <p className="font-semibold text-gray-900">
            {selectedOrg?.name || 'Select Organization'}
          </p>
          <p className="text-xs text-gray-500">
            {selectedOrg?.subdomain}.myplatform.com
          </p>
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          ></div>

          {/* Menu */}
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-20 max-h-96 overflow-y-auto">
            {/* Organizations List */}
            <div className="p-2">
              {organizations.map((org) => (
                <button
                  key={org.id}
                  onClick={() => switchOrganization(org)}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-gray-50 transition"
                >
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0"
                    style={{ backgroundColor: org.brand_color }}
                  >
                    {org.logo_url ? (
                      <img src={org.logo_url} alt="" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <Building2 className="w-6 h-6" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-gray-900">{org.name}</p>
                    <p className="text-xs text-gray-500">{org.subdomain}.myplatform.com</p>
                  </div>
                  {selectedOrg?.id === org.id && (
                    <Check className="w-5 h-5 text-purple-600" />
                  )}
                </button>
              ))}
            </div>

            {/* Add Organization */}
            <div className="border-t border-gray-200 p-2">
              <button
                onClick={() => {
                  setIsOpen(false)
                  router.push('/organization/new')
                }}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-purple-50 text-purple-600 font-medium transition"
              >
                <div className="w-10 h-10 rounded-lg border-2 border-dashed border-purple-300 flex items-center justify-center">
                  <Plus className="w-6 h-6" />
                </div>
                <span>Create New Organization</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}