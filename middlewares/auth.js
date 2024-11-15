const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../utils/config");
// const { invalidCredentialsCode } = require("../utils/errors");
const ForbiddenError = require("../errors/forbidden-err");

module.exports = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization || !authorization.startsWith("Bearer ")) {
    next(new ForbiddenError("Invalid credentials"));
    // return res
    //   .status(invalidCredentialsCode)
    //   .send({ message: "Invalid credentials" });
  }

  const token = authorization.replace("Bearer ", "");
  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    next(new ForbiddenError("Invalid credentials"));
    // return res
    //   .status(invalidCredentialsCode)
    //   .send({ message: "Invalid credentials" });
  }

  req.user = payload;
  return next();
};
