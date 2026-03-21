// Quick test — calls the deployed send-email edge function directly
const SUPABASE_URL = "https://hrtvfwamirrmhzncscrr.supabase.co"
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhydHZmd2FtaXJybWh6bmNzY3JyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzMzk5MzAsImV4cCI6MjA4NzkxNTkzMH0.wplMJTkMfI0xi6qIwBAUOl00bovxepTiGnAoNwPK0co"

const res = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${ANON_KEY}`,
  },
  body: JSON.stringify({
    name: "Test User",
    email: "ankit16.2005@gmail.com",   // ← the profile email from DB screenshot
    phone: "9233315953",
    service: "Electrical",
    location: "Mundian Khurd",
    date: "2026-03-25",
    time: "12:00",
  }),
})

const data = await res.json()
console.log("Status:", res.status)
console.log("Response:", JSON.stringify(data, null, 2))
