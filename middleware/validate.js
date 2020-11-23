const validate = (req, res, next) => {
  const password = req.header("x-inv-pw");

  if (!password) {
    return res.status(403).json({ msg: "Forbidden Access", status: 403 });
  } else if (password !== process.env.INV_PASSWORD) {
    return res.status(403).json({ msg: "Invalid Password", status: 403 });
  } else {
    next();
  }
};

module.exports = validate;
