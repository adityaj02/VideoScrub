const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    serviceId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true },
    category: { type: String, default: "" },
    rating: { type: String, default: "4.5" },
    reviews: { type: String, default: "0" },
    imageUrl: { type: String, default: "" },
    subServices: [{ type: String }],
    tags: [{ type: String }],
    themeColor: { type: String, default: "#000000" },
    lightColor: { type: String, default: "#f1f5f9" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Service", serviceSchema);
