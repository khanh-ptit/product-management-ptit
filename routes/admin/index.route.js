const systemConfig = require("../../config/system")
const dashBoardRoutes = require("./dashboard.route")
const productRoutes = require("./product.route")
const userRoutes = require("./user.route")
const accountRoutes = require("./account.route")
const roleRoutes = require("./role.route")

module.exports = (app) => {
    const PATH_ADMIN = systemConfig.prefixAdmin
    app.use(PATH_ADMIN + "/dashboard", dashBoardRoutes) 
    app.use(PATH_ADMIN + "/products", productRoutes)
    app.use(PATH_ADMIN + "/user", userRoutes)
    app.use(PATH_ADMIN + "/accounts", accountRoutes)
    app.use(PATH_ADMIN + "/roles", roleRoutes)
}