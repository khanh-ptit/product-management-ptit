const Product = require("../../models/product.model");
const Account = require("../../models/account.model");
const Order = require("../../models/order.model");

// Hàm lấy danh sách doanh thu 6 tháng gần nhất
async function getLastSixMonths() {
    const profits = [];
    const labels = [];
    for (let i = 0; i < 6; i++) {
        const startOfMonth = new Date();
        startOfMonth.setMonth(startOfMonth.getMonth() - i);
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const endOfMonth = new Date();
        endOfMonth.setMonth(endOfMonth.getMonth() - i + 1);
        endOfMonth.setDate(0);
        endOfMonth.setHours(23, 59, 59, 999);

        const orders = await Order.find({
            createdAt: {
                $gte: startOfMonth,
                $lt: endOfMonth
            },
            deleted: false
        }).populate({
            path: 'products.product_id',
            model: 'Product',
            select: 'price'
        });

        let totalProfit = 0;
        for (const order of orders) {
            for (const product of order.products) {
                if (product.product_id && product.product_id.price !== undefined) {
                    totalProfit += product.product_id.price * product.quantity;
                }
            }
        }

        // Lấy tên tháng từ đối tượng `startOfMonth`
        const monthName = startOfMonth.toLocaleString("vi-VN", { month: "long" });
        labels.push(monthName.charAt(0).toUpperCase() + monthName.slice(1)); // Capitalize first letter
        profits.push(totalProfit);
    }

    return { labels: labels.reverse(), profits: profits.reverse() }; // Đảo ngược thứ tự để hiển thị từ cũ đến mới
}

// [GET] /admin/dashboard
module.exports.index = async (req, res) => {
    try {
        const countProducts = await Product.countDocuments({ deleted: false });
        const countAccounts = await Account.countDocuments({ deleted: false });
        const countOrderUnpaid = await Order.countDocuments({ status: "unpaid" });

        const countProductsActive = await Product.countDocuments({ deleted: false, status: "active" });
        const countProductsInactive = await Product.countDocuments({ deleted: false, status: "inactive" });
        const totalProducts = countProducts || 1;
        const activePercentage = ((countProductsActive / totalProducts) * 100).toFixed(2);
        const inactivePercentage = ((countProductsInactive / totalProducts) * 100).toFixed(2);

        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const endOfMonth = new Date();
        endOfMonth.setMonth(endOfMonth.getMonth() + 1);
        endOfMonth.setDate(0);
        endOfMonth.setHours(23, 59, 59, 999);

        const ordersThisMonth = await Order.find({
            createdAt: {
                $gte: startOfMonth,
                $lt: endOfMonth
            },
            deleted: false
        }).populate({
            path: 'products.product_id',
            model: 'Product',
            select: 'price'
        });

        let totalThisMonthProfit = 0;
        for (const order of ordersThisMonth) {
            for (const product of order.products) {
                if (product.product_id && product.product_id.price !== undefined) {
                    totalThisMonthProfit += product.product_id.price * product.quantity;
                }
            }
        }

        // Gọi hàm lấy dữ liệu doanh thu 6 tháng gần nhất
        const { labels, profits } = await getLastSixMonths();

        // Render view với dữ liệu
        res.render("admin/pages/dashboard.pug", {
            pageTitle: "Trang tổng quan",
            countProducts,
            countAccounts,
            countOrderUnpaid,
            activePercentage,
            inactivePercentage,
            totalThisMonthProfit,
            lastSixMonthsProfits: JSON.stringify(profits), // Truyền dữ liệu doanh thu
            lastSixMonthsLabels: JSON.stringify(labels) // Truyền dữ liệu tên tháng
        });
    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu dashboard:", error);
        res.status(500).send("Đã xảy ra lỗi khi tải trang tổng quan.");
    }
};
