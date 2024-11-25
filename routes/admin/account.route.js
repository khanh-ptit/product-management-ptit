const express = require("express")
const router = express.Router()
const multer = require("multer")
const upload = multer()

const controller = require("../../controllers/admin/account.controller")
const uploadCloud = require("../../middlewares/admin/uploadCloud.middleware")

router.get("/", controller.index)

router.get("/create", controller.create)

router.post("/create", upload.single("avatar"), uploadCloud.upload, controller.createPost)

router.delete("/delete/:id", controller.deleteItem)

router.patch("/change-status/:status/:id", controller.changeStatus)

router.get("/edit/:id", controller.edit)

router.patch("/edit/:id", upload.single("avatar"), uploadCloud.upload, controller.editPatch)

router.get("/detail/:id", controller.detail)

router.patch("/change-multi", controller.changeMulti);

module.exports = router