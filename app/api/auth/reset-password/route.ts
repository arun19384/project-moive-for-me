import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users, passwordResetTokens } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const { token, newPassword } = await req.json()

    if (!token || !newPassword) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
    }

    // Verify token exists
    const foundToken = await db
      .select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.token, token))
      .limit(1)

    const resetToken = foundToken[0]

    if (!resetToken) {
      return NextResponse.json({ message: 'Invalid or expired token' }, { status: 400 })
    }

    // Check if expired
    // Parse MySQL datetime string back to Date object. Adding 'Z' ensures it parses as UTC if it was stored as such, but usually we just parse it as local time if stored raw.
    // It's safer to just do new Date(resetToken.expires + 'Z') if stored in UTC, but let's just do new Date().
    let expiresDate = new Date(resetToken.expires);
    // If it's invalid date due to format, replace ' ' with 'T'
    if (isNaN(expiresDate.getTime())) {
      expiresDate = new Date(resetToken.expires.replace(' ', 'T') + 'Z')
    }

    if (expiresDate < new Date()) {
      // Delete expired token
      await db.delete(passwordResetTokens).where(eq(passwordResetTokens.token, token))
      return NextResponse.json({ message: 'Token has expired' }, { status: 400 })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update user password
    await db
      .update(users)
      .set({ passwordHash: hashedPassword })
      .where(eq(users.id, resetToken.userId))

    // Delete used token
    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.token, token))

    return NextResponse.json({ message: 'Password reset successfully' }, { status: 200 })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
