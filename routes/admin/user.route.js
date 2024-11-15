const express = require("express")
const router = express.Router()

const controller = require("../../controllers/admin/user.controller")

router.get('/login', controller.login)

router.get('')

module.exports = router