const mongoose = require("mongoose");
const slug = require("mongoose-slug-updater")
mongoose.plugin(slug)

const productCategorySchema = new mongoose.Schema({
    title: String,
    parent_id: {
        type: String,
        default: ""
    },
    description: String,
    thumbnail: String,
    status: String,
    position: Number,
    createdBy: {
        account_id: String,
        createdAt: {
            type: Date,
            default: new Date()
        }
    },
    slug: {
        type: String,
        slug: "title",
        unique: true
    },
    deleted: {
        type: Boolean,
        default: false
    },
    updatedBy: [{
        account_id: String,
        updatedAt: Date
    }],
    deletedBy: {
        account_id: String,
        deletedAt: Date
    }
}, {
    timestamps: true
})

const ProductCategory = mongoose.model('ProductCategory', productCategorySchema, "product-category")

module.exports = ProductCategory