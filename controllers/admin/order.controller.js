const Product = require("../../models/product.model")

// [GET] /admin/orders/create
module.exports.create = async (req, res) => {
    try {
        const products = await Product.find({
            deleted: false
        }); // Lấy danh sách sản phẩm với id và tên
        // console.log(products)
        res.render("admin/pages/orders/create.pug", {
            pageTitle: "Tạo mới đơn hàng",
            products: products
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi khi tải trang tạo đơn hàng.");
    }
};

// [POST] /admin/orders/create
module.exports.createPost = async (req, res) => {
    console.log(req.body)
    res.send("OK")
}