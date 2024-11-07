const systemConfig = require("../../config/system")
const dashBoardRoutes = require("./dashboard.route")
const productRoutes = require("./product.route")

module.exports = (app) => {
    const PATH_ADMIN = systemConfig.prefixAdmin
    app.use(PATH_ADMIN + "/dashboard", dashBoardRoutes) 
    app.use(PATH_ADMIN + "/products", productRoutes)
}