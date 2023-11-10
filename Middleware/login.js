const jwt = require('jsonwebtoken');
require('dotenv').config()

exports.obrigatorio = (req,res,next)=>{
    
    try{
        // Passando Token pelo Header
        const token = req.headers.authorization.split(' ')[1]

        //decode token autenticado
        const decode =jwt.verify(token, process.env.JWT_KEY);
        req.usuario = decode;
        //next pula para proximo evento, exemplo login -> requisão do post
        next();

    }catch(error){
        return res.status(401).send({mesagem: "Falha na Autenticação"})
    }


}

// Para autenticação caso não passe o token
exports.opcional = (req,res,next)=>{
    
    try{
        // Passando Token pelo Header
        const token = req.headers.authorization.split(' ')[1]

        //decode token autenticado
        const decode =jwt.verify(token, process.env.JWT_KEY);
        req.usuario = decode;
        //next pula para proximo evento, exemplo login -> requisão do post
        next();

    }catch(error){
        next();
    }


}