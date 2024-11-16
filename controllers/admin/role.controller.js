const Role = require("../../models/role.model")
const systemConfig = require("../../config/system")
const paginationHelper = require("../../helpers/pagination")

// [GET] /admin/roles
module.exports.index = async (req, res) => {
    let find = {
        deleted: false
    }

    const roles = await Role.find(find)

    const countRoles = await Role.countDocuments(find)
    let objectPagination = paginationHelper({
        currentPage: 1,
        limitItems: 4
    }, req.query, countRoles)
    // console.log(roles)
    res.render("admin/pages/roles/index.pug", {
        pageTitle: "Nhóm quyền",
        roles: roles,
        pagination: objectPagination
    })
}

// [GET] /admin/roles/create
module.exports.create = (req, res) => {
    res.render("admin/pages/roles/create.pug", {
        pageTitle: "Tạo mới nhóm quyền"
    })
}

// [POST] /admin/roles/create
module.exports.createPost = async (req, res) => {
    // console.log(req.body)
    const newRole = new Role(req.body)
    await newRole.save()
    // console.log(newRole)
    req.flash("success", "Tạo thành công nhóm quyền")
    res.redirect(`${systemConfig.prefixAdmin}/roles`)
}

// [GET] /admin/roles/edit/:id
module.exports.edit = async (req, res) => {
    const id = req.params.id
    const role = await Role.findOne({
        _id: id,
        deleted: false
    })
    res.render("admin/pages/roles/edit.pug", {
        pageTitle: "Chỉnh sửa nhóm quyền",
        role: role
    })
}

// [PATCH] /admin/roles/edit/:id
module.exports.editPatch = async (req, res) => {
    const id = req.params.id
    await Role.updateOne({
        _id: id
    }, req.body)
    req.flash("success", "Cập nhật nhóm quyền thành công!")
    res.redirect(`${systemConfig.prefixAdmin}/roles`)
}

// [DELETE] /admin/roles/delete/:id
module.exports.deleteItem = async (req, res) => {
    const id = req.params.id
    await Role.updateOne({
        _id: id
    }, {
        deleted: true
    })

    req.flash("success", "Xóa thành công nhóm quyền!")
    res.redirect("back")
}