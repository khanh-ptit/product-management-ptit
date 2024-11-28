module.exports.error404 = async (req, res) => {
    res.render(`admin/pages/errors/404`, {
        pageTitle: "404 Not Found"
    })
}

module.exports.error403 = async (req, res) => {
    res.render(`admin/pages/errors/403`, {
        pageTitle: "403 Forbidden"
    })
}