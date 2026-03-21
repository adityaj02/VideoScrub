import { serve } from "https://deno.land/std/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ADMIN_PHONE = Deno.env.get("WHATSAPP_ADMIN_PHONE") ?? "919319409696"

const normalizePhone = (value: string) => {
  const clean = String(value || "").replace(/\D/g, "")
  if (!clean) return ""
  if (clean.length === 10) return `91${clean}`
  return clean
}

const maskPhone = (value: string) => {
  if (!value) return "N/A"
  const visible = value.slice(-4)
  return `${"*".repeat(Math.max(0, value.length - 4))}${visible}`
}

const sendTextMessage = async ({
  token,
  phoneNumberId,
  to,
  body,
}: {
  token: string
  phoneNumberId: string
  to: string
  body: string
}) => {
  const response = await fetch(`https://graph.facebook.com/v22.0/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body },
    }),
  })

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(`WhatsApp API failed (${response.status}): ${JSON.stringify(payload)}`)
  }
  return payload
}

serve(async (req) => {
  // CORS configuration
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { name, phone, email, service, location, date, time } = await req.json()

    const token = Deno.env.get("WHATSAPP_TOKEN")
    const phoneNumberId = Deno.env.get("PHONE_NUMBER_ID")
    const supportNumber = Deno.env.get("WHATSAPP_SUPPORT_NUMBER") ?? "+91 9811797407"

    if (!token || !phoneNumberId) {
      return new Response(JSON.stringify({
        error: "Missing WhatsApp configuration. Set WHATSAPP_TOKEN and PHONE_NUMBER_ID in function secrets.",
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    const cleanPhone = normalizePhone(phone)
    if (!cleanPhone || cleanPhone.length < 10 || cleanPhone.length > 15) {
      return new Response(JSON.stringify({ error: "Invalid customer phone number." }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    const bookingRef = `BW-${Date.now().toString().slice(-8)}`
    const safeName = String(name || "Customer").trim()
    const safeEmail = String(email || "Not provided").trim()
    const safeService = String(service || "General Service").trim()
    const safeLocation = String(location || "Location pending").trim()
    const safeDate = String(date || "Flexible").trim()
    const safeTime = String(time || "Flexible").trim()

    // 🔴 ADMIN MESSAGE
    await sendTextMessage({
      token,
      phoneNumberId,
      to: ADMIN_PHONE,
      body: `🚨 New Booking Alert
Ref: ${bookingRef}
Customer: ${safeName}
Phone: +${cleanPhone}
Email: ${safeEmail}
Services: ${safeService}
Location: ${safeLocation}
Schedule: ${safeDate} at ${safeTime}
Booked via: Boys@Work App`,
    })

    // 🟢 USER MESSAGE
    await sendTextMessage({
      token,
      phoneNumberId,
      to: cleanPhone,
      body: `Hi ${safeName} 👋
Your booking is confirmed ✅
Ref: ${bookingRef}
Service(s): ${safeService}
Visit slot: ${safeDate} at ${safeTime}
Address: ${safeLocation}

Our team will call you shortly to reconfirm.
Need urgent help? Reply here or call ${supportNumber}.`,
    })

    return new Response(JSON.stringify({
      success: true,
      message: "WhatsApp notifications sent",
      bookingRef,
      recipient: maskPhone(cleanPhone),
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    })
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unexpected error while sending WhatsApp notifications."
    return new Response(JSON.stringify({ error: errorMessage }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    })
  }
})
