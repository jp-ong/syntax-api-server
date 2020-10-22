const whitelist = (req, res, next) => {
  const date = new Date().getTime();

  try {
    const ips = process.env.WHITELIST.split("+");
    const storeIP = process.env.STORE_IP;
    if (!ips.includes(req.ip) && storeIP !== req.ip) {
      console.error(`~~~~~@${date}~~~~~>${req.ip}~~~~~#DENIED~~~~~`);
      return res.status(403).json({ msg: "Forbidden", status: 403 });
    } else {
      console.log(`~~~~~@${date}~~~~~>${req.ip}~~~~~#SUCCESS~~~~~`);
      next();
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ msg: "Missing Environment Variables.", status: 500, error });
  }
};

module.exports = whitelist;
