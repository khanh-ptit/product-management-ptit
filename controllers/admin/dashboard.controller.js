const Product = require("../../models/product.model");
const Account = require("../../models/account.model");

// [GET] /admin/dashboard
module.exports.index = async (req, res) => {
    try {
        // Đếm tổng số sản phẩm (không bị xóa)
        const countProducts = await Product.countDocuments({
            deleted: false
        });

        // Đếm tổng số tài khoản (không bị xóa)
        const countAccounts = await Account.countDocuments({
            deleted: false
        });

        // Đếm số sản phẩm đang hoạt động
        const countProductsActive = await Product.countDocuments({
            deleted: false,
            status: "active"
        });

        // Đếm số sản phẩm dừng hoạt động
        const countProductsInactive = await Product.countDocuments({
            deleted: false,
            status: "inactive"
        });

        // Tính phần trăm cho các sản phẩm "Hoạt động" và "Dừng hoạt động"
        const totalProducts = countProducts || 1; // Đảm bảo không chia cho 0
        const activePercentage = ((countProductsActive / totalProducts) * 100).toFixed(2);
        const inactivePercentage = ((countProductsInactive / totalProducts) * 100).toFixed(2);

        // Render view với dữ liệu
        res.render("admin/pages/dashboard.pug", {
            pageTitle: "Trang tổng quan",
            countProducts: countProducts,
            countAccounts: countAccounts,
            activePercentage: activePercentage,
            inactivePercentage: inactivePercentage,
        });
    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu dashboard:", error);
        res.status(500).send("Đã xảy ra lỗi khi tải trang tổng quan.");
    }
};
