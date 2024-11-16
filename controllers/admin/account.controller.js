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
    const records = await Account.find(find).select("-password -token")
    console.log(records)
    // const roles = await Role.find({
    //     deleted: false
    // })

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
        // recordRoles: roles
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