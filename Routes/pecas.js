const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs')
const path = require('path')
require('dotenv').config()

const Login = require('../Middleware/login')

// Realizar o login

const PecaController = require('../Controllers/pecas-controller')

const storagePatch = multer.diskStorage({

    destination:function(req,file,cb){
        const AquiveName = req.body.NomePeca;
        const destino = `${process.env.PAST_CAMINHO}${AquiveName}/`;
        
        
       // PRECISO CORRIGIR PARA QUE EXCLUSA ANTES DA ADICIÇÃO DOS ARQUIVOS (erro que talvez não influencia)
       // Criar uma validação que ao verificar se tem a pasta, caso não tiver não deverá criar uma nova pasta
            fs.readdir(destino,(err,files)=>{
                if(err){
                    console.log("Erro ao listar todos os arquivos na pasta",err);
                    return;
                }
                    files.forEach((file)=>{
    
                        const filePath = path.join(destino,file);
    
                        fs.unlink(filePath,(err)=>{
                            if(err){
                                console.error("Error ao excluir o arquivo", err);
    
                            }else{
                                console.log("Arquivo excluido");
                            }
                        })
                    })   
            })
        
    
    
        fs.mkdir(destino, (err)=>{
            if(err&& err.code !== 'EEXIST'){
                return cb(err);
            }
            cb(null,destino);
        })
    
    
    },
    
        filename: function(req,file,cb){
            //new Date() para informar uma data junto com o nome
            let data = new Date().toISOString().replace(/:/g, '-') + '-'
            cb(null, data + file.originalname);
        }
    })
    

const storagePost = multer.diskStorage({

destination:function(req,file,cb){
    const AquiveName = req.body.NomePeca;
    const destino = `${process.env.PAST_CAMINHO}${AquiveName}/`;


// Cria o arquivo na pasta
    fs.mkdir(destino, (err)=>{
        if(err&& err.code !== 'EEXIST'){
            return cb(err);
        }
        cb(null,destino);
    })

},

    filename: function(req,file,cb){
        //new Date() para informar uma data junto com o nome
        let data = new Date().toISOString().replace(/:/g, '-') + '-'
        cb(null, data + file.originalname);
    }
})

const fileFilter = (req,file,cb)=>{
    //so aceitar um tipo de arquivo
    if(file.mimetype === 'image/jpeg'|| file.mimetype ==='image/png' || file.mimetype ==='image/jpg'){
        cb(null,true);
    }else{
        cb(null,false);
    }
    
    
}

const upload = multer({
    storage: storagePost,
    limits:{
        //Declara em bits
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
})

const uploadPatch = multer({
    storage: storagePatch,
    limits:{
        //Declara em bits
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
})

const PhotoMax = 3;



router.post('/', Login.obrigatorio,upload.array('peca_imagem',PhotoMax),PecaController.postPecas);

router.get('/',PecaController.getPecas);

router.delete('/',Login.obrigatorio,PecaController.deletePecas);

router.patch('/',Login.obrigatorio, uploadPatch.array('peca_imagem',PhotoMax), PecaController.patchPecas);


module.exports = router;