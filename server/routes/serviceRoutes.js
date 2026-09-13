const express = require("express");
const router = express.Router();
const Service = require("../models/Service");

// GET /api/services — list all services
router.get("/", async (_req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: 1 });
    res.status(200).json(services);
  } catch (err) {
    console.error("Service fetch failed:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/services/:id — single service
router.get("/:id", async (req, res) => {
  try {
    const service = await Service.findOne({ serviceId: req.params.id });
    if (!service) return res.status(404).json({ error: "Service not found" });
    res.status(200).json(service);
  } catch (err) {
    console.error("Service fetch failed:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/services — create service
router.post("/", async (req, res) => {
  try {
    const service = await Service.create(req.body);
    res.status(201).json(service);
  } catch (err) {
    console.error("Service create failed:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/services/:id — update service
router.put("/:id", async (req, res) => {
  try {
    const service = await Service.findOneAndUpdate(
      { serviceId: req.params.id },
      { $set: req.body },
      { new: true }
    );
    if (!service) return res.status(404).json({ error: "Service not found" });
    res.status(200).json(service);
  } catch (err) {
    console.error("Service update failed:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
