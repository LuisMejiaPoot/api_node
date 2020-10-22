// cors
const cors = require('cors');


const configCore = async(app) =>{
    var corsOptions = {
        origin: '*', // Reemplazar con dominio
        optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
    }
    app.use(cors(corsOptions));
}

module.exports = configCore;