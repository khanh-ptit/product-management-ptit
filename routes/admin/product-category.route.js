const express = require("express")
const router = express.Router()
const multer = require("multer")
const upload = multer()

const controller = require("../../controllers/admin/product-category.controller")
const uploadCloud = require("../../middlewares/admin/uploadCloud.middleware")

router.get("/", controller.index)

router.get("/create", controller.create)

router.post('/create', upload.single('thumbnail'), uploadCloud.upload, controller.createPost)

module.exports = router