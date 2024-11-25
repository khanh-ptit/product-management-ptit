const express = require("express")
const router = express.Router()

const controller = require("../../controllers/admin/order.controller")

router.get("/create", controller.create)

router.post("/create", controller.createPost)

router.get("/", controller.index)

router.get("/edit/:id", controller.edit)

router.get("/detail/:id", controller.detail)

router.patch("/change-status/:status/:id", controller.changeStatus)

router.get("/print/:id", controller.print);

module.exports = router