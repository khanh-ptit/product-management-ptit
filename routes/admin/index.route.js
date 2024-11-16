const systemConfig = require("../../config/system")
const dashBoardRoutes = require("./dashboard.route")
const productRoutes = require("./product.route")
const userRoutes = require("./user.route")
const accountRoutes = require("./account.route")
const roleRoutes = require("./role.route")

const authMiddleware = require("../../middlewares/admin/auth.middleware")

module.exports = (app) => {
    const PATH_ADMIN = systemConfig.prefixAdmin
    app.use(PATH_ADMIN + "/dashboard", authMiddleware.requireAuth, dashBoardRoutes) 
    app.use(PATH_ADMIN + "/products", authMiddleware.requireAuth, productRoutes)
    app.use(PATH_ADMIN + "/user", userRoutes)
    app.use(PATH_ADMIN + "/accounts", authMiddleware.requireAuth, accountRoutes)
    app.use(PATH_ADMIN + "/roles", authMiddleware.requireAuth, roleRoutes)
}