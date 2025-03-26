const systemConfig = require("../../config/system");
const Account = require("../../models/account.model");
const Role = require("../../models/role.model");

module.exports.requireAuth = async (req, res, next) => {
  // console.log("Here")
  if (!req.cookies.token) {
    res.redirect(`${systemConfig.prefixAdmin}/user/login`);
  } else {
    // console.log(req.cookies.token)
    const user = await Account.findOne({
      token: req.cookies.token,
      deleted: false,
    }).select("-password");
    if (!user) {
      res.redirect(`${systemConfig.prefixAdmin}/user/login`);
    } else {
      // console.log(user)
      const role = await Role.findOne({
        _id: user.role_id,
      });
      res.locals.user = user;
      res.locals.role = role;
      next();
    }
  }
};
