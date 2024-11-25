const Product = require("../../models/product.model")
const Order = require("../../models/order.model")
const Account = require("../../models/account.model")
const systemConfig = require("../../config/system")
const filterStatusHelper = require("../../helpers/filterStatusOrder")
const paginationHelper = require("../../helpers/pagination")
const searchHelper = require("../../helpers/search")

// [GET] /admin/orders
module.exports.index = async (req, res) => {
    try {
        const filterStatus = filterStatusHelper(req.query)
        let find = {
            deleted: false
        }

        if (req.query.status) {
            find["status"] = req.query.status
        }

        // Form search
        const objectSearch = searchHelper(req.query)
        if (objectSearch["regex"]) {
            // Dùng regex để tìm kiếm tên khách hàng (customerInfo.fullName)
            find["customerInfo.fullName"] = objectSearch["regex"]
        }   

        // Pagination
        const countOrders = await Order.countDocuments(find)
        let objectPagination = paginationHelper({
            currentPage: 1,
            limitItems: 4
        }, req.query, countOrders)

        // Sort
        let sort = {}

        if (req.query.sortKey && req.query.sortValue) {
            sort[req.query.sortKey] = req.query.sortValue
        } else {
            sort.createdAt = "desc"
        }
        // end sort products

        // Truy vấn danh sách đơn hàng với điều kiện đã lọc
        const orders = await Order
            .find(find)
            .skip(objectPagination.skip)
            .limit(objectPagination.limitItems)
            .sort(sort) 

        // Lấy thông tin bổ sung cho mỗi đơn hàng
        for (const item of orders) {
            // Lấy thông tin tài khoản tạo đơn hàng
            const infoAccountCreate = await Account.findOne({
                _id: item.createdBy.account_id,
                deleted: false
            })
            item.infoAccountCreate = infoAccountCreate

            // Lấy thông tin sản phẩm trong đơn hàng
            for (const product of item.products) {
                const infoProduct = await Product.findOne({
                    _id: product.product_id,
                    deleted: false
                })
                product.infoProduct = infoProduct
            }
        }

        // Trả về dữ liệu để render vào view
        res.render("admin/pages/orders/index.pug", {
            pageTitle: "Danh sách đơn hàng",
            orders, // Truyền danh sách đơn hàng sang view
            filterStatus: filterStatus,
            pagination: objectPagination,
            keyword: objectSearch.keyword,
        });
    } catch (error) {
        req.flash("error", "Lỗi khi lấy danh sách đơn hàng !")
        res.redirect("back")
    }
};

// [GET] /admin/orders/create
module.exports.create = async (req, res) => {
    try {
        const products = await Product.find({
            deleted: false,
            status: "active",
            stock: { $gt: 0 } // Chỉ lấy sản phẩm có stock > 0
        }); // Lấy danh sách sản phẩm
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
    // console.log(req.body)
    req.body.createdBy = {
        account_id: res.locals.user.id
    }
    const newOrder = new Order(req.body)
    for (const product of newOrder.products) {
        const id = product.product_id
        const infoProduct = await Product.findOne({
            _id: id,
            deleted: false
        })
        const currentStock = infoProduct.stock
        if (product.quantity > currentStock) {
            req.flash("error", "Bạn đã mua quá số lượng sản phẩm còn lại !")
            res.redirect("back")
            return
        }
        await Product.updateOne({
            _id: id
        }, {
            stock: currentStock - product.quantity
        })
    }
    console.log(newOrder)
    await newOrder.save()
    req.flash("success", "Tạo đơn hàng thành công !")
    res.redirect(`${systemConfig.prefixAdmin}/orders`)
}

// [GET] /admin/orders/edit/:id
module.exports.edit = async (req, res) => {
    try {
        const id = req.params.id
        const order = await Order.findOne({
            _id: id,
            deleted: false
        })
        // console.log(order)
        for (const product of order.products) {
            const infoProduct = await Product.findOne({
                _id: product.product_id,
                deleted: false
            })
            product.infoProduct = infoProduct
            // console.log(infoProduct)
        }
        const products = await Product.find({
            deleted: false
        })
        res.render("admin/pages/orders/edit.pug", {
            pageTitle: "Chỉnh sửa đơn hàng",
            order: order,
            products: products
        })
    } catch (error) {
        req.flash("error", "Đường dẫn không tồn tại !")
        res.redirect("back")
    }
}

// [GET] /admin/orders/detail/:id
module.exports.detail = async (req, res) => {
    try {
        const orderId = req.params.id;

        // Tìm hóa đơn dựa trên ID
        const order = await Order.findOne({
            _id: orderId,
            deleted: false
        })
           
        if (!order) {
            req.flash("error", "Hóa đơn không tồn tại!");
            return res.redirect(`${systemConfig.prefixAdmin}/orders`);
        }

        for (const product of order.products) {
            const infoProduct = await Product.findOne({
                _id: product.product_id,
                deleted: false
            })
            product.infoProduct = infoProduct
            // console.log(infoProduct)
        }

        // console.log(order.products)

        res.render("admin/pages/orders/detail.pug", {
            order,
            pageTitle: "Chi tiết hóa đơn",
        });
    } catch (err) {
        console.error(err);
        req.flash("error", "Đã xảy ra lỗi khi tải chi tiết hóa đơn.");
        res.redirect(`${systemConfig.prefixAdmin}/orders`);
    }
};

// [PATCH] /admin/orders/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
    const status = req.params.status
    const id = req.params.id
    console.log(status, id)

    await Order.updateOne({
        _id: id
    }, {
        status: status
    })
    req.flash("success", "Cập nhật trạng thái thành công cho đơn hàng !")
    res.redirect("back")
}

// [GET] /admin/orders/print/:id
module.exports.print = async (req, res) => {
    try {
        const id = req.params.id;
        // console.log(id)
        // Tìm hóa đơn dựa trên id
        // const order = await Order.findById(id).populate("products.infoProduct").exec();
        const order = await Order.findOne({
            _id: id
        })
        for (const product of order.products) {
            const infoProduct = await Product.findOne({
                _id: product.product_id,
                deleted: false
            })
            product.infoProduct = infoProduct
            // console.log(infoProduct)
        }
        const infoAccountCreate = await Account.findOne({
            _id: order.createdBy.account_id,
        })
        order.infoAccountCreate = infoAccountCreate
        if (!order) {
            return res.status(404).send("Hóa đơn không tồn tại!");
        }

        // Render giao diện in hóa đơn
        res.render("admin/pages/orders/print", { 
            order, 
            layout: false, // Không dùng layout mặc định, chỉ render trang in 
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Đã xảy ra lỗi khi in hóa đơn.");
    }
};