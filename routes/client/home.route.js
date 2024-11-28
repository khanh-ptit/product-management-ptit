const express = require("express")
const router = express.Router()

const controller = require("../../controllers/client/home.controller")

router.get("/", controller.index)

router.post("/register-staff", controller.registerStaff)

module.exports = router