const express = require('express');
const app = express();
const Joi = require('joi');

const estudiantes = require('./routes/estudiantes');
const eventos = require('./routes/eventos');

//__________________________________________________________________Clases


app.use(express.json());

app.use(express.urlencoded({extended:true}));


app.use('/api/estudiantes', estudiantes.ruta);
app.use('/api/eventos', eventos.ruta);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Escuchando en el puerto ${port}...`)
}) 