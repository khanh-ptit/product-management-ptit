const Account = require("../../models/account.model")
const Role = require("../../models/role.model")
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

// [POST] /admin/user/reset-password
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

// [GET] /admin/user/info
module.exports.info = async (req, res) => {
    const user = res.locals.user
    const createdAt = new Date(user.createdAt)
    
    // Extract day, month, and year as numbers
    const day = createdAt.getDate()       // Day of the month (1-31)
    const month = createdAt.getMonth() + 1 // Month (0-11), so add 1 to get 1-12
    const year = createdAt.getFullYear()   // Full year (e.g., 2023)

    // console.log(user)
    const infoRole = await Role.findOne({
        _id: user.role_id,
        deleted: false
    }).select("title")
    user.infoRole = infoRole

    res.render("admin/pages/user/info.pug", {
        user: user,
        day: day,
        month: month,
        year: year,
        pageTitle: "Thông tin tài khoản"
    })
}

// [GET] /admin/user/edit
module.exports.edit = (req, res) => {
    const user = res.locals.user
    res.render("admin/pages/user/edit.pug", {
        user: user,
        pageTitle: "Chỉnh sửa tài khoản"
    })
}

// [PATCH] /change-avatar
module.exports.changeAvatar = async (req, res) => {
    try {
        const id = res.locals.user.id
        console.log(id)
        console.log(req.body)
        console.log(req.body.avatar)
        await Account.updateOne({
            _id: id
        }, {
            avatar: req.body.avatar
        })
        req.flash("success", "Đã cập nhật avatar thành công !")
        res.redirect("back")
    } catch (error) {
        res.redirect("back")
    }
};

const crypto = require("crypto");

// [PATCH] /admin/user/edit
module.exports.editPatch = async (req, res) => {
    try {
        const userId = res.locals.user.id; // Lấy ID người dùng từ thông tin session
        const { name, password, confirm_password } = req.body;
        console.log(req.body)

        // Kiểm tra tên không được rỗng
        if (!name) {
            req.flash("error", "Họ và tên không được để trống.");
            return res.redirect("back");
        }

        // Kiểm tra mật khẩu và xác nhận mật khẩu khớp nhau (nếu có thay đổi)
        if (password || confirm_password) {
            if (password !== confirm_password) {
                req.flash("error", "Mật khẩu và xác nhận mật khẩu không khớp.");
                return res.redirect("back");
            }
        }

        // Tạo đối tượng cập nhật
        const updateData = { fullName: name };

        // Nếu có mật khẩu mới, mã hóa bằng MD5 và thêm vào đối tượng cập nhật
        if (password) {
            const hashedPassword = md5(password)
            updateData.password = hashedPassword;
        }

        // Cập nhật thông tin người dùng
        await Account.updateOne({ _id: userId }, updateData);

        req.flash("success", "Cập nhật thông tin thành công!");
        res.redirect("back");
    } catch (error) {
        console.error("Error updating user:", error);
        req.flash("error", "Có lỗi xảy ra khi cập nhật thông tin.");
        res.redirect("back");
    }
};
