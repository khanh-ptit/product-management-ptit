const systemConfig = require('../../config/system')
const ProductCategory = require('../../models/product-category.model')
const filterStatusHelper = require('../../helpers/filterStatus')
const searchHelper = require('../../helpers/search')
const createTreeHelper = require('../../helpers/createTree')
const Account = require('../../models/account.model')

// [GET] /admin/product-category
module.exports.index = async (req, res) => {
    const filterStatus = filterStatusHelper(req.query)
    let find = {
        deleted: false
    }

    if (req.query.status) {
        find["status"] = req.query.status
    }

    const accounts = await Account.find({
        deleted: false
    })

    const objectSearch = searchHelper(req.query)
    if (objectSearch.regex) {
        find.title = objectSearch.regex
    }

    const records = await ProductCategory.find(find)

    const treeRecords = createTreeHelper.tree(records);

    res.render("admin/pages/product-category/index.pug", {
        pageTitle: "Danh mục sản phẩm",
        filterStatus: filterStatus,
        records: treeRecords,
        accounts: accounts,
        keyword: objectSearch.keyword,
    })
}

// [GET] admin/product-category/create
module.exports.create = async (req, res) => {
    let find = {
        deleted: false
    }

    const records = await ProductCategory.find(find)
    const treeRecords = createTreeHelper.tree(records);

    res.render("admin/pages/product-category/create", {
        pageTitle: "Tạo danh mục sản phẩm",
        records: treeRecords
    })
}

// [POST] admin/product-category/create
module.exports.createPost = async (req, res) => {
    // console.log(req.body)
    if (req.body.position) {
        req.body.position = parseInt(req.body.position)
    } else {
        const productCategoryCount = await ProductCategory.countDocuments()
        req.body.position = productCategoryCount + 1
    }
    req.body.createdBy = {
        account_id: res.locals.user.id,
        createdAt: new Date()
    }
    const productCategory = new ProductCategory(req.body)
    await productCategory.save()
    req.flash("success", "Thêm thành công danh mục sản phẩm")
    res.redirect(`${systemConfig.prefixAdmin}/product-category`)
}