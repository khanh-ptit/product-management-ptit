const express = require('express')
const methodOverride = require('method-override')
const cookieParser = require("cookie-parser")
const session = require('express-session')
const flash = require('express-flash')
const moment = require('moment')
require("dotenv").config()
const database = require("./config/database")
database.connect()
const systemConfig = require("./config/system")

const app = express()
const port = process.env.PORT

app.set("views", `${__dirname}/views`)
app.set("view engine", "pug");
app.use(express.static(`${__dirname}/public`))
app.use(methodOverride('_method'))
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Flash
app.use(cookieParser('tomcacto'));
app.use(session({ cookie: { maxAge: 60000 }}));
app.use(flash());

app.locals.prefixAdmin = systemConfig.prefixAdmin
app.locals.moment = moment

const routeAdmin = require("./routes/admin/index.route")
routeAdmin(app)

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})