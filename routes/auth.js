const router   = require('express').Router();
const User =  require('../models/User');
const Joi  =  require('@hapi/joi');

const schemaRegister = Joi.object({
    name: Joi.string().min(6).max(255).required(),
    email: Joi.string().min(6).max(255).required().email(),
    password: Joi.string().min(6).max(1024).required()
}) 


const shemaLogin = Joi.object({
    email: Joi.string().min(6).max(255).required().email(),
    password: Joi.string().min(6).max(1024).required()
})
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.post('/login',async(req,res)=>{
    const {error} = shemaLogin.validate(req.body);
    if (error) return res.status(400).json({error:error.details[0].message})
    
    const user =  await User.findOne({email:req.body.email});
    if (!user)  return res.status(400).json({error:'Usuario no encontrado'})
    

    const validPassword = await bcrypt.compare(req.body.password,user.password);
    if (!validPassword) return res.status(400).json({error:"password invalido"});


    const token = jwt.sign({
        name:user.name,
        id:user._id
    },process.env.TOKEN_SECRET)
    res.header('auth-token',token).json({
        error:null,
        data:{token}
    })
});
router.post('/register',async (req,res) => {


    // validaciones de usuario 

    const {error}  =  schemaRegister.validate(req.body);
    if (error) {
        return res.status(400).json({error: error.details[0].message})
    }

    //validar el email

    const isEmailExist = await User.findOne({email:req.body.email});

    if (isEmailExist) {
        return res.status(400).json({
            error:"El email ya existe"
        })
    }

    // https://www.youtube.com/watch?v=SDnyMwxuv6E&ab_channel=Bluuweb%21
    const salt =  await bcrypt.genSalt(10);
    const password = await bcrypt.hash(req.body.password,salt)
    const user = new User({
        name:req.body.name,
        email:req.body.email,
        password:password
    });

    try {
        const userDB = await user.save();
        res.json({
            "error":null,
            "data":userDB
        })
    } catch (error) {
        res.status(400).json(error);
    }

});

module.exports = router;