/**
 * seed.js — Populates MongoDB with initial services, blogs, and sample properties.
 * Run: cd server && node seed.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const Service = require("./models/Service");
const Blog = require("./models/Blog");
const Property = require("./models/Property");

const SERVICES = [
  { serviceId: "a1000000-0000-0000-0000-000000000001", name: "Plumbing", price: 349, description: "Expert plumbing solutions for your home and office. From leaky faucets to complete bathroom installations.", category: "Home", rating: "4.8", reviews: "2,340", imageUrl: "/Assets/plumber.png", subServices: ["Tap Repair & Replacement", "Pipe Leak Repair", "Drain Cleaning", "Gully Trap Cleaning", "Water Tank Repair", "Bath Fitting Install"], tags: ["Sanitary", "Leaks", "Install"], themeColor: "#3b82f6", lightColor: "#dbeafe" },
  { serviceId: "a1000000-0000-0000-0000-000000000002", name: "Electrical", price: 299, description: "Professional electrical services ensuring safety and efficiency. All work compliant with safety standards.", category: "Home", rating: "4.9", reviews: "3,150", imageUrl: "/Assets/electrician.png", subServices: ["Switch & Socket Repair", "Fan Installation", "Light Fitting", "AC Point Installation", "Inverter Service", "Main Board Repair"], tags: ["Wiring", "Faults", "Appliances"], themeColor: "#eab308", lightColor: "#fef9c3" },
  { serviceId: "a1000000-0000-0000-0000-000000000003", name: "Carpentry", price: 499, description: "Skilled carpenters for all wood work needs. Custom furniture, repairs, and installations.", category: "Home", rating: "4.7", reviews: "1,890", imageUrl: "/Assets/carpenter.png", subServices: ["Door Repair", "Furniture Assembly", "Cabinet/Wardrobe Repair", "Lock Fitting", "Hinge Adjustment", "Wood Polishing"], tags: ["Woodwork", "Repairs", "Custom"], themeColor: "#f97316", lightColor: "#ffedd5" },
  { serviceId: "a1000000-0000-0000-0000-000000000004", name: "Painting", price: 1299, description: "Transform your space with professional painting services. Interior, exterior, and decorative painting.", category: "Home", rating: "4.8", reviews: "2,670", imageUrl: "/Assets/painter.png", subServices: ["Wall Painting", "Door & Window Painting", "Texture Painting", "Waterproof Coating", "Metal Priming", "Stencil Art"], tags: ["Interior", "Exterior", "Texture"], themeColor: "#8b5cf6", lightColor: "#ede9fe" },
  { serviceId: "a1000000-0000-0000-0000-000000000005", name: "AC Service", price: 799, description: "Complete AC solutions — installation, repair, and maintenance for all brands and types.", category: "Home", rating: "4.9", reviews: "4,120", imageUrl: "/Assets/ACservices.png", subServices: ["AC Service (Basic)", "AC Deep Cleaning", "AC Installation", "Gas Charging", "PCB Repair", "Copper Piping"], tags: ["Maintenance", "Gas Refill", "Install"], themeColor: "#06b6d4", lightColor: "#cffafe" },
  { serviceId: "a1000000-0000-0000-0000-000000000006", name: "Building", price: 999, description: "Comprehensive building maintenance services for residential and commercial properties.", category: "Commercial", rating: "4.7", reviews: "890", imageUrl: "/Assets/construction.png", subServices: ["General Repairs", "Waterproofing Services", "Pest Control", "Masonry Work", "False Ceiling", "Tiling"], tags: ["Masonry", "Waterproof", "Repairs"], themeColor: "#64748b", lightColor: "#f1f5f9" },
  { serviceId: "a1000000-0000-0000-0000-000000000007", name: "Property", price: 1499, description: "End-to-end property management solutions for landlords and property owners.", category: "Property", rating: "4.6", reviews: "560", imageUrl: "/Assets/real_estate.png", subServices: ["Tenant Finding", "Rent Collection", "Property Inspection", "Legal Assistance", "Inventory Check", "Move-out Cleaning"], tags: ["Management", "Rent", "Legal"], themeColor: "#6366f1", lightColor: "#e0e7ff" },
  { serviceId: "a1000000-0000-0000-0000-000000000008", name: "Facility", price: 599, description: "Complete facility management for offices, buildings, and commercial spaces.", category: "Commercial", rating: "4.8", reviews: "420", imageUrl: "/Assets/services.png", subServices: ["Housekeeping Services", "Security Services", "Pantry Services", "Office Support", "Event Cleaning", "Landscape Care"], tags: ["Cleaning", "Security", "Pantry"], themeColor: "#14b8a6", lightColor: "#ccfbf1" },
];

const BLOGS = [
  {
    title: "Best Deep Cleaning Services in Delhi NCR",
    slug: "best-deep-cleaning-services-in-delhi",
    category: "Cleaning",
    excerpt: "Discover the top-rated deep cleaning services in Delhi NCR. From kitchen to bathroom, learn what professional cleaners offer and how to pick the right one.",
    content: "Deep cleaning goes beyond regular surface cleaning. It targets hard-to-reach areas, removes built-up grime, and sanitizes surfaces. Professional deep cleaning services in Delhi NCR typically include kitchen degreasing, bathroom descaling, floor scrubbing, carpet shampooing, and window cleaning.\n\nWhen choosing a service, look for verified technicians, transparent pricing, and satisfaction guarantees. At Houserve, our deep cleaning packages start at ₹2,499 for a 1BHK and include all equipment and eco-friendly cleaning agents.",
    coverImage: "/Assets/facility.png",
    readTime: "5 min read",
    author: "Houserve Team",
    publishedAt: new Date("2025-03-15"),
  },
  {
    title: "Essential Home Maintenance Tips for Delhi Monsoon",
    slug: "essential-home-maintenance-tips-delhi-monsoon",
    category: "Maintenance",
    excerpt: "Prepare your home for the monsoon season with these essential maintenance tips. Prevent leaks, drainage issues, and electrical hazards.",
    content: "The Delhi monsoon brings heavy rainfall that can cause significant damage to unprepared homes. Here are essential maintenance tips:\n\n1. **Waterproofing**: Inspect and repair terrace waterproofing before monsoon starts.\n2. **Drainage**: Clear all drain pipes and gully traps to prevent water logging.\n3. **Electrical Safety**: Check for exposed wires and ensure all outdoor connections are weatherproof.\n4. **Plumbing**: Fix leaky pipes and taps to prevent water damage during heavy rains.\n5. **Painting**: Apply weather-resistant paint on exterior walls.\n\nBooking a pre-monsoon home inspection with Houserve can help identify potential issues before they become expensive problems.",
    coverImage: "/Assets/plumbing.png",
    readTime: "7 min read",
    author: "Houserve Team",
    publishedAt: new Date("2025-05-20"),
  },
  {
    title: "How to Choose the Right AC Service Provider in Delhi",
    slug: "how-to-choose-the-right-ac-service-provider-delhi",
    category: "AC Service",
    excerpt: "With Delhi's scorching summers, a well-maintained AC is essential. Learn how to find a reliable AC service provider.",
    content: "Finding a trustworthy AC service provider in Delhi can be challenging. Here's what to look for:\n\n1. **Certification**: Ensure technicians are trained and certified for your AC brand.\n2. **Transparent Pricing**: Get a detailed quote before work begins. Avoid services with hidden charges.\n3. **Warranty**: Choose providers who offer service warranties.\n4. **Genuine Parts**: Insist on OEM or equivalent quality replacement parts.\n5. **Reviews**: Check online reviews and ratings before booking.\n\nAt Houserve, our AC service starts with a thorough diagnostic, followed by cleaning, gas pressure check, and performance testing. All services come with a 30-day warranty.",
    coverImage: "/Assets/ac-service.png",
    readTime: "6 min read",
    author: "Houserve Team",
    publishedAt: new Date("2025-04-10"),
  },
];

const PROPERTIES = [
  {
    title: "Modern 3BHK Apartment in Dwarka Sector 12",
    slug: "modern-3bhk-dwarka-sector-12",
    description: "Spacious 3BHK apartment with modern amenities, 24/7 security, and a beautiful community park. East-facing with ample sunlight.",
    price: 8500000,
    type: "apartment",
    status: "available",
    location: { address: "Plot 45, Sector 12, Dwarka", city: "New Delhi", state: "Delhi", pincode: "110078", coordinates: { lat: 28.5921, lng: 77.0460 } },
    specs: { bedrooms: 3, bathrooms: 2, areaSqFt: 1450, furnishedStatus: "semi-furnished" },
    features: ["Parking", "24/7 Security", "Power Backup", "Community Park", "Gym", "Children's Play Area"],
    images: ["/Assets/real_estate.png"],
    seller: { name: "Houserve Properties", phone: "9811797407", email: "properties@houserve.in" },
  },
  {
    title: "Premium Villa in Gurgaon DLF Phase 5",
    slug: "premium-villa-gurgaon-dlf-phase-5",
    description: "Luxurious 4BHK independent villa with private garden, modular kitchen, and Italian marble flooring. Gated community with club access.",
    price: 35000000,
    type: "villa",
    status: "available",
    location: { address: "DLF Phase 5, Sector 43", city: "Gurgaon", state: "Haryana", pincode: "122009", coordinates: { lat: 28.4595, lng: 77.0266 } },
    specs: { bedrooms: 4, bathrooms: 4, areaSqFt: 3200, furnishedStatus: "fully-furnished" },
    features: ["Private Garden", "Swimming Pool", "Club Access", "Modular Kitchen", "Italian Marble", "Home Theater"],
    images: ["/Assets/property.png"],
    seller: { name: "Houserve Properties", phone: "9811797407", email: "properties@houserve.in" },
  },
  {
    title: "Commercial Office Space in Connaught Place",
    slug: "commercial-office-connaught-place",
    description: "Prime commercial office space in the heart of Delhi. Ideal for startups and established businesses. Metro connectivity.",
    price: 4500000,
    type: "commercial",
    status: "available",
    location: { address: "Block A, Connaught Place", city: "New Delhi", state: "Delhi", pincode: "110001", coordinates: { lat: 28.6315, lng: 77.2167 } },
    specs: { bedrooms: 0, bathrooms: 2, areaSqFt: 850, furnishedStatus: "unfurnished" },
    features: ["Metro Connectivity", "Parking", "24/7 Security", "Power Backup", "Conference Room", "Pantry Area"],
    images: ["/Assets/services.png"],
    seller: { name: "Houserve Properties", phone: "9811797407", email: "properties@houserve.in" },
  },
];

async function seed() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("Missing MONGO_URI in .env");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  // Seed services
  await Service.deleteMany({});
  await Service.insertMany(SERVICES);
  console.log(`Seeded ${SERVICES.length} services`);

  // Seed blogs
  await Blog.deleteMany({});
  await Blog.insertMany(BLOGS);
  console.log(`Seeded ${BLOGS.length} blogs`);

  // Seed properties
  await Property.deleteMany({});
  await Property.insertMany(PROPERTIES);
  console.log(`Seeded ${PROPERTIES.length} properties`);

  console.log("Seeding complete!");
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
