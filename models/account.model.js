const mongoose = require("mongoose")
const generate = require("../helpers/generate")

const accountSchema = new mongoose.Schema({
    fullName: String,
    email: String,
    password: String,
    token: {
        type: String,
        default: () => generate.generateRandomString(30)
    },
    phone: String,
    avatar: {
        type: String,
        default: "https://cellphones.com.vn/sforum/wp-content/uploads/2023/10/avatar-trang-4.jpg"
    },
    address: String,
    deleted: {
        type: Boolean,
        default: false
    },
    role_id: String,
    status: {
        type: String,
        default: "active"
    },
    profit: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
})

const Account = mongoose.model("Account", accountSchema, "accounts")

module.exports = Account