const express = require("express")
const router = express.Router()
const multer = require("multer")
const upload = multer()

const controller = require("../../controllers/admin/user.controller")
const authMiddleware = require("../../middlewares/admin/auth.middleware")
const uploadCloud = require("../../middlewares/admin/uploadCloud.middleware")

router.get('/login', controller.login)

router.post('/login', controller.loginPost)

router.get('/logout', controller.logout)

router.get('/forgot-password', controller.forgotPassword)

router.post('/forgot-password', controller.forgotPasswordPost)

router.get('/otp-password', controller.otpPassword)

router.post('/otp-password', controller.otpPasswordPost)

router.get('/reset-password', authMiddleware.requireAuth, controller.resetPassword)

router.post('/reset-password', authMiddleware.requireAuth, controller.resetPasswordPost)

router.get('/info', authMiddleware.requireAuth, controller.info)

router.get("/edit", authMiddleware.requireAuth, controller.edit)

router.patch("/change-avatar", upload.single("avatar"), uploadCloud.upload, authMiddleware.requireAuth, controller.changeAvatar)

router.patch("/edit", authMiddleware.requireAuth, controller.editPatch)

module.exports = router