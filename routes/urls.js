const router   = require('express').Router();
const shortid = require("shortid");
const validUrl = require("valid-url");
const Url =  require('../models/Url');
require('dotenv').config()

const Joi  =  require('@hapi/joi');

const schemaRegister = Joi.object({
    longUrl: Joi.string().min(6).max(255).required(),
}) 

const schema = Joi.object(
    {
        longUrls:Joi.array().min(3).max(100).items(Joi.string().min(6).max(255).required())
    }
)

const clicks = 10;
router.post("/register", async (req,res)=>{

    const {error} = schemaRegister.validate(req.body);
    if (error) {
        return res.status(400).json({error:error.details[0].message})
    }
    const longUrl =  req.body.longUrl;
    const urlCode = shortid.generate();

    
    if (validUrl.isUri(longUrl)) {
        
        try {
            var url =  await Url.findOne({longUrl:longUrl})

            if (url) {
                return  res.status(200).json(url) 
            }
            else{
                // return res.status(200).json(process.env.baseUrl)
                const shortUrl = process.env.baseUrl + "/" + urlCode;
                url  = new Url({
                    urlCode,
                    longUrl,
                    shortUrl,
                    clickCount:0
                });
                await url.save();
                return res.status(201).json(url)
            } 
 
            

            
        } catch (err) {
            console.error(err.message)
            return res.status(500).json("Internal Serve error "+err.message)
        }
    }else{
        return res.status(200).json("Error de url")
    }
})

router.get('/:redirectUrl', async(req,res)=>{

    const redirectUrl =  req.params.redirectUrl
    const url = await Url.findOne({urlCode:redirectUrl})
    
    
    if (!url) {
        return res.status(200).json({
            "error":true,
            "message":"the url does not exist"
        })
    }
    var clickCount =  url.clickCount;
    clickCount++;
    await url.update({clickCount})
    return res.redirect(url.longUrl);
    
});

router.post('/registerBulk',async(req,res)=>{

    const {error} = schema.validate(req.body)
    if (error) {
        return res.status(400).json({error:error.details[0].message})
        
    }

    req.body.longUrls.forEach(item => {

        if (validUrl.isUri(item)) {
            const urlCode = shortid.generate();
            const shortUrl = process.env.baseUrl + "/" + urlCode;
            url  = new Url({
                urlCode,
                longUrl:item,
                shortUrl,
                clickCount:0
            });
            url.save();
        }else{
            console.log("no es una url "+item)
        }
    });
    // const urls =  req.body.longUrls;
    return res.status(200).json({"message":"hola"})
});


module.exports = router