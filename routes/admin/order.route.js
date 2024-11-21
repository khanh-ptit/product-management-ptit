const express = require("express")
const router = express.Router()

const controller = require("../../controllers/admin/order.controller")

router.get("/create", controller.create)

router.post("/create", controller.createPost)

module.exports = router