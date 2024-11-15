const Product = require("../../models/product.model")

// [GET] /admin/dashboard
module.exports.index = async (req, res) => {
    const products = await Product.find({})
    // console.log(products)
    res.render("admin/pages/dashboard.pug", {
        pageTitle: "Trang tổng quan"
    })
}