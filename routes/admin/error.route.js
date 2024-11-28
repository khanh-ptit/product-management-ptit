const express = require("express")
const router = express.Router()

const controller = require("../../controllers/admin/error.controller")

router.get("/404", controller.error404)

router.get("/403", controller.error403)

module.exports = router