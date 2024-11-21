const mongoose = require("mongoose")

const orderSchema = new mongoose.Schema({
    customerInfo: {
        fullName: String,
        phone: String,
        address: String
    },
    products: [{
        product_id: String,
        quantity: Number
    }]
}, {
    timestamps: true
})

const Order = mongoose.model("Order", orderSchema, "orders")

module.exports = Order