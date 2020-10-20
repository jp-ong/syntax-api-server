const ips = process.env.WHITELIST.split("+");

const whitelist = (req, res, next) => {
  if (!ips.includes(req.ip)) {
    console.log(new Date().toLocaleString() + " >" + req.ip + " #DENIED");
    return res.status(403).json({ error: 403, msg: "Forbidden" });
  }
  console.log(new Date().toLocaleString() + " >" + req.ip + " #SUCCESS");
  next();
};

module.exports = whitelist;
