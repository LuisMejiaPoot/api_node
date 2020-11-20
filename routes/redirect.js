const router = require("express").Router();
const shortid = require("shortid");
const validUrl = require("valid-url");
const Url = require("../models/Url");
require("dotenv").config();

const Joi = require("@hapi/joi");

router.get("/:redirectUrl", async (req, res) => {
  const redirectUrl = req.params.redirectUrl;
  const url = await Url.findOne({
    urlCode: redirectUrl,
  });

  if (!url) {
    return res.status(200).json({
      error: true,
      message: "the url does not exist",
    });
  }
  var clickCount = url.clickCount;
  clickCount++;
  await url.update({
    clickCount,
  });
  return res.redirect(url.longUrl);
});

module.exports = router;
