const Account = require("../../models/account.model")
const systemConfig = require("../../config/system")

// [GET] /admin/auth/login
module.exports.login = (req, res) => {
    if (req.cookies.token) {
        res.redirect(`${systemConfig.prefixAdmin}/dashboard`)
        return
    }

    res.render("admin/pages/user/login.pug", {
        pageTitle: "Đăng nhập"
    })
}