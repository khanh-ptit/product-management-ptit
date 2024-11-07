const express = require('express')
require("dotenv").config()
const database = require("./config/database")
database.connect()
const systemConfig = require("./config/system")

const app = express()
const port = process.env.PORT

app.set("views", "./views");
app.set("view engine", "pug");
app.use(express.static('public'));

app.locals.prefixAdmin = systemConfig.prefixAdmin

const routeAdmin = require("./routes/admin/index.route")
routeAdmin(app)

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})