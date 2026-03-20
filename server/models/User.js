const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    supabaseId: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true
    },
    name: String,
    phone: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("User", userSchema);
