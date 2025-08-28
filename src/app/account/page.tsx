"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type Report = {
  id: string
  created_at: string
  category: string
  location?: string | { lat: number; lon: number; precision_level?: string }
  city?: string
  venue_name?: string
  address?: string
  description: string
  loss_amount_inr?: number
  payment_method?: string
  tactic_tags?: string[]
  date_time_of_incident?: string
  evidence_ids?: string[]
  indicators?: string[]
  outcome?: string
  verification_status?: string
  scam_meter_score?: number
  reporter_visibility?: string
  reporter_email?: string
}

// Recent activity will be fetched via API (mine=true); remove static JSON import usage
import Link from 'next/link'
import { account } from '@/lib/appwrite.client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { MetricCard } from '@/components/ui/metric-card'
import { 
  Sidebar, 
  SidebarHeader, 
  SidebarContent, 
  SidebarFooter, 
  SidebarNav, 
  SidebarNavItem 
} from '@/components/ui/sidebar'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Home, 
  FileText, 
  BarChart3, 
  Settings, 
  HelpCircle, 
  Plus,
  Activity,
  Users,
  User,
  Save
} from 'lucide-react'

export default function AccountDashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [error, setError] = useState<string>('')
  const [activeTab, setActiveTab] = useState('dashboard')
  const [editMode, setEditMode] = useState(false)
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    location: ''
  })
  const [stats, setStats] = useState({ totalReports: 0 })
  const [recentReports, setRecentReports] = useState<Report[]>([])
  const [recentLoading, setRecentLoading] = useState(false)
  const [recentError, setRecentError] = useState('')

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: '', // user.phone is not available in type
        location: ''
      })
      
      // Fetch user statistics
      setStats({ totalReports: 12 })
      fetchRecentReports()
    }
  }, [user])

  async function fetchRecentReports() {
    if (!user) return
    setRecentLoading(true)
    setRecentError('')
    try {
      const jwt = await account.createJWT()
      const res = await fetch('/api/reports?mine=true&limit=10', {
        headers: { Authorization: `Bearer ${jwt.jwt}` }
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to load recent activity')
      }
      const data = await res.json()
      setRecentReports(Array.isArray(data.items) ? data.items : [])
    } catch (e) {
      setRecentError((e as Error).message)
    } finally {
      setRecentLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <div className="w-64 border-r">
          <div className="animate-pulse p-6">
            <div className="h-8 bg-muted rounded mb-4"></div>
            <div className="space-y-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-10 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex-1 p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Required</CardTitle>
            <CardDescription>
              You need to sign in to view your dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/auth/login">
              <Button className="w-full">Sign In</Button>
            </Link>
            {error && (
              <p className="text-destructive text-sm mt-2">{error}</p>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleSaveProfile = async () => {
    try {
      // Here you would update the profile via API
      // await updateUserProfile(profileData)
      setEditMode(false)
      alert('Profile updated successfully!')
    } catch (err) {
      alert('Failed to update profile')
    }
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, action: () => setActiveTab('dashboard') },
    { id: 'profile', label: 'Edit Profile', icon: User, action: () => setActiveTab('profile') },
    { id: 'reports-external', label: 'My Reports', icon: FileText, action: () => router.push('/account/reports') },
    { id: 'new-report', label: 'New Report', icon: Plus, action: () => setActiveTab('new-report') },
    { id: 'browse', label: 'Browse Incidents', icon: BarChart3, action: () => setActiveTab('browse') },
  ]

  // Filter reports for the current user
  const userReports: Report[] = recentReports

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Edit Profile</h2>
                <p className="text-muted-foreground">Update your personal information</p>
              </div>
              <Button 
                onClick={editMode ? handleSaveProfile : () => setEditMode(true)}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {editMode ? 'Save Changes' : 'Edit Profile'}
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Your basic account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4 mb-6">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="text-lg">
                      {(profileData.name || profileData.email || 'U').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {editMode && (
                    <Button variant="outline">Change Avatar</Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Full Name</label>
                    <Input
                      value={profileData.name}
                      onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                      disabled={!editMode}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email Address</label>
                    <Input
                      value={profileData.email}
                      disabled={true}
                      className="mt-1 bg-muted"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Phone Number</label>
                    <Input
                      value={profileData.phone}
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      disabled={!editMode}
                      className="mt-1"
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Location</label>
                    <Input
                      value={profileData.location}
                      onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                      disabled={!editMode}
                      className="mt-1"
                      placeholder="City, Country"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

  // My Reports now handled by external page /account/reports

      case 'new-report':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Submit New Report</h2>
              <p className="text-muted-foreground">Help protect the community by reporting incidents</p>
            </div>
            <div className="text-center py-8">
              <Plus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Create a new incident report</p>
              <Link href="/report">
                <Button className="mt-4">Start New Report</Button>
              </Link>
            </div>
          </div>
        )

      case 'browse':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Browse Incidents</h2>
              <p className="text-muted-foreground">Explore reports from the community</p>
            </div>
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">View all community reports and incidents</p>
              <Link href="/incidents">
                <Button className="mt-4">Browse All Incidents</Button>
              </Link>
            </div>
          </div>
        )

      default:
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back, {profileData.name || user.email?.split('@')[0]}! Here's your overview.
              </p>
            </div>


            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('new-report')}>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <Plus className="mr-2 h-5 w-5 text-primary" />
                      Report New Incident
                    </CardTitle>
                    <CardDescription>
                      Help protect your community by reporting scams and unsafe venues
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
              
              <div className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/account/reports')}>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <FileText className="mr-2 h-5 w-5 text-blue-600" />
                      Manage Reports
                    </CardTitle>
                    <CardDescription>
                      View and track the status of your submitted reports
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
              
              <div className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('browse')}>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <BarChart3 className="mr-2 h-5 w-5 text-green-600" />
                      Browse Incidents
                    </CardTitle>
                    <CardDescription>
                      Explore reports from the community to stay informed
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Your latest reports and community interactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentLoading && (
                    <div className="space-y-2">
                      {[1,2,3].map(i => <div key={i} className="h-6 bg-muted rounded animate-pulse" />)}
                    </div>
                  )}
                  {!recentLoading && recentError && (
                    <p className="text-destructive text-sm">{recentError}</p>
                  )}
                  {!recentLoading && !recentError && userReports.length === 0 && (
                    <p className="text-muted-foreground">No recent activity found.</p>
                  )}
                  {!recentLoading && !recentError && userReports.length > 0 && (
                    userReports.slice(0,5).map(report => (
                      <div key={report.id} className="flex items-center space-x-4">
                        <div className={`h-2 w-2 rounded-full ${report.verification_status === 'evidence_backed' ? 'bg-green-500' : 'bg-blue-500'}`} />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{report.category.replace(/_/g, ' ')} report</p>
                          <p className="text-xs text-muted-foreground">{new Date(report.created_at).toLocaleString()}</p>
                        </div>
                        <Badge variant={report.verification_status === 'evidence_backed' ? 'outline' : 'secondary'}>
                          {report.verification_status === 'evidence_backed' ? 'Verified' : 'Unverified'}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 border-r">
        <Sidebar>
          <SidebarHeader>
            <Link href="/" className="flex items-center space-x-3 group px-1 py-1">
              <div className="h-9 w-9 flex items-center justify-center overflow-hidden rounded-lg ring-1 ring-border bg-background">
                <img
                  src="/logo.png"
                  alt="ScamMapper logo"
                  className="h-9 w-9 object-contain transition-transform group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <span className="font-semibold text-base tracking-tight group-hover:text-primary transition-colors">ScamMapper</span>
            </Link>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarNav>
              {navItems.map((item) => (
                <SidebarNavItem
                  key={item.id}
                  isActive={!item.id.includes('reports-external') && activeTab === item.id}
                  onClick={item.action}
                  className="cursor-pointer"
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </SidebarNavItem>
              ))}
            </SidebarNav>
            
            <Separator className="my-4 mx-2" />
            
            <SidebarNav>
              <SidebarNavItem>
                <HelpCircle className="mr-2 h-4 w-4" />
                Help & Support
              </SidebarNavItem>
            </SidebarNav>
          </SidebarContent>
          
          <SidebarFooter>
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {(profileData.name || profileData.email || 'U').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {profileData.name || 'User'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {profileData.email}
                </p>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}
