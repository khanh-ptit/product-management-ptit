const Product = require("../../models/product.model")
const filterStatusHelper = require("../../helpers/filterStatus")
const searchHelper = require("../../helpers/search")
const systemConfig = require("../../config/system")
const paginationHelper = require("../../helpers/pagination")

// [GET] /admin/products
module.exports.index = async (req, res) => {
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
        find["title"] = objectSearch["regex"]
    }

    // Pagination
    const countProducts = await Product.countDocuments(find)
    let objectPagination = paginationHelper({
        currentPage: 1,
        limitItems: 4
    }, req.query, countProducts)

    // Sort
    let sort = {}

    if (req.query.sortKey && req.query.sortValue) {
        sort[req.query.sortKey] = req.query.sortValue
    } else {
        sort.position = "desc"
    }
    // end sort products

    const products = await Product.find(find)
        .sort(sort)
        .limit(objectPagination.limitItems)
        .skip(objectPagination.skip)
    // console.log(products)
    res.render("admin/pages/products/index.pug", {
        pageTitle: "Danh sách sản phẩm",
        products: products,
        filterStatus: filterStatus,
        keyword: objectSearch.keyword,
        pagination: objectPagination,
    })
}

// [PATCH] /admin/products/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
    const status = req.params.status
    const id = req.params.id

    await Product.updateOne({
        _id: id
    }, {
        status: status
    })
    req.flash("success", "Cập nhật trạng thái thành công!")
    res.redirect("back")
}

// [DELETE] /admin/products/delete/:id
module.exports.deleteItem = async (req, res) => {
    const id = req.params.id

    await Product.updateOne({
        _id: id
    }, {
        deleted: true
    })
    req.flash("success", "Xóa sản phẩm thành công!")
    res.redirect("back")
}

//[PATCH] /admin/products/change-multi
module.exports.changeMulti = async (req, res) => {
    // console.log(req)
    // console.log(req.body) // { status: 'active', id: '1' }
    const type = req.body.type;
    const ids = req.body.ids.split(", ");

    switch (type) {
        case "active":
            await Product.updateMany({
                _id: {
                    $in: ids
                }
            }, {
                status: "active",
            })
            req.flash("success", `Cập nhật trạng thái cho ${ids.length} sản phẩm thành công`)

            break
        case "inactive":
            await Product.updateMany({
                _id: {
                    $in: ids
                }
            }, {
                status: "inactive"
            })
            req.flash("success", `Cập nhật trạng thái cho ${ids.length} sản phẩm thành công`)
            break
        case "delete-all":
            await Product.updateMany({
                _id: {
                    $in: ids
                }
            }, {
                deleted: true,
            })
            req.flash("success", `Xóa ${ids.length} sản phẩm thành công`)
            break
        case "change-position":
            // console.log(ids)
            for (const item of ids) {
                // console.log(item)
                let [id, position] = item.split("-"); // Corrected variable name here
                position = parseInt(position);
                await Product.updateOne({
                    _id: id
                }, {
                    position: position
                })
            }
            req.flash("success", `Cập nhật vị trí cho ${ids.length} sản phẩm thành công`)
            break;
        default:
            break
    }
    res.redirect("back")
}

//[GET] /admin/products/create
module.exports.create = async (req, res) => {
    res.render("admin/pages/products/create.pug", {
        pageTitle: "Tạo mới sản phẩm"
    })
}

// [POST] /admin/products/create
module.exports.createPost = async (req, res) => {
    req.body.price = parseInt(req.body.price)
    req.body.discountPercentage = parseInt(req.body.discountPercentage)
    req.body.stock = parseInt(req.body.stock)
    if (req.body.position == '') {
        const countProducts = await Product.countDocuments()
        // console.log(countProducts)
        req.body.position = countProducts + 1
    } else {
        req.body.position = parseInt(req.body.position)
    }

    const product = new Product(req.body)
    await product.save()
    req.flash("success", "Thêm thành công sản phẩm")
    res.redirect(`${systemConfig.prefixAdmin}/products`)
}

//[GET] /admin/products/edit/:id
module.exports.edit = async (req, res) => {
    const id = req.params.id
    const record = await Product.findOne({
        _id: id,
        deleted: false
    })
    // console.log(record)
    res.render("admin/pages/products/edit.pug", {
        pageTitle: "Chỉnh sửa sản phẩm",
        product: record
    })
}

// [PATCH] /admin/products/edit/:id
module.exports.editPatch = async (req, res) => {
    // console.log(req.body)
    req.body.price = parseInt(req.body.price)
    req.body.discountPercentage = parseInt(req.body.discountPercentage)
    req.body.stock = parseInt(req.body.stock)
    req.body.position = parseInt(req.body.position)

    // if (req.file) {
    //     req.body.thumbnail = `/uploads/${req.file.filename}`
    // }

    try {
        console.log(req.params.id, req.body)
        // const updatedBy = {
        //     account_id: res.locals.user.id,
        //     updatedAt: new Date()
        // }

        // req.body.updatedBy = updatedBy

        await Product.updateOne({
            _id: req.params.id
        }, {
            $set: req.body
            // , // Cập nhật các trường trong body
            // $push: {
            //     updatedBy: updatedBy // Thêm log mới vào mảng updatedBy
            // }
        })
        req.flash("success", "Cập nhật thành công sản phẩm")
    } catch (error) {
        // console.log("error")
        req.flash("error", "Cập nhật thất bại")
    }
    // res.redirect(`${systemConfig.prefixAdmin}/products`)
    res.redirect("back")
}

// [GET] /admin/products/detail/:id
module.exports.detail = async (req, res) => {
    try {
        const id = req.params.id
        const find = {
            deleted: false,
            _id: id
        }
        const product = await Product.findOne(find)
        // console.log(product)
        res.render("admin/pages/products/detail", {
            pageTitle: product.title,
            product: product
        })
    } catch (error) {
        res.redirect(`${systemConfig.prefixAdmin}/products`)
    }
}