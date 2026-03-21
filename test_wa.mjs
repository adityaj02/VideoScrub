const token = "EAARqUY7UA0cBRPZAG23B81nvBZAAmhR9E8q8YDJjY1n0LiJqZBT01ledXyyLV2MMGBCRTPRhuxuOkiL4nsCDsfC9B3VYZBMdZCZCm0pJJbMa6w2fRZArp7DMutkLcZCdzVdMR85aPiZB8GKAABv1RFlrf4u0s93kUYjZAE0dF9DmMhhvJZApQ6bWcUNDQHhNeS8BNhA0TLrG4KPBbZBp1HluiM8ZCdv0r92wxk9GdP6ZCEpgqpnwVkio3UauG7srrdqWuuzKfpeQrLPCZCIyGyaYL21eIwP";
const phoneNumberId = "1063051450223385";
const to = "919319409696";

async function test() {
  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: { body: `📢 New Booking Received: Houserve

An order has been placed through the platform. Please assign a team member immediately.

🛠️ Service Required: Plumbing
📞 Customer Contact: +919876543210
📍 Location: Test Address
🗓️ Booking ID: #BW-123456
🕒 Time: Flexible at 10:00

Please confirm the technician's availability in the dashboard.` },
  };

  const response = await fetch(`https://graph.facebook.com/v22.0/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  console.log("Status:", response.status);
  console.log("Data:", JSON.stringify(data, null, 2));
}
test();
