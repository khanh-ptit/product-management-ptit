const Account = require("../../models/account.model")
const ForgotPassword = require("../../models/forgot-password.model")
const systemConfig = require("../../config/system")
const md5 = require("md5")
const sendMailHelper = require("../../helpers/sendMail")
const generateHelper = require("../../helpers/generate")

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

// [POST] /admin/auth/login
module.exports.loginPost = async (req, res) => {
    // console.log(req.body)
    const email = req.body.email
    const password = req.body.password

    const user = await Account.findOne({
        email: email,
        deleted: false
    })
    if (!user) {
        req.flash("error", `Email ${email} không tồn tại !`)
        res.redirect("back")
        return
    }
    console.log(md5(password))
    console.log(user.password)
    if (md5(password) == user.password) {
        if (user.status == "inactive") {
            req.flash("error", "Tài khoản đã bị khóa !")
            res.redirect("back")
            return
        }
        req.flash("success", "Đăng nhập thành công")
        res.cookie("token", user.token)
        res.redirect(`${systemConfig.prefixAdmin}/dashboard`)
    } else {
        req.flash("error", "Email hoặc mật khẩu không đúng !")
        res.redirect("back")
    }
    // res.send("OK")
}

// [GET] /admin/user/logout
module.exports.logout = (req, res) => {
    res.clearCookie("token")
    res.redirect(`${systemConfig.prefixAdmin}/user/login`)
}

// [GET] /admin/user/forgot-password
module.exports.forgotPassword = (req, res) => {
    res.render("admin/pages/user/forgot-password.pug", {
        pageTitle: "Quên mật khẩu"
    })
}

// [POST] /user/password/forgot
module.exports.forgotPasswordPost = async (req, res) => {
    const email = req.body.email

    const existEmail = await Account.findOne({
        email: email,
        deleted: false
    })

    if (!existEmail) {
        req.flash("error", "Email không tồn tại hoặc chưa được đăng ký!")
        res.redirect("back")
        return
    }

    // Bước 1: Tạo otp rồi lưu bản ghi đó vào collection forgot-password
    const otp = generateHelper.generateRandomNumber(8)
    const objectForgotPassword = {
        email: email,
        otp: otp,
        expireAt: new Date(Date.now() + 180 * 1000)
    }
    const newForgotPassword = new ForgotPassword(objectForgotPassword)
    await newForgotPassword.save()

    // Bước 2: Gửi OTP về mail
    const subject = `Mã xác thực OTP đặt lại mật khẩu`
    const html = `
        Mã OTP đặt lại mật khẩu là <b>${otp}</b>. Lưu ý không được chia sẻ mã này. Thời hạn sử dụng là 3 phút.
    `
    sendMailHelper.sendMail(email, subject, html)
    res.redirect(`${systemConfig.prefixAdmin}/user/otp-password?email=${email}`)
}

// [GET] /admin/user/otp-password
module.exports.otpPassword = (req, res) => {
    const email = req.query.email
    res.render("admin/pages/user/otp-password.pug", {
        pageTitle: "Nhập OTP",
        email: email
    })
}

// [POST] /user/otp-password
module.exports.otpPasswordPost = async (req, res) => {
    const email = req.body.email
    const otp = req.body.otp
    const checkForgotPassword = await ForgotPassword.findOne({
        email: email,
        otp: otp
    })

    if (!checkForgotPassword) {
        req.flash("error", "OTP không hợp lệ!")
        res.redirect("back")
        return
    }

    const account = await Account.findOne({
        email: email,
        deleted: false
    })
    res.cookie("token", account.token)
    res.redirect(`${systemConfig.prefixAdmin}/user/reset-password`)
}

// [GET] /admin/user/reset-password
module.exports.resetPassword = (req, res) => {
    res.render("admin/pages/user/reset-password")
}

// [POST] /user/reset-password
module.exports.resetPasswordPost = async (req, res) => {
    const token = req.cookies.token
    const password = md5(req.body.password)
    const account = await Account.findOne({
        token: token,
        deleted: false
    })
    if (account.password == password) {
        req.flash("error", "Mật khẩu mới không được trùng với mật khẩu cũ!")
        res.redirect("back")
        return
    }

    await Account.updateOne({
        token: token
    }, {
        password: password
    })

    res.clearCookie("token")
    req.flash("success", "Cập nhật mật khẩu thành công. Vui lòng đăng nhập để tiếp tục")
    res.redirect(`${systemConfig.prefixAdmin}/user/login`)
}