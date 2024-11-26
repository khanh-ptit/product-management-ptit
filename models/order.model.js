const mongoose = require("mongoose")

const orderSchema = new mongoose.Schema({
    customerInfo: {
        fullName: String,
        phone: String,
        address: String,
        email: String
    },
    products: [{
        product_id: String,
        quantity: Number
    }],
    status: {
        type: String,
        default: "unpaid"
    },
    createdBy: {
        account_id: String,
        createdAt: {
            type: Date,
            default: new Date()
        }
    },
    updatedBy: [{
        account_id: String,
        updatedAt: Date
    }],
    deletedBy: {
        account_id: String,
        deletedAt: Date
    },
    deleted: {
        type: Boolean,
        default: false
    },
    totalPrice: Number
}, {
    timestamps: true
})

const Order = mongoose.model("Order", orderSchema, "orders")

module.exports = Order