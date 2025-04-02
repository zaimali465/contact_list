import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

export async function POST(request: Request) {
  try {
    await connectDB()
    const { username, password, action } = await request.json()

    if (action === 'signup') {
      const existingUser = await User.findOne({ username })
      if (existingUser) {
        return NextResponse.json({ error: 'Username already exists' }, { status: 400 })
      }

      try {
        const user = await User.create({ username, password })
        return NextResponse.json({ id: user._id, username: user.username })
      } catch (error) {
        console.error('Error creating user:', error)
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
      }
    }

    if (action === 'login') {
      const user = await User.findOne({ username })
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      const isValid = await user.comparePassword(password)
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
      }

      return NextResponse.json({ id: user._id, username: user.username })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
