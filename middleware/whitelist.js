const whitelist = (req, res, next) => {
  const date = new Date().getTime();

  try {
    const invIP = process.env.INV_IP;
    const storeIP = process.env.STORE_IP;
    const payIP = process.env.PAY_IP;
    const whitelistStatus = process.env.WHITELIST_STATUS;
    if (
      invIP !== req.ip &&
      storeIP !== req.ip &&
      payIP !== req.ip &&
      whitelistStatus != 0
    ) {
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
