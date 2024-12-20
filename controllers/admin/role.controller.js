const Role = require("../../models/role.model")
const systemConfig = require("../../config/system")
const paginationHelper = require("../../helpers/pagination")

// [GET] /admin/roles
module.exports.index = async (req, res) => {
    const role = res.locals.role;

    if (!role.permissions.includes("roles_view")) {
        res.redirect(`${systemConfig.prefixAdmin}/error/403`)
        return
    }

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
    const role = res.locals.role;

    if (!role.permissions.includes("roles_create")) {
        res.redirect(`${systemConfig.prefixAdmin}/error/403`)
        return
    }

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
    const roles = res.locals.role;

    if (!roles.permissions.includes("roles_edit")) {
        res.redirect(`${systemConfig.prefixAdmin}/error/403`)
        return
    }

    try {
        const id = req.params.id
        const role = await Role.findOne({
            _id: id,
            deleted: false
        })
        res.render("admin/pages/roles/edit.pug", {
            pageTitle: "Chỉnh sửa nhóm quyền",
            role: role
        })
    } catch (error) {
        req.flash("error", "Nhóm quyền không tồn tại")
        res.redirect(`${systemConfig.prefixAdmin}/roles`)
    }
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

// [GET] /admin/roles/permissions
module.exports.permissions = async (req, res) => {
    const roles = res.locals.role;

    if (!roles.permissions.includes("roles_permissions")) {
        res.redirect(`${systemConfig.prefixAdmin}/error/403`)
        return
    }

    let find = {
        deleted: false
    }
    const records = await Role.find(find)
    // res.send("OK")
    res.render("admin/pages/roles/permissions.pug", {
        pageTitle: "Phân quyền",
        records: records
    })
}

// [PATCH] /admin/roles/permissions
module.exports.permissionsPatch = async (req, res) => {
    // console.log(req.body)
    try {
        let arr = JSON.parse(req.body.permissions)
        arr.forEach(async element => {
            // console.log(element)
            await Role.updateOne({
                _id: element.id
            }, {
                permissions: element.permissions
            })
        });
        req.flash("success", "Cập nhật phân quyền thành công")
        res.redirect("back")
        // res.redirect(`${systemConfig.prefixAdmin}/roles/permissions`)
    } catch (error) {
        req.flash("error", "Cập nhật phân quyền thất bại")
    }
}

// [GET] /admin/roles/detail/:id
module.exports.detail = async (req, res) => {
    const roles = res.locals.role;

    if (!roles.permissions.includes("roles_view")) {
        res.redirect(`${systemConfig.prefixAdmin}/error/403`)
        return
    }

    try {
        const id = req.params.id
        const role = await Role.find({
            _id: id
        })
        res.render("admin/pages/roles/detail.pug", {
            pageTitle: "Chi tiết nhóm quyền",
            role: role
        })
    } catch (error) {
        req.flash("error", "Nhóm quyền không tồn tại")
        res.redirect(`${systemConfig.prefixAdmin}/roles`)
    }
}

//[PATCH] /admin/orders/change-multi
module.exports.changeMulti = async (req, res) => {
    const type = req.body.type;
    const ids = req.body.ids.split(", ");

    switch (type) {
        case "delete-all":
            await Role.updateMany({
                _id: {
                    $in: ids
                }
            }, {
                deleted: true,
            })
            req.flash("success", `Xóa ${ids.length} nhóm quyền thành công`)
            break
        default:
            break
    }
    res.redirect("back")
    // res.send("OK")
}