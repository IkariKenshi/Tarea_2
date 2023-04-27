const express = require('express');
const app = express();
const Joi = require('joi');

const estudianteRoutes = require('./routes/estudiantes')
const eventos = require('./routes/eventos')

//__________________________________________________________________Clases


app.use(express.json());

app.use(express.urlencoded({extended:true}));

app.use(express.static('public'));




app.use('/api/estudiantes', estudianteRoutes.ruta);
app.use('/api/eventos', eventos);

const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`Escuchando en el puerto ${port}...`)
}) 