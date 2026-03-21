async function testEdge() {
  const url = "https://hrtvfwamirrmhzncscrr.supabase.co/functions/v1/send-whatsapp";
  const body = {
    name: "Aditya Test",
    phone: "9319409696", 
    email: "aditya@example.com",
    service: "AC Repair",
    location: "Delhi, Sector 32",
    date: "2026-10-10",
    time: "14:30"
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
    
    const data = await res.json();
    console.log("Edge Function Response:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Fetch failed:", err);
  }
}
testEdge();
