const express = require('express')
require("dotenv").config()
const database = require("./config/database")
const app = express()
const port = process.env.PORT

database.connect()
const routeAdmin = require("./routes/admin/index.route")
routeAdmin(app)

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})