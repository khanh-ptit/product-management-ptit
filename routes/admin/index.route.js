const systemConfig = require("../../config/system")
const dashBoardRoutes = require("./dashboard.route")

module.exports = (app) => {
    const PATH_ADMIN = systemConfig.prefixAdmin
    app.use(PATH_ADMIN + "/dashboard", dashBoardRoutes) 
}