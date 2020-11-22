const router = require("express").Router();
const shortid = require("shortid");
const validUrl = require("valid-url");
const Url = require("../models/Url");
const jwt = require('jsonwebtoken');

require("dotenv").config();


const Joi = require("@hapi/joi");
const {
  valid
} = require("@hapi/joi");
const {
  response
} = require("express");

const schemaRegister = Joi.object({
  longUrl: Joi.string().min(6).max(255).required(),
});

const schema = Joi.object({
  longUrls: Joi.array()
    .min(2)
    .max(1000)
    .items(Joi.string().min(6).max(255).required()),
});

const shemaDelete = Joi.object({
  id: Joi.string().min(10).max(50).required(),
});
const shemaUpdate = Joi.object({
  id: Joi.string().min(10).max(50).required(),
  url: Joi.string().min(10).max(150).required(),
});



const clicks = 10;
router.post("/register", async (req, res) => {
  const {error} = schemaRegister.validate(req.body);
  if (error) {
    return res.status(400).json({
      error: true,
      message: error.details[0].message,
    });
  }
  const longUrl = req.body.longUrl;
  const urlCode = shortid.generate();

  if (validUrl.isUri(longUrl)) {
    try {
      var url = await Url.findOne({
        longUrl: longUrl,
      });

      if (url) {
        return res.status(200).json({
          error: "repeat",
          url,
          data: {
            user: req.user,
          },
          message: "This url has been registered before",
        });
      } else {
        // return res.status(200).json(process.env.baseUrl)
        const shortUrl = process.env.BASEURL + "/" + urlCode;
        url = new Url({urlCode,longUrl,shortUrl,clickCount: 0,});
        await url.save();
        return res.status(201).json({
          error: null,
          url,
          data: {user: req.user},
          message: "Url registered success",
        });
      }
    } catch (err) {
      console.error(err.message);
      return res.status(500).json("Internal Serve error " + err.message);
    }
  } else {
    return res.status(200).json({
      error: true,
      message: "url don't have a correct format",
    });
  }
});

router.post("/registerBulk", async (req, res) => {
  const {
    error
  } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      error: true,
      message: error.details[0].message,
    });
  }
  const url_success = [];
  const url_error = [];
  const url_repeat = [];
  for (let i = 0; i < req.body.longUrls.length; i++) {
    const item = req.body.longUrls[i];
    if (validUrl.isUri(item)) {
      var urlExists = await Url.findOne({
        longUrl: item
      });
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
      } else {
        url_repeat.push(urlExists);
      }
    } else {
      url_error.push(item);
    }
  }

  return res.status(200).json({
    accepteds: url_success,
    rejected: url_error,
    repeats: url_repeat,
    error: null,
  });
});

router.post("/allUrl", async (req, res) => {
  const urls = await Url.find({}, function (err, data) {
    if (err) {
      return res.status(400).json({
        error: true,
        message: err,
      });
    }
  });
  if (urls.length == 0) {
    return res.status(200).json({
      error: false,
      message: "Not found registers",
    });
  }

  return res.status(200).json({
    error: false,
    datos: urls,
  });
});

router.post("/deleteUrl", async (req, res) => {
  const {
    error
  } = shemaDelete.validate(req.body);

  if (error)
    return res.status(400).json({
      error: true,
      message: error.details[0].message,
    });

  const findUrl = await Url.findById(req.body.id, function (err, data) {
    if (err) {
      return res.status(400).json({
        error: true,
        message: err,
      });
    }
  });
  // coment
  if (!findUrl) {
    return res.status(400).json({
      error: true,
      message: "Not found Url",
    });
  }
  const deleteU = await Url.deleteOne({
      _id: req.body.id,
    },
    function (err, data) {
      if (err) {
        return res.status(400).json({
          error: true,
          message: err,
        });
      }
    }
  );

  return res.status(200).json({
    error: false,
    message: "The Url was deleted",
  });
});

router.put("/updateUrl", async (req, res) => {
  const {error} = shemaUpdate.validate(req.body);
  const token  =  req.header('auth-token')
  const reverseToken =jwt.decode(token)
  if (error)
    return res.status(400).json({
      error: true,
      message: error.details[0].message,
    });

  if (!validUrl.isUri(req.body.url)) {
    return res.status(400).json({
      error: true,
      message: "Incorrect format from url",
    });
  }

  const validExist = await Url.findOne({
    longUrl : req.body.url,
      _id: {"$ne":req.body.id}
    },
    function (err, data) {
      if (err)
        return res.status(400).json({
          error: true,
          message: "Error al querer validar si existe la url",
        });
      // return res.send(data)
    }
  );
  // User.find({ "groups": { "$nin": ['admin', 'user'] } })
 
  if (validExist !== null)
    return res.status(400).json({
      error: true,
      message: "Url longer exists",
    });



  const updateUrl = await Url.findByIdAndUpdate({
      _id: req.body.id}, {longUrl: req.body.url},
    function (err, data) {
      if (err)
        return res.status(400).json({
          error: true,
          message: err,
        });
    }
  );
  
  
  return res.status(200).json({error:false,data:updateUrl});
});

router.post("/getUrl", async (req, res) => {

  const {
    error
  } = shemaDelete.validate(req.body);

  if (error)
    return res.status(400).json({
      error: true,
      message: error.details[0].message
    })

  const url = await Url.findOne({
    _id: req.body.id
  }, function (err, data) {
    if (err) return res.status(400).json({
      error: true,
      message: "Error al obtener la url"
    })
  })

  return res.status(200).json({
    error: false,
    data: url
  })

});

module.exports = router;