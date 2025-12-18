import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    // Get authenticated users
    const { data: { users }, error } = await supabase.auth.admin.listUsers()

    if (error) throw error

    // Map to simple format
    const mappedUsers = users.map(user => ({
      id: user.id,
      email: user.email || 'No email',
      created_at: user.created_at
    }))

    return NextResponse.json({
      success: true,
      users: mappedUsers
    })
  } catch (error: any) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}