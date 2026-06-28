import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users, passwordResetTokens } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import nodemailer from 'nodemailer'
import crypto from 'crypto'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 })
    }

    const found = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    const user = found[0]

    if (!user) {
      // Don't leak whether user exists or not for security
      return NextResponse.json({ message: 'If an account exists, a reset link was sent.' }, { status: 200 })
    }

    // Generate token
    const token = crypto.randomBytes(32).toString('hex')
    
    // Format expiration (1 hour from now) as YYYY-MM-DD HH:MM:SS for MySQL datetime
    const expireDate = new Date(Date.now() + 3600000)
    const expiresFormatted = expireDate.toISOString().slice(0, 19).replace('T', ' ')

    await db.insert(passwordResetTokens).values({
      token,
      userId: user.id,
      expires: expiresFormatted,
    })

    // Setup Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    })

    // Construct reset URL dynamically based on request origin
    const url = new URL(req.url)
    const resetUrl = `${url.origin}/reset-password?token=${token}`

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>You recently requested to reset your password for your account.</p>
          <p>Click the button below to set a new password. This link will expire in 1 hour.</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px; margin-top: 10px; margin-bottom: 20px;">Reset Password</a>
          <p>If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    })

    return NextResponse.json({ message: 'If an account exists, a reset link was sent.' }, { status: 200 })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
