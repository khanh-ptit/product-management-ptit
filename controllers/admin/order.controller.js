const Product = require("../../models/product.model")
const Order = require("../../models/order.model")
const Account = require("../../models/account.model")
const systemConfig = require("../../config/system")
const filterStatusHelper = require("../../helpers/filterStatusOrder")
const paginationHelper = require("../../helpers/pagination")
const searchHelper = require("../../helpers/search")
const sendMailHelper = require("../../helpers/sendMail")

// [GET] /admin/orders
module.exports.index = async (req, res) => {
    const role = res.locals.role;

    // Kiểm tra quyền "products_view"
    if (!role.permissions.includes("orders_view")) {
        res.redirect(`${systemConfig.prefixAdmin}/error/403`)
        return
    }

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
    const role = res.locals.role;

    // Kiểm tra quyền "products_view"
    if (!role.permissions.includes("orders_create")) {
        res.redirect(`${systemConfig.prefixAdmin}/error/403`)
        return
    }

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

module.exports.createPost = async (req, res) => {
    try {
        req.body.createdBy = {
            account_id: res.locals.user.id,
        };
        const newOrder = new Order(req.body);

        for (const product of newOrder.products) {
            const infoProduct = await Product.findOne({
                _id: product.product_id,
                deleted: false,
            });

            if (!infoProduct) {
                req.flash("error", "Sản phẩm không tồn tại hoặc đã bị xóa!");
                res.redirect("back");
                return;
            }

            // Kiểm tra số lượng tồn kho
            if (product.quantity > infoProduct.stock) {
                req.flash("error", "Bạn đã mua quá số lượng sản phẩm còn lại!");
                res.redirect("back");
                return;
            }

            // Cập nhật số lượng tồn kho và số lượng bán
            product.infoProduct = infoProduct; // Gắn thông tin sản phẩm vào đơn hàng
            await Product.updateOne(
                { _id: infoProduct._id },
                {
                    stock: infoProduct.stock - product.quantity,
                    sold: infoProduct.sold + product.quantity,
                }
            );
        }

        // Render HTML email
        const customerEmail = newOrder.customerInfo.email;
        const subject = `Xác nhận đặt hàng thành công`;
        const html = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Order Confirmation</title>
                <style>
                    body { font-family: Arial, sans-serif; background: #f9f9f9; color: #333; }
                    .container { max-width: 600px; margin: 20px auto; background: #fff; border-radius: 8px; padding: 20px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); }
                    .header { background: #4e73df; color: #fff; padding: 15px; text-align: center; border-radius: 8px 8px 0 0; }
                    .header h1 { margin: 0; font-size: 24px; }
                    .content { padding: 20px; }
                    .content p { margin: 10px 0; font-size: 16px; line-height: 1.5; }
                    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
                    table th, table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    table th { background-color: #4e73df; color: #fff; }
                    table tr:nth-child(even) { background-color: #f2f2f2; }
                    .total { font-size: 18px; font-weight: bold; margin-top: 15px; }
                    .footer { margin-top: 20px; text-align: center; color: #888; font-size: 14px; }
                    .footer a { color: #4e73df; text-decoration: none; }
                    .highlight {
                        color: #e74a3b; 
                        font-size: 18px; 
                        font-weight: bold; 
                        text-align: center; 
                        margin-top: 20px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Đặt hàng thành công</h1>
                    </div>
                    <div class="content">
                        <p>Xin chào <b>${newOrder.customerInfo.fullName}</b>,</p>
                        <p>Cảm ơn bạn đã đặt hàng tại cửa hàng 1st Store!</p>
                        <p><strong>Thông tin đơn hàng:</strong></p>
                        <table>
                            <thead>
                                <tr>
                                    <th>Sản phẩm</th>
                                    <th>Số lượng</th>
                                    <th>Giá</th>
                                    <th>Thành tiền</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${newOrder.products
                                    .map(
                                        (product) => `
                                    <tr>
                                        <td>${product.infoProduct.title}</td>
                                        <td>${product.quantity}</td>
                                        <td>$${product.infoProduct.price.toFixed(2)}</td>
                                        <td>$${(product.quantity * product.infoProduct.price).toFixed(2)}</td>
                                    </tr>`
                                    )
                                    .join("")}
                            </tbody>
                        </table>
                        <p class="total">Tổng giá trị đơn hàng: $${newOrder.products
                            .reduce(
                                (total, product) =>
                                    total +
                                    product.quantity * product.infoProduct.price,
                                0
                            )
                            .toFixed(2)}</p>
                        <p class="highlight">Vui lòng thanh toán số tiền trên cho nhân viên khi nhận hàng.</p>
                        <p>Trân trọng,</p>
                        <p>Đội ngũ hỗ trợ khách hàng</p>
                    </div>
                    <div class="footer">
                        <p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi qua <a href="mailto:khanhhs11vtt@gmail.com">khanhhs11vtt@gmail.com</a>.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        // Gửi email
        await sendMailHelper.sendMail(customerEmail, subject, html);

        // Lưu đơn hàng
        await newOrder.save();
        // res.send("OK")
        req.flash("success", "Tạo đơn hàng thành công!");
        res.redirect(`${systemConfig.prefixAdmin}/orders`);
    } catch (error) {
        console.error(error);
        req.flash("error", "Đã xảy ra lỗi khi tạo đơn hàng!");
        res.redirect("back");
    }
};

// [GET] /admin/orders/detail/:id
module.exports.detail = async (req, res) => {
    const role = res.locals.role;

    // Kiểm tra quyền "products_view"
    if (!role.permissions.includes("orders_view")) {
        res.redirect(`${systemConfig.prefixAdmin}/error/403`)
        return
    }

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
    try {
        const status = req.params.status;
        const id = req.params.id;


        // Cập nhật trạng thái đơn hàng
        const order = await Order.findOneAndUpdate(
            { _id: id },
            { status: status },
            { new: true } // Trả về bản ghi sau khi cập nhật
        );

        if (!order) {
            req.flash("error", "Không tìm thấy đơn hàng!");
            return res.redirect("back");
        }

        for (const product of order.products) {
            const infoProduct = await Product.findOne({
                _id: product.product_id,
                deleted: false,
            });

            if (!infoProduct) {
                req.flash("error", "Sản phẩm không tồn tại hoặc đã bị xóa!");
                res.redirect("back");
                return;
            }

            product.infoProduct = infoProduct; // Gắn thông tin sản phẩm vào đơn hàng
        }

        const customerEmail = order.customerInfo.email; // Email khách hàng từ thông tin đơn hàng
        const subject = "Xác nhận thanh toán đơn hàng";
        const html = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Xác nhận thanh toán đơn hàng</title>
                <style>
                    body {
                        font-family: "Nunito", Arial, sans-serif;
                        background-color: #f8f9fc;
                        margin: 0;
                        padding: 0;
                    }
                    .container {
                        max-width: 600px;
                        margin: 20px auto;
                        background-color: #ffffff;
                        border-radius: 0.35rem;
                        box-shadow: 0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15);
                    }

                    /* Header */
                    .header {
                        background-color: #4e73df;
                        color: #ffffff;
                        padding: 20px;
                        text-align: center;
                        border-top-left-radius: 0.35rem;
                        border-top-right-radius: 0.35rem;
                    }
                    .header h2 {
                        margin: 0;
                        font-size: 24px;
                        font-weight: 700;
                    }

                    /* Nội dung */
                    .content {
                        padding: 20px;
                        color: #5a5c69;
                    }
                    .content p {
                        margin: 10px 0;
                        font-size: 16px;
                        line-height: 1.5;
                    }
                    .content .highlight {
                        color: #4e73df;
                        font-weight: 700;
                    }

                    /* Footer */
                    .footer {
                        background-color: #f8f9fc;
                        padding: 15px;
                        text-align: center;
                        font-size: 14px;
                        color: #858796;
                        border-bottom-left-radius: 0.35rem;
                        border-bottom-right-radius: 0.35rem;
                    }
                    .footer a {
                        color: #4e73df;
                        text-decoration: none;
                    }
                    .footer a:hover {
                        text-decoration: underline;
                    }

                    /* Tổng giá trị */
                    .total {
                        font-size: 18px;
                        font-weight: 700;
                        color: #1cc88a;
                        margin-top: 15px;
                        text-align: right;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <!-- Header -->
                    <div class="header">
                        <h2>Xác nhận thanh toán đơn hàng</h2>
                    </div>

                    <!-- Nội dung -->
                    <div class="content">
                        <p>Xin chào <b>${order.customerInfo.fullName}</b>,</p>
                        <p>Đơn hàng của bạn đã được thanh toán thành công!</p>
                        <p><strong>Mã đơn hàng:</strong> ${order._id}</p>
                        <p><strong>Tổng giá trị đơn hàng:</strong> $${order.products
                            .reduce((total, product) => total + product.quantity * product.infoProduct.price, 0)
                            .toFixed(2)}</p>

                        <p>Cảm ơn bạn đã mua hàng tại cửa hàng <span class="highlight">1st Store</span>!</p>
                        <p>Trân trọng,</p>
                        <p>Đội ngũ hỗ trợ khách hàng</p>
                    </div>

                    <!-- Footer -->
                    <div class="footer">
                        <p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi qua <a href="mailto:khanhhs11vtt@gmail.com">khanhhs11vtt@gmail.com</a>.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        sendMailHelper.sendMail(customerEmail, subject, html)

        // Chỉ tính profit nếu trạng thái là "paid"
        if (status === "paid") {
            // Lấy thông tin nhân viên từ người tạo đơn hàng
            const user = await Account.findOne({ _id: order.createdBy.account_id });

            if (!user) {
                req.flash("error", "Không tìm thấy tài khoản người tạo đơn hàng!");
                return res.redirect("back");
            }

            // Tính toán profit
            const productIds = order.products.map((p) => p.product_id); // Lấy danh sách product_id
            const products = await Product.find({ _id: { $in: productIds } }); // Lấy thông tin các sản phẩm

            let totalProfit = user.profit;
            for (const product of order.products) {
                const productInfo = products.find((p) => p._id.equals(product.product_id));
                if (productInfo) {
                    totalProfit += productInfo.price * product.quantity;
                }
            }

            // Cập nhật profit cho nhân viên
            await Account.updateOne({ _id: user._id }, { profit: totalProfit });
        }

        req.flash("success", "Cập nhật trạng thái thành công cho đơn hàng!");
        res.redirect("back");
    } catch (error) {
        console.error("Lỗi khi cập nhật trạng thái đơn hàng:", error);
        req.flash("error", "Đã xảy ra lỗi khi cập nhật trạng thái đơn hàng.");
        res.redirect("back");
    }
};

// [GET] /admin/orders/print/:id
module.exports.print = async (req, res) => {
    const role = res.locals.role;

    if (!role.permissions.includes("orders_print")) {
        res.redirect(`${systemConfig.prefixAdmin}/error/403`)
        return
    }

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
            req.flash("error", "Hóa đơn không tồn tại !")
            res.redirect("back")
            return
        }

        if (order.status != "paid") {
            req.flash("error", "Đơn hàng cần phải được thanh toán trước khi in hóa đơn !")
            res.redirect("back")
            return
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

//[PATCH] /admin/orders/change-multi
module.exports.changeMulti = async (req, res) => {
    const type = req.body.type;
    const ids = req.body.ids.split(", ");

    switch (type) {
        case "delete-all":
            await Order.updateMany({
                _id: {
                    $in: ids
                }
            }, {
                deleted: true,
            })
            req.flash("success", `Xóa ${ids.length} đơn hàng thành công`)
            break
        default:
            break
    }
    res.redirect("back")
    // res.send("OK")
}

// [DELETE] /admin/orders/delete/:id
module.exports.deleteItem = async (req, res) => {
    const id = req.params.id

    await Order.updateOne({
        _id: id
    }, {
        deleted: true
    })
    req.flash("success", "Xóa đơn hàng thành công!")
    res.redirect("back")
}