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

const sendMessage = async ({
  token,
  phoneNumberId,
  to,
  type = "template",
  textBody,
}: {
  token: string
  phoneNumberId: string
  to: string
  type?: "text" | "template"
  textBody?: string
}) => {
  const payload = type === "template"
    ? {
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: "hello_world", // Using the default test template as requested in your curl
          language: { code: "en_US" }
        }
      }
    : {
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: textBody },
      }

  const response = await fetch(`https://graph.facebook.com/v22.0/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  const responseData = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(`WhatsApp API failed (${response.status}): ${JSON.stringify(responseData)}`)
  }
  return responseData
}

serve(async (req) => {
  // CORS configuration
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { name, phone, email, service, location, date, time } = await req.json()

    const token = Deno.env.get("WHATSAPP_TOKEN") || "EAARqUY7UA0cBRFCUM1i89cZCrlh9DviVRqTZCO5ToyAIrvR6b4waVD7zOFjPBCDTxV7FgHiUyalQVB0S79Hs7w6mh7xAApRfcc5JfOiexDNc7PuAhwZBRyIT4aDF0J7Yj9MHHPrCdQHUH62movoVwwRsZC35DkY3t4xcKGZCE0RT3aXPNUOPpQU4Wz6IArIZAGsjcVsFMQ6jWw7BITWjSCUALLVJzkbDHyKJsWw91fJ4Hgd2u499haR0MPEr9KNyvijtQAZCLWZAqqfTrwYZClIO5Lf8ZD"
    const phoneNumberId = Deno.env.get("PHONE_NUMBER_ID") || "1063051450223385"
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

    const results: Record<string, any> = { admin: null, user: null }

    const cleanAdminPhone = normalizePhone(ADMIN_PHONE)

    // 🔴 ADMIN MESSAGE
    try {
      results.admin = await sendMessage({
        token,
        phoneNumberId,
        to: cleanAdminPhone,
        type: "text",
        textBody: `📢 New Booking Received: Houserve

An order has been placed through the platform. Please assign a team member immediately.

🛠️ Service Required: ${safeService}
📞 Customer Contact: +${cleanPhone}
📍 Location: ${safeLocation}
🗓️ Booking ID: #${bookingRef}
🕒 Time: ${safeDate} at ${safeTime}

Please confirm the technician's availability in the dashboard.`,
      })
    } catch (e) {
      console.error("Admin message failed:", e)
      results.admin = { error: e instanceof Error ? e.message : String(e) }
    }

    // 🟢 USER MESSAGE
    try {
      results.user = await sendMessage({
        token,
        phoneNumberId,
        to: cleanPhone,
        type: "text",
        textBody: `✅ Booking Confirmed!

Hello ${safeName},

Thank you for choosing Houserve. Your request for ${safeService} has been successfully received and confirmed.

Details:
📍 Location: ${safeLocation}
🛠️ Service: ${safeService}
🆔 Booking ID: ${bookingRef}

Our team member will reach out to you shortly to coordinate the visit. If you need to make any changes, please reply directly to this message.

Thank you for letting us serve you!
— Team Houserve`,
      })
    } catch (e) {
      console.error("User message failed:", e)
      results.user = { error: e instanceof Error ? e.message : String(e) }
    }

    return new Response(JSON.stringify({
      success: true,
      message: "WhatsApp notifications sent",
      bookingRef,
      recipient: maskPhone(cleanPhone),
      results,
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
