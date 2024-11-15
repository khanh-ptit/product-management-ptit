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
    // const records = await Account.find(find).select("-password -token")

    // const roles = await Role.find({
    //     deleted: false
    // })

    // for (const record of records) {
    //     const role = await Role.findOne({
    //         _id: record.role_id,
    //         deleted: false
    //     })
    //     if (role) {
    //         record.role = role
    //     } else {
    //         record.role = "Không có nhóm quyền"
    //     }
    // }

    res.render("admin/pages/accounts/index.pug", {
        pageTitle: "Danh sách tài khoản",
        filterStatus: filterStatus
        // records: records,
        // recordRoles: roles
    })
}