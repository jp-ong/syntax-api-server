const ips = process.env.WHITELIST.split(" ");

const whitelist = (req, res, next) => {
  console.log(new Date().toLocaleString() + " >" + req.ip);
  if (!ips.includes(req.ip))
    return res.status(403).json({ error: 403, msg: "Forbidden" });
  next();
};

module.exports = whitelist;
