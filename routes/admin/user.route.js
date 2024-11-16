const express = require("express")
const router = express.Router()

const controller = require("../../controllers/admin/user.controller")
const authMiddleware = require("../../middlewares/admin/auth.middleware")

router.get('/login', controller.login)

router.post('/login', controller.loginPost)

router.get('/logout', controller.logout)

router.get('/forgot-password', controller.forgotPassword)

router.post('/forgot-password', controller.forgotPasswordPost)

router.get('/otp-password', controller.otpPassword)

router.post('/otp-password', controller.otpPasswordPost)

router.get('/reset-password', authMiddleware.requireAuth, controller.resetPassword)

router.post('/reset-password', authMiddleware.requireAuth, controller.resetPasswordPost)

module.exports = router