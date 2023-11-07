const express = require('express');
const morgan = require('morgan');
const app = express();
const bodyParser = require('body-parser');

const rotaPeca = require('./Routes/pecas');
const rotaUsuario = require('./Routes/usuario')

var cors = require('cors')


app.use(morgan('dev'));

//app.use('/ImageUploads',express.static('ImagemUploads'))

app.use(bodyParser.urlencoded({extended: false})); // apenas dados simples

app.use(bodyParser.json())

app.use(cors());
app.options('*', cors());


app.use('/retalhos-cascavel',rotaPeca);

app.use('/retalhos-cascavel/usuarios',rotaUsuario);

app.use((req,res,next)=>{
    const erro = new Error("Não Contrado");
    erro.status(404);
    next(erro);
});

app.use((error,req,res,next)=>{
    res.status(error.status || 500);
    return res.send({
        erro:{
            mesagem: error.mesagem
        }
    })
})

module.exports = app;