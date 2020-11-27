const whitelist = (req, res, next) => {
  const date = new Date().getTime();

  try {
    const invIP = process.env.INV_IP.split(",");
    const storeIP = process.env.STORE_IP.split(",");
    const payIP = process.env.PAY_IP.split(",");
    const devIP = process.env.DEV_IP.split(",");
    const whitelistStatus = process.env.WHITELIST_STATUS;
    if (
      !devIP.includes(req.ip) &&
      !invIP.includes(req.ip) &&
      !storeIP.includes(req.ip) &&
      !payIP.includes(req.ip) &&
      whitelistStatus != 0
    ) {
      console.error(`~~~~~@${date}~~~~~>${req.ip}~~~~~#DENIED~~~~~`);
      return res
        .status(403)
        .json({ msg: "Forbidden IP", status: 403, ip: req.ip });
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
