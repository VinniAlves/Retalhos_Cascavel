const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;

const fs = require('fs');
const fsextra= require('fs-extra')
const fsPath = require('path')

const caminhoImg = process.env.PAST_CAMINHO

//GET pecas

//Post pecas

exports.postPecas = (req,res,next)=>{
    //Informa qual paste deverá ser incluido
    fs.mkdir(fsPath.join(caminhoImg,`${req.body.NomePeca}`),(erro)=>{
        if(erro){
            return console.log("erro:", erro)
        }
    
        console.log("Pasta criada com sucesso")
    })



    mysql.getConnection((error,conn)=>{
        //Caso gerar um erro
        if(error){return res.status(500).send({error:error})}
        const imagePaths=[];

        for(let i =0; i< 3 && i < req.files.length; i++){
            imagePaths.push(req.files[i].path);
        }

        conn.query(
           // "INSERT INTO pecas (NomePeca,CodigoPeca,Tipo,Marca,MercadoURL,ImagemNome,ImagemURLI,ImagemURLII,ImagemURLIII) values (?,?,?,?,?,?,?,?,?)",
           "INSERT INTO pecas (NomePeca,CodigoPeca,Tipo,Valor,Marca,MercadoURL,ImagemNomeI,ImagemNomeII,ImagemNomeIII,"
            +"ImagemURLI,ImagemURLII,ImagemURLIII) values (?,?,?,?,?,?,?,?,?,?,?,?)",
           [
                req.body.NomePeca,
                req.body.CodigoPeca,
                req.body.Tipo,
                req.body.Valor,
                req.body.Marca,
                req.body.MercadoURL,
                req.body.ImagemNomeI,
                req.body.ImagemNomeII,
                req.body.ImagemNomeIII,
                imagePaths[0],
                imagePaths[1],
                imagePaths[2]
                //req.file.path
                //req.file.path
            ],
            (error,resultado,fields)=>{
                conn.release();

                if(error){return res.status(500).send({error:error})}

                return res.status(201).send({
                    message: "Peca inserida com sucesso",
                    id_Produto: resultado.insertId,
                })

            }
        )
    
    })

}

exports.getPecas =(req,res,next)=>{
    mysql.getConnection((error,conn)=>{
        if(error){return res.status(500).send({error:error})}

            conn.query(
                'SELECT * FROM pecas',

                (error,resultado,fields)=>{
                    if(error){return res.status(500).send({error:error})}

                    const response={
                        Quantidade: resultado.length,
                        Pecas: resultado.map(prod=>{
                            return{
                                Id_Pecas: prod.idPecas,
                                Nome_Pecas: prod.NomePeca,
                                Codigo_Pecas: prod.CodigoPeca,
                                Tipo_Pecas: prod.Tipo,
                                Valor_Peca: prod.Valor,
                                Marca: prod.Marca,
                                URL_MercadoLivre: prod.MercadoURL,
                                Imagem_Nome: prod.ImagemNomeI,
                                URL_Imagem: prod.ImagemURLI,
                                Imagem_NomeI: prod.ImagemNomeII,
                                URL_ImagemI: prod.ImagemURLII,
                                Imagem_NomeII: prod.ImagemNomeIII,
                                URL_ImagemII: prod.ImagemURLIII
                            }
                        })

                    }
                    return res.status(200).send({response})
                }
            )
    })
}

exports.deletePecas =(req,res,next)=>{
    
    mysql.getConnection((error,conn)=>{
        if(error){return res.status(500).send({error:error})}
        conn.query(


            //  DEVERÁ EXCLUIR A PASTA DE DESTINO ANTES DA EXCLUSÃO SO REGISTROS
            // A IDEIA É BUSCAR AS INFORMAÇÕES PARA SABER O NOME DA PASTA E COM ISSO EXCLUIR A PASTA COM OS ARQUIVOS DENTRO

            "SELECT * FROM pecas where idPecas =?",
            [req.body.id_Peca],
            (error,resultado,fields)=>{
                if(error){return res.status(500).send({error:error})}
                
                const response={
                    
                    Quantidade: resultado.length,
                   
                    
                    Pecas: resultado.map(prod=>{
                        return{
                            Id_Pecas: prod.idPecas,
                            Nome_Pecas: prod.NomePeca,
                           
                        }
                    })

                }
                //Não precisa retornar isso
                //return res.status(200).send({response}),     
                    

                fsextra.remove(`${caminhoImg}/${response.Pecas[0].Nome_Pecas}/`,err=>{
                    console.error(err)
                },
                
                    conn.query(
                            "DELETE FROM pecas WHERE idPecas = ?",
                            [req.body.id_Peca],
                            
                            (error , resultado , fields)=>{
                                conn.release();
                
                                if(error){return res.status(500).sed({error:error})}

                                if(resultado.length == 0){
                                    return res.status(404).send({
                                        mensagem: "Não foi encontrado o ID"
                                    })
                                }
                            
                            return res.status(202).send({
                                mensagem: 'Peça removido com sucesso'
                            })
                            
                            }

                    ),
            
                )

            }
        
            
        )
    })
}


exports.patchPecas= (req,res,next)=>{

    mysql.getConnection((error, conn)=>{
        if(error){return res.status(500).send({error:error})}

            if(error){return res.status(500).send({error:error})}
            const imagePaths=[];

            for(let i =0; i< 3 && i < req.files.length; i++){
                imagePaths.push(req.files[i].path);
            }

            conn.query(

                 "UPDATE pecas SET NomePeca=?, CodigoPeca=?, Tipo=?,Valor=?, Marca=?,"+
                " MercadoURL=?, ImagemNomeI=?, ImagemNomeII=?,ImagemNomeIII=? , ImagemURLI=?,ImagemURLII=? , ImagemURLIII=?"+
                " WHERE idPecas =?",

               [
                req.body.NomePeca,
                req.body.CodigoPeca,
                req.body.Tipo,
                req.body.Valor,
                req.body.Marca,
                req.body.MercadoURL,
                req.body.ImagemNomeI,
                req.body.ImagemNomeII,
                req.body.ImagemNomeIII,
                imagePaths[0],
                imagePaths[1],
                imagePaths[2],
                req.body.idPecas
               ],
               (error, resultado,fields)=>{
                conn.release();
                if(error){return res.status(500).send({error:error})}

                return res.status(202).send({
                    mensagem: "Produto atualizado com Sucesso"
                })

               }


            )


    })

}
