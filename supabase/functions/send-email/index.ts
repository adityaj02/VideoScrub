import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

// ⚠️  Resend TEST MODE: onboarding@resend.dev can ONLY deliver to the
//     Resend account owner's email (adityajmarch020304@gmail.com).
//     Both emails route there until a custom domain is verified.
const ADMIN_EMAIL = "adityajmarch020304@gmail.com"

const sendEmail = async (apiKey: string, to: string, subject: string, html: string) => {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: "onboarding@resend.dev", to, subject, html }),
  })
  return res.json().catch(() => ({}))
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { name, email, phone, service, location, date, time } = await req.json()

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Missing email" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      )
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")
    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ error: "RESEND_API_KEY not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      )
    }

    const safeName     = String(name     || "Customer").trim()
    const safeEmail    = String(email    || "").trim()
    const safePhone    = String(phone    || "N/A").trim()
    const safeService  = String(service  || "General Service").trim()
    const safeLocation = String(location || "Location pending").trim()
    const safeDate     = String(date     || "Flexible").trim()
    const safeTime     = String(time     || "Flexible").trim()
    const bookingRef   = `BW-${Date.now().toString().slice(-8)}`

    console.log("Sending emails for booking:", bookingRef, safeName, safeService)

    // ─── 🔵 USER CONFIRMATION (routed to admin inbox in test mode) ────────────
    const userResult = await sendEmail(
      RESEND_API_KEY,
      ADMIN_EMAIL,   // ← test mode: must be Resend account email
      `[USER COPY] Booking Confirmed ✅ — ${safeName} (${safeEmail})`,
      `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9f9f9;padding:32px;border-radius:12px;">
          <p style="font-size:12px;color:#e67e22;background:#fff3cd;padding:10px 16px;border-radius:6px;margin-bottom:20px;">
            ⚠️ <strong>TEST MODE:</strong> This email would normally go to <strong>${safeEmail}</strong>.
            You can preview it in your <a href="https://resend.com/emails">Resend Dashboard → Emails</a>.
            Verify your domain on Resend to enable direct customer delivery.
          </p>
          <h1 style="color:#1a1a2e;font-size:24px;margin-bottom:4px;">Booking Confirmed ✅</h1>
          <p style="color:#555;font-size:15px;">Hello <strong>${safeName}</strong>, your booking has been successfully received.</p>

          <div style="background:#fff;border-radius:10px;padding:24px;margin:24px 0;border:1px solid #e0e0e0;">
            <h3 style="color:#1a1a2e;margin-top:0;">📋 Booking Summary</h3>
            <table style="width:100%;border-collapse:collapse;font-size:14px;color:#333;">
              <tr style="border-bottom:1px solid #f0f0f0;"><td style="padding:10px 0;color:#888;">Booking ID</td><td style="padding:10px 0;font-weight:bold;">#${bookingRef}</td></tr>
              <tr style="border-bottom:1px solid #f0f0f0;"><td style="padding:10px 0;color:#888;">Service</td><td style="padding:10px 0;font-weight:bold;">${safeService}</td></tr>
              <tr style="border-bottom:1px solid #f0f0f0;"><td style="padding:10px 0;color:#888;">Location</td><td style="padding:10px 0;">${safeLocation}</td></tr>
              <tr style="border-bottom:1px solid #f0f0f0;"><td style="padding:10px 0;color:#888;">Scheduled Date</td><td style="padding:10px 0;">${safeDate}</td></tr>
              <tr><td style="padding:10px 0;color:#888;">Scheduled Time</td><td style="padding:10px 0;">${safeTime}</td></tr>
            </table>
          </div>
          <p style="color:#555;font-size:14px;">Our team will reach out to you shortly. Call us at <strong>+91 9811797407</strong>.</p>
          <div style="margin-top:32px;padding-top:20px;border-top:1px solid #e0e0e0;color:#aaa;font-size:12px;">
            Thank you for choosing <strong>Boys@Work</strong> — Reliable home services in Delhi NCR.
          </div>
        </div>
      `
    )

    // ─── 🔴 ADMIN ALERT ───────────────────────────────────────────────────────
    const adminResult = await sendEmail(
      RESEND_API_KEY,
      ADMIN_EMAIL,
      `🚨 New Booking #${bookingRef} — ${safeName}`,
      `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff3f3;padding:32px;border-radius:12px;">
          <h1 style="color:#c0392b;font-size:22px;">🚨 New Booking Alert</h1>
          <p style="color:#555;font-size:14px;">A new booking has been placed. Please assign a team member.</p>
          <div style="background:#fff;border-radius:10px;padding:24px;margin:24px 0;border:1px solid #f0c0c0;">
            <table style="width:100%;border-collapse:collapse;font-size:14px;color:#333;">
              <tr style="border-bottom:1px solid #f0f0f0;"><td style="padding:10px 0;color:#888;">Booking ID</td><td style="padding:10px 0;font-weight:bold;">#${bookingRef}</td></tr>
              <tr style="border-bottom:1px solid #f0f0f0;"><td style="padding:10px 0;color:#888;">Customer Name</td><td style="padding:10px 0;font-weight:bold;">${safeName}</td></tr>
              <tr style="border-bottom:1px solid #f0f0f0;"><td style="padding:10px 0;color:#888;">Email</td><td style="padding:10px 0;">${safeEmail}</td></tr>
              <tr style="border-bottom:1px solid #f0f0f0;"><td style="padding:10px 0;color:#888;">Phone</td><td style="padding:10px 0;">${safePhone}</td></tr>
              <tr style="border-bottom:1px solid #f0f0f0;"><td style="padding:10px 0;color:#888;">Service</td><td style="padding:10px 0;font-weight:bold;">${safeService}</td></tr>
              <tr style="border-bottom:1px solid #f0f0f0;"><td style="padding:10px 0;color:#888;">Location</td><td style="padding:10px 0;">${safeLocation}</td></tr>
              <tr style="border-bottom:1px solid #f0f0f0;"><td style="padding:10px 0;color:#888;">Scheduled Date</td><td style="padding:10px 0;">${safeDate}</td></tr>
              <tr><td style="padding:10px 0;color:#888;">Scheduled Time</td><td style="padding:10px 0;">${safeTime}</td></tr>
            </table>
          </div>
          <p style="color:#888;font-size:12px;">Triggered automatically by the booking system.</p>
        </div>
      `
    )

    console.log("Email results:", { user: userResult, admin: adminResult })

    return new Response(
      JSON.stringify({ success: true, bookingRef, user: userResult, admin: adminResult }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } }
    )
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unexpected error"
    console.error("send-email error:", msg)
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    )
  }
})
