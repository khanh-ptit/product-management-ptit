const express = require("express")
const router = express.Router()
const multer = require("multer")
const upload = multer()

const controller = require("../../controllers/admin/product-category.controller")
const uploadCloud = require("../../middlewares/admin/uploadCloud.middleware")

router.get("/", controller.index)

router.get("/create", controller.create)

router.post('/create', upload.single('thumbnail'), uploadCloud.upload, controller.createPost)

router.delete("/delete/:id", controller.deleteProductCategory)

router.patch('/change-status/:status/:id', controller.changeStatus)

router.get("/edit/:id", controller.edit)

router.patch("/edit/:id", upload.single('thumbnail'), uploadCloud.upload, controller.editPatch)

router.get("/detail/:id", controller.detail)

module.exports = router