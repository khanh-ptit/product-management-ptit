const express = require("express")
const router = express.Router()

const controller = require("../../controllers/admin/order.controller")

router.get("/create", controller.create)

router.post("/create", controller.createPost)

router.get("/", controller.index)

router.get("/detail/:id", controller.detail)

router.patch("/change-status/:status/:id", controller.changeStatus)

router.get("/print/:id", controller.print);

router.patch("/change-multi", controller.changeMulti);

router.delete("/delete/:id", controller.deleteItem)

module.exports = router