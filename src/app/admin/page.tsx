import Link from 'next/link'
import { 
  Calendar, 
  FileText, 
  PlusCircle, 
  BarChart3, 
  Users, 
  Package 
} from 'lucide-react'

export default function AdminDashboard() {
  const adminCards = [
    {
      title: 'Create Social Post',
      description: 'Generate AI-powered posts for your events',
      href: '/admin/social/create',
      icon: PlusCircle,
      color: 'bg-purple-500',
    },
    {
      title: 'Post Library',
      description: 'View and manage all your social media posts',
      href: '/admin/social/posts',
      icon: FileText,
      color: 'bg-blue-500',
    },
    {
      title: 'Content Calendar',
      description: 'Visual calendar of your scheduled posts',
      href: '/admin/social/calendar',
      icon: Calendar,
      color: 'bg-pink-500',
    },
    {
      title: 'Create Event',
      description: 'Add new events to your platform',
      href: '/admin/create-event',
      icon: Package,
      color: 'bg-green-500',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Admin Dashboard</h1>
          <p className="text-gray-600 text-lg">
            Manage your events, social media, and content
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminCards.map((card) => {
            const Icon = card.icon
            return (
              <Link
                key={card.href}
                href={card.href}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 group"
              >
                <div className={`${card.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 group-hover:text-purple-600 transition-colors">
                  {card.title}
                </h3>
                <p className="text-gray-600">
                  {card.description}
                </p>
              </Link>
            )
          })}
        </div>

        <div className="mt-12 bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Quick Stats</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">12</div>
              <div className="text-gray-600">Scheduled Posts</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">8</div>
              <div className="text-gray-600">Upcoming Events</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">142</div>
              <div className="text-gray-600">Total Orders</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-600">$2,840</div>
              <div className="text-gray-600">Revenue</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}