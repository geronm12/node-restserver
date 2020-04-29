const express = require('express');

const {verificaToken} = require('../middlewares/authenticacion');

let app = express();


let Producto = require('../models/producto');



//Buscar productos
app.get('/productos/buscar/:termino',verificaToken,(req, res) => {

let termino = req.params.termino;

let regexp = new RegExp(termino, 'i');


Producto.find({nombre: regexp})
.populate('categoria', 'descripcion')
.exec((err, productos) => {

if(err){
    return res.status(500)
    .json({
    ok: false,
    err
    })
}

res.json({
    ok: true,
    productos
})

});



});



// Obtener producto

app.get('/productos',verificaToken, (req, res) => {

//populate: usuario , categoria
//paginado

let desde = req.query.desde || 0;
desde = Number(desde);
 
Producto.find({disponible: true})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {
        
        if(err){
            return res.status(500)
            .json({
            ok: false,
            err
            });
        }


        res.json({
            ok: true,
            productos
        });
     });
});


//Obtener un producto por id
app.get('/productos/:id', verificaToken,(req, res) => {

let id = req.params.id;

Producto.findById(id)
.populate('usuario', 'nombre email')
.populate('categoria', 'descripcion')
.exec((err, productoDB) => {

if(err){
    return res.status(500)
    .json({
    ok: false,
    err
    });
}

if(!productoDB){
    return res.status(400)
    .json({
    ok: false,
    err: {
        message: 'No se encontró el producto'
    }
    });
}

res.json({
ok: true,
producto: productoDB
})


});

});

//Crear Producto
app.post('/productos', verificaToken, (req, res) => {

let body = req.body;

let nuevoProducto = new Producto({
    nombre: body.nombre,
    precioUni: body.precioUni,
    descripcion: body.descripcion,
    categoria: body.categoria, 
    usuario: body.usuario._id
});

nuevoProducto.save((err, productoDB) => {

if(err){
    return res.status(500)
    .json({
    ok: false,
    err
    });
}


res.json({
ok: true,
producto: productoDB
});

});

});

//Actualizar producto
app.put('/productos/:id', verificaToken,(req, res) => {

let id = req.params.id;
let body = req.body;


Producto.findByIdAndUpdate(id, body, {new : true, runValidators: true}, (err, productoDB) => {

if(err){
    return res.status(500)
    .json({
    ok: false,
    err
    });
}

if(!productoDB){
    return res.status(400)
    .json({
    ok: false,
    err: {
        message: 'No se encontró el producto'
    }
    });
}


res.json({
ok: true,
producto: productoDB
});


});


});


//Borrar producto
app.delete('/productos/:id', verificaToken, (req, res) => {

    let id = req.params.id;

    let nuevoEstado = {
        disponible: req.body.disponible
    }
    
    Producto.findByIdAndUpdate(id, nuevoEstado, {new : true, runValidators: true}, (err, productoDB) => {
    
    if(err){
        return res.status(500)
        .json({
        ok: false,
        err
        });
    }
    
    if(!productoDB){
        return res.status(400)
        .json({
        ok: false,
        err: {
            message: 'No se encontró el producto'
        }
        });
    }
    
    
    res.json({
    ok: true,
    producto: productoDB
    });
    

});

});



module.exports = app;