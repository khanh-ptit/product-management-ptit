const Product = require("../../models/product.model")
const filterStatusHelper = require("../../helpers/filterStatus")
const searchHelper = require("../../helpers/search")
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