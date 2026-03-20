import { serve } from "https://deno.land/std/http/server.ts"

serve(async (req) => {
  // CORS configuration
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    })
  }

  try {
    const { name, phone, email, service, location, date, time } = await req.json()

    const token = Deno.env.get("WHATSAPP_TOKEN")
    const phoneNumberId = Deno.env.get("PHONE_NUMBER_ID")

    let cleanPhone = phone.replace(/\D/g, "");
    if (!cleanPhone.startsWith("91")) {
      cleanPhone = "91" + cleanPhone;
    }

    // 🔴 ADMIN MESSAGE
    await fetch(`https://graph.facebook.com/v22.0/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: "919319409696", // 🔥 admin number 
        type: "text",
        text: {
          body: `🚨 New Booking

Name: ${name}
Phone: ${cleanPhone}
Email: ${email}
Service: ${service}
Location: ${location}
Date: ${date}
Time: ${time}`,
        },
      }),
    })

    // 🟢 USER MESSAGE
    await fetch(`https://graph.facebook.com/v22.0/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: cleanPhone,
        type: "text",
        text: {
          body: `Hello ${name},

Your booking is confirmed ✅

Service: ${service}
Date: ${date}
Time: ${time}
Location: ${location}

We will contact you shortly.`,
        },
      }),
    })

    return new Response(JSON.stringify({ success: true, message: "WhatsApp Sent" }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  }
})
