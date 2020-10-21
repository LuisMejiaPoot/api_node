const mongoose = require('mongoose');

const urlShema =  mongoose.Schema({

    urlCode:{
        type:String,
        required:true,
        min:6,
        max:255
    },
    longUrl:{
        type:String,
        required:true,
    },
    shortUrl:{
        type:String,
        required:true,
    },
    clickCount:{
        type:Number,
        required:true,
    }
})

module.exports = mongoose.model("Url",urlShema);