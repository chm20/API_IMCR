'use strict'

//Requires
const express = require('express');
const logger = require('morgan');
const jsondb = require('simple-json-db');
const multer = require('multer');
const { response } = require('express');
const path = require('path');
////

//Configuraciones
const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const db = new jsondb("." + path.sep + "db.json");
app.use(logger('dev'));

//Config del almacenamiento
var storage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,'.' + path.sep + 'uploads');
    },
    filename: function (req,file,cb){
        const mimetype = file.mimetype;
        const filetype = mimetype.split('/')[1];
        cb(null, file.fieldname + '-' + Date.now() + '.' + filetype);
    }
})
var upload = multer({ storage: storage });
app.use('/uploads', express.static('./uploads'));
////

//ENDPOINT PARA IMÁGENES
app.post('/images', upload.single('imagen'), (request,response,next) => {
    db.set(request.body["id"], {
        "image": request.file.path
    });
    response.status(200).json({
        "message": "Imagen subida"
    });
});

////

//ENDPOINT PARA INTERFAZ
app.post('/request', (request,response,next) => {
    const body = request.body;

    if(body["vehicle_latitude"] &&
        body["vehicle_longitude"] &&
        body["destination_latitude"] &&
        body["destination_longitude"] &&
        body["vehicle_size"]
    ){
        //procesamiento
        const num = Math.floor(Math.random() * (3 - 0)) + 0;
        const array = db.get("ejemplos");

        response.status(200).json(array[num]);
    }
    else{
        response.status(400).json({
            "message": "Bad request"
        });
    }
});
////

app.listen(8080, () => {
    console.log('API listening on 8080');
});