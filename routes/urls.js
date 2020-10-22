const router = require("express").Router();
const shortid = require("shortid");
const validUrl = require("valid-url");
const Url = require("../models/Url");
require("dotenv").config();

const Joi = require("@hapi/joi");

const schemaRegister = Joi.object({
  longUrl: Joi.string().min(6).max(255).required(),
});

const schema = Joi.object({
  longUrls: Joi.array()
    .min(3)
    .max(100)
    .items(Joi.string().min(6).max(255).required()),
});

const clicks = 10;
router.post("/register", async (req, res) => {
  const { error } = schemaRegister.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  const longUrl = req.body.longUrl;
  const urlCode = shortid.generate();

  if (validUrl.isUri(longUrl)) {
    try {
      var url = await Url.findOne({ longUrl: longUrl });

      if (url) {
        return res.status(200).json({error:null,url,data:{user:req.user}});
      } else {
        // return res.status(200).json(process.env.baseUrl)
        const shortUrl = process.env.BASEURL + "/" + urlCode;
        url = new Url({
          urlCode,
          longUrl,
          shortUrl,
          clickCount: 0,
        });
        await url.save();
        return res.status(201).json({error:null,url,data:{
          user:req.user}});
      }
    } catch (err) {
      console.error(err.message);
      return res.status(500).json("Internal Serve error " + err.message);
    }
  } else {
    return res.status(200).json("Error de url");
  }
});


router.post("/registerBulk", async (req, res) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  const url_success = [];
  const url_error = [];
  const url_repeat=[];
  for (let i = 0; i < req.body.longUrls.length; i++) {
      const item = req.body.longUrls[i];
      if (validUrl.isUri(item)) {
        var urlExists = await Url.findOne({ longUrl: item });
        if (!urlExists) {
          const urlCode = shortid.generate();
          const shortUrl = process.env.BASEURL + "/" + urlCode;
          url = new Url({
            urlCode,
            longUrl: item,
            shortUrl,
            clickCount: 0,
          });
          
        await url.save();
          url_success.push(url);
        }else{
          url_repeat.push(urlExists)
          // console.log(urlExists)
          
        }
      } else {
        console.log("no es una url " + item);
        url_error.push(item);
      }
      
  }

  return res.status(200).json({ "accepteds": url_success, 
    "rejected": url_error,
    "repeats":url_repeat });
});

module.exports = router;
