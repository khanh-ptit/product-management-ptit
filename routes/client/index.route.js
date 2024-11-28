const homeRoutes = require("./home.route")

module.exports = (app) => {
    app.use("/", homeRoutes)
}