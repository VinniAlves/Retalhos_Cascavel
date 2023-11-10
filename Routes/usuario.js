const express = require('express')
const router = express.Router();
const mysql = require('../mysql').pool;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')

//CREDENCIAIS ENIAR NO RAW-JSON


router.post('/cadastro',(req,res,next)=>{

    mysql.getConnection((error,conn)=>{

        if(error){return res.status(500).send({error:error})}

        conn.query('SELECT * FROM usuarios where email = ?',[req.body.email],(error,results)=>{

            if(error){return res.status(500).send({error:error})}

            //verifica se já tem um e-mail igual
            if(results.length >0){
                res.status(409).send({message: "Usuario já existe com esse e-mail"})
            }else{
                    //Criptografa a senha em string
                    //"salt" ajuda a jogar uns caracteres a mais na senha no caso no numero "10"
                bcrypt.hash(req.body.senha,10,(errBcrypt,hash)=>{

                    if(errBcrypt){
                        return res.status(500).send({error:errBcrypt})
                    }

                    conn.query('INSERT INTO usuarios (email,senha) VALUES  (?,?)',
                        [
                            req.body.email,
                            // No caso o Hash seria a senha já criptografada
                            hash
                        ],
                        (error,results)=>{

                            conn.release();

                            if(errBcrypt){
                                return res.status(500).send({error:error})
                            }

                            const response ={
                                message: "Usuário criado com sucesso",
                                usuarioCriado: {
                                    id_Usuario: results.insertId,
                                    email: req.body.email
                                }
                            }
                            return res.status(201).send({response})
                        })
                })
            }
        })
    })
})

router.post('/login',(req,res,next)=>{
    mysql.getConnection((error,conn)=>{
        if(error){return res.status(500).send({error:error})}

            const query = 'SELECT * FROM usuarios WHERE email=?'
            conn.query(query,[req.body.email],(error,results,fields)=>{
                conn.release();
                if(error){return res.status(500).send({error:error})}
                // Verifica se o e-mail não existe
                if(results.length < 1){
                    return res.status(401).send({message: "Falha na Autenticação"})

                }

                // Compara se a senha digitado foi a correta
                bcrypt.compare(req.body.senha,results[0].senha, (err,result)=>{
                    //Se gerou algum erro cai aqui
                    if(err){
                        return res.status(401).send({message: "Falha na Autenticação"})
                    }
                    //Se  acertou a senha entra aqui
                    if(result){
                        //Criamos e definimos o tempo que o token permanecera ativo
                        const token = jwt.sign({
                            idUsuario: results[0].idUsuario,
                            email: results[0].email
                        }, 
                        process.env.JWT_KEY,
                        { expiresIn: "1h"})

                        return res.status(200).send({message: "Autenticado com sucesso",
                        token: token
                    })
                    }
                    //Se errou a senha entra nessa condição aqui 
                      return res.status(401).send({message: "Falha na Autenticação"})
                })
            })

    })

})


module.exports = router;