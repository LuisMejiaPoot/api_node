const express = require('express');
const mongoose = require('mongoose');
const bodyparser = require('body-parser');
const validToken = require('./middleware/validate-token')
require('dotenv').config()

const connectDB  = require('./config/db')
const configCore = require('./config/core')
const app = express();

// capturar body
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

// Conexión a Base de datos
// Conexión a Base de datos

connectDB();
configCore(app);



// import routes
const authRoutes = require('./routes/auth');
const urlRoutes = require('./routes/urls');
const redirectAction =  require('./routes/redirect')
// route middlewares

app.use('/api/user',authRoutes);
app.use('/api/url',validToken,urlRoutes);
app.use('/',redirectAction)

app.get('/', (req, res) => {

        res.json({
            estado: true,
            mensaje: 'funciona!'
        })
        
  

});

// iniciar server
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`servidor andando en: ${PORT}`)
})