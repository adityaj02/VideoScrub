const token = "EAARqUY7UA0cBRFCUM1i89cZCrlh9DviVRqTZCO5ToyAIrvR6b4waVD7zOFjPBCDTxV7FgHiUyalQVB0S79Hs7w6mh7xAApRfcc5JfOiexDNc7PuAhwZBRyIT4aDF0J7Yj9MHHPrCdQHUH62movoVwwRsZC35DkY3t4xcKGZCE0RT3aXPNUOPpQU4Wz6IArIZAGsjcVsFMQ6jWw7BITWjSCUALLVJzkbDHyKJsWw91fJ4Hgd2u499haR0MPEr9KNyvijtQAZCLWZAqqfTrwYZClIO5Lf8ZD";
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
