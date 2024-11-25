const Account = require("../../models/account.model")
const Role = require("../../models/role.model")
const md5 = require("md5")
const filterStatusHelper = require("../../helpers/filterStatus")
const searchHelper = require("../../helpers/search")
const systemConfig = require("../../config/system")
const paginationHelper = require("../../helpers/pagination")

// [GET] /admin/accounts
module.exports.index = async (req, res) => {
    const filterStatus = filterStatusHelper(req.query)
    let find = {
        deleted: false
    }

    if (req.query.status) {
        find["status"] = req.query.status
    }
    
    // Pagination
    const countAccounts = await Account.countDocuments(find)
    let objectPagination = paginationHelper({
        currentPage: 1,
        limitItems: 4
    }, req.query, countAccounts)

    // Form search
    const objectSearch = searchHelper(req.query)
    if (objectSearch["regex"]) {
        find["fullName"] = objectSearch["regex"]
    }

    // Sort
    let sort = {}

    if (req.query.sortKey && req.query.sortValue) {
        sort[req.query.sortKey] = req.query.sortValue
    } else {
        sort.createdAt = "desc"
    }
    // end sort products

    // const records = await Account.find(find).select("-password -token")
    const records = await Account.find(find)
        .select("-password -token")
        .limit(objectPagination.limitItems)
        .skip(objectPagination.skip)
        .sort(sort)

    for (const record of records) {
        const role = await Role.findOne({
            _id: record.role_id,
            deleted: false
        })
        if (role) {
            record.roleInfo = role
        } else {
            record.roleInfo = "Không có nhóm quyền"
        }
    }

    res.render("admin/pages/accounts/index.pug", {
        pageTitle: "Danh sách tài khoản",
        filterStatus: filterStatus,
        records: records,
        pagination: objectPagination,
        keyword: objectSearch.keyword
    })
}

// [GET] /admin/accounts/create
module.exports.create = async (req, res) => {
    const roles = await Role.find({
        deleted: false
    })

    // res.send("OK")
    res.render("admin/pages/accounts/create.pug", {
        pageTitle: "Tạo mới tài khoản",
        roles: roles
    })
}

// [POST] /admin/accounts/create
module.exports.createPost = async (req, res) => {
    // console.log(req.body)
    const newAccount = new Account(req.body)
    newAccount.password = md5(newAccount.password)
    await newAccount.save()
    // console.log(newAccount)
    // res.send("OK")
    req.flash("success", "Tạo tài khoản thành công!")
    res.redirect(`${systemConfig.prefixAdmin}/accounts`)
}

// [DELETE] /admin/accounts/delete/:id
module.exports.deleteItem = async (req, res) => {
    const id = req.params.id

    await Account.updateOne({
        _id: id
    }, {
        deleted: true
    })
    req.flash("success", "Xóa thành công tài khoản!")
    res.redirect("back")
}

// [PATCH] /admin/accounts/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
    const status = req.params.status
    const id = req.params.id

    await Account.updateOne({
        _id: id
    }, {
        status: status
    })
    req.flash("success", "Cập nhật trạng thái thành công!")
    res.redirect("back")
}

// [GET] /admin/accounts/edit/:id
module.exports.edit = async (req, res) => {
    const id = req.params.id
    const account = await Account.findOne({
        _id: id,
        deleted: false
    })
    const roles = await Role.find({
        deleted: false
    })
    res.render("admin/pages/accounts/edit.pug", {
        pageTitle: "Chỉnh sửa tài khoản",
        account: account,
        roles: roles
    })
}

// [PATCH] /admin/accounts/edit/:id
module.exports.editPatch = async (req, res) => {
    const id = req.params.id
    if (req.body.password == "") {
        delete req.body.password;
    }
    if (req.body.password) {
        req.body.password = md5(req.body.password)
    }
    await Account.updateOne({
        _id: id,
    }, req.body)
    req.flash("success", "Cập nhật tài khoản thành công!")
    res.redirect("back")
}

// [GET] /admin/accounts/detail/:id
module.exports.detail = async (req, res) => {
    const id = req.params.id
    const account = await Account.findOne({
        _id: id
    })
    const infoRole = await Role.findOne({
        _id: account.role_id
    })
    account.infoRole = infoRole

    res.render("admin/pages/accounts/detail.pug", {
        pageTitle: "Chi tiết tài khoản",
        account: account
    })
}

//[PATCH] /admin/orders/change-multi
module.exports.changeMulti = async (req, res) => {
    const type = req.body.type;
    const ids = req.body.ids.split(", ");

    switch (type) {
        case "delete-all":
            await Account.updateMany({
                _id: {
                    $in: ids
                }
            }, {
                deleted: true,
            })
            req.flash("success", `Xóa ${ids.length} tài khoản thành công`)
            break
        default:
            break
    }
    res.redirect("back")
    // res.send("OK")
}