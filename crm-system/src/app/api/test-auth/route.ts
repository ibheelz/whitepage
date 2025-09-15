import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    console.log('🧪 TEST AUTH: Starting manual auth test...')
    console.log('📧 Email:', email)
    console.log('🔑 Password provided:', !!password)

    // Check admin users
    const adminUser = await prisma.adminUser.findUnique({
      where: { email }
    })

    console.log('👤 Admin user found:', !!adminUser)
    if (adminUser) {
      console.log('📊 Admin details:', {
        id: adminUser.id,
        email: adminUser.email,
        isActive: adminUser.isActive,
        role: adminUser.role,
        hasPasswordHash: !!adminUser.passwordHash
      })

      const isValidPassword = await bcrypt.compare(password, adminUser.passwordHash)
      console.log('✅ Password valid:', isValidPassword)

      return NextResponse.json({
        success: true,
        userFound: true,
        userType: 'admin',
        isActive: adminUser.isActive,
        passwordValid: isValidPassword,
        details: {
          id: adminUser.id,
          email: adminUser.email,
          role: adminUser.role
        }
      })
    }

    return NextResponse.json({
      success: false,
      userFound: false,
      message: 'No user found'
    })

  } catch (error) {
    console.error('💥 TEST AUTH ERROR:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}