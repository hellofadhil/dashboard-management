import nodemailer from 'nodemailer';
import { NextResponse } from "next/server"
export async function POST(request: Request) {
  try {
    const { email, verificationLink } = await request.json()

    if (!email || !verificationLink) {
      return NextResponse.json({ error: "Email and verification link are required" }, { status: 400 })
    }

    // Create nodemailer transporter
    const transporter = nodemailer.createTransport({
      secure: true,
      service: "gmail",
      auth: {
        user: "fadhil8637@smk.belajar.id",
        pass: "fedw woyz tyhs nlxd",
      },
    })

    // Email content
    const mailOptions = {
      from: "fadhil8637@smk.belajar.id",
      to: email,
      subject: "Verify Your Email for Ecommerce Dashboard",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #4338ca;">Verify Your Email Address</h2>
          <p>Thank you for registering with our Ecommerce Dashboard. Please verify your email address to complete your registration.</p>
          <div style="margin: 30px 0;">
            <a href="${verificationLink}" style="background-color: #4338ca; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Verify Email Address</a>
          </div>
          <p>If you didn't create an account, you can safely ignore this email.</p>
          <p>This link will expire in 24 hours.</p>
          <p style="margin-top: 30px; font-size: 12px; color: #666;">If the button doesn't work, copy and paste this link into your browser: ${verificationLink}</p>
        </div>
      `,
    }

    // Send email
    await transporter.sendMail(mailOptions)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending verification email:", error)
    return NextResponse.json({ error: "Failed to send verification email" }, { status: 500 })
  }
}

