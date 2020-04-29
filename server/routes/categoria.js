const express = require('express');

const _ = require('underscore');

let {verificaToken, verificaAdmin_Role} = require('../middlewares/authenticacion');

let app = express();

let Categoria =  require('../models/categoria');


//Muestra todas las categorías

app.get('/categoria', verificaToken, (req, res) => {


 Categoria.find({estado: true})
          .sort('descripcion')
          .populate('usuario', 'nombre email')
          .exec((err, categorias) => {
            if(err) {
                return res.status(400).json({
                ok: false,
                err
                }); 
            }
            
            
            Categoria.countDocuments({estado: true},(err, conteo) => {

            res.json({
            ok: true,
            categorias,
            conteo
            });
   

            });
            
          });

});


//Mostrar una categoría

app.get('/categoria/:id', verificaToken, (req, res) => {

let id = req.query.id;

Categoria.findById(id, (err, categoriaDB) => {

if(err){
    res.status(400)
    .json({
    ok: false,
    err
    });
}


if(!categoriaDB){
    res.status(404)
    .json({
    ok: false,
    err: {
     message: 'No se encontró la categoría'
    }
    });
}

res.json({
ok: true,
categoria: categoriaDB
})


});



});


//Crear nueva categoría
app.post('/categoria',verificaToken, (req, res) => {

let body = req.body;

let nuevaCategoria = new Categoria({
descripcion: body.descripcion,
usuario: req.usuario._id
});

nuevaCategoria.save((err, categoriaDB) => {

if(err) {
   return res.status(500)
    .json({
    ok: false,
    err
    });
}

if(!categoriaDB)
{
    return res.status(400)
    .json({
    ok: false,
    err
    });
}

res.json({
ok: true,
categoria: categoriaDB
});


});




});


//Modifica Categoria 
app.put('/categoria/:id',verificaToken, (req, res) => {

let body = _.pick(req.body, ['descripcion'])

let id = req.params.id;


Categoria.findByIdAndUpdate(id, body, {new : true, runValidators: true},(err, categoriaDB) => {

    if(err){
        res.status(400)
        .json({
        ok: false,
        err
        });
    }

    if(!categoriaDB){
     res.status(400)
     .json({
      ok: false,
      err: {
          message: 'No se encontró la categoría'
      }
     });
    }


    res.json({
    ok: true,
    categoriaDB
    });


});



});

//Eliminar Categoria
app.delete('/categoria/:id', [verificaToken, verificaAdmin_Role], (req, res) => {

   let id = req.params.id;
   let cambiaEstado = {
       estado: false
   }

   Categoria.findByIdAndUpdate(id, cambiaEstado, {new : true, runValidators: true},(err, categoriaBorrada) => {
   
            if(err){
                res.status(400)
                .json({
                ok: false,
                err
                });
            }

            if(!categoriaBorrada){
                res.status(400)
                .json({
                ok: false,
                err: {
                    message: 'No se encontró la categoría'
                }
                });
            }

            res.json({
            ok: true,
            categoria: categoriaBorrada
            })

   });
 
});



module.exports = app;