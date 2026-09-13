const express = require("express");
const router = express.Router();
const Blog = require("../models/Blog");

// GET /api/blogs — list all blogs
router.get("/", async (_req, res) => {
  try {
    const blogs = await Blog.find().sort({ publishedAt: -1 });
    res.status(200).json(blogs);
  } catch (err) {
    console.error("Blog fetch failed:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/blogs/:slug — single blog by slug
router.get("/:slug", async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug });
    if (!blog) return res.status(404).json({ error: "Blog not found" });
    res.status(200).json(blog);
  } catch (err) {
    console.error("Blog fetch failed:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/blogs — create blog
router.post("/", async (req, res) => {
  try {
    const blog = await Blog.create(req.body);
    res.status(201).json(blog);
  } catch (err) {
    console.error("Blog create failed:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/blogs/:slug — update blog
router.put("/:slug", async (req, res) => {
  try {
    const blog = await Blog.findOneAndUpdate(
      { slug: req.params.slug },
      { $set: req.body },
      { new: true }
    );
    if (!blog) return res.status(404).json({ error: "Blog not found" });
    res.status(200).json(blog);
  } catch (err) {
    console.error("Blog update failed:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
