const express = require('express');
const Joi = require('joi');
const ruta = express.Router();
//const eventos = require('./eventos')

//_______________________________________________________________Clase
class estudiante {
    constructor(id, nombre, email, carrera, semestre){
        this.id = id,
        this.nombre = nombre,
        this.email = email,
        this.carrera = carrera,
        this.semestre = semestre
    }
};


ids = 3;

//_______________________________________________________________Objetos creados

var estudiantes = [
    new estudiante(1, "Juan Perez", "juan@example.com", "Ingeniería en Sistemas", 3),
    new estudiante(2, "Ana Garcia", "ana@example.com", "Licenciatura en Administración", 5),
    new estudiante(3, "Pedro Ramirez", "pedro@example.com", "Ingeniería Civil", 4)
];

//_______________________________________________________________Validaciones

function existeEstudiante(id) {
    return (estudiantes.find(e => e.id === parseInt(id)));
}

function existeCorreo(correo){
    for(var i = 0; i< estudiantes.length; i++){
        if(estudiantes[i].email.toLowerCase() === correo){
            return true;
        }
    }
    return false;
}

function validarEstudiante(alumno) {
    const schema = Joi.object({
        nombre: Joi.string().min(3).required(),
        email: Joi.string().email().required(),
        carrera: Joi.string().required(),
        semestre: Joi.string().required()
    });
    return schema.validate(alumno);
}

//_______________________________________________________________GETS

ruta.get('/', (req, res) => {
    res.send(estudiantes);
})


ruta.get('/:id', (req, res) => {
    const id = req.params.id;
    let estudiante = existeEstudiante(id);
    if(!estudiante)
    {
        res.status(404).send(`El estudiante con ID: ${id} no se ha encontrado`);
        return;
    }
    res.send(estudiante);
    return;
})

//_______________________________________________________________POST

ruta.post('/', (req, res) => {
    const {error, value} = validarEstudiante(req.body);
    if(!error){
        if(existeCorreo(req.body.email)){
            res.status(400).send(`El correo ${req.body.email} ya existe`);
            return;
        }
        ids = ids +1;
        const alumno = new estudiante(
            ids,
            req.body.nombre,
            req.body.email,
            req.body.carrera,
            req.body.semestre
        );
        estudiantes.push(alumno);
        res.send(alumno);
    } else {
        const mensaje = error.details[0].message;
        res.status(400).send(mensaje);
    }
})

//_______________________________________________________________PUT

ruta.put('/:id', (req, res) => {
    let estudiante = existeEstudiante(req.params.id);
    if(!estudiante){
        res.status(404).send(`No se ha encontrado el alumno con ID: ${req.params.id}`);
        return;
    }
    const {error, value} = validarEstudiante(req.body);
    if(!error){
        if(existeCorreo(req.body.email)){
            res.status(400).send(`El correo ${req.body.email} ya existe`);
            return;
        }
        else{
            estudiante.nombre = value.nombre;
            estudiante.email = value.email;
            estudiante.carrera = value.carrera;
            estudiante.semestre = value.semestre;

            res.send(estudiante);
        }
    }
    else if(error){
        const mensaje = error.details[0].message;
        res.status(400).send(mensaje);
    }
      return;
})

//_______________________________________________________________DELETE

ruta.delete('/:id', (req, res) => {
    let alumno = existeEstudiante(req.params.id);
    if(!alumno){
        res.status(404).send(`No se ha encontrado el evento con ID: ${req.params.id}`);
        return;
    }
    const index = estudiantes.indexOf(alumno);
    estudiantes.splice(index, 1);
    res.send(alumno);
})

const estudianteRoutes = {
    ruta,
    estudiantes,
  };
  
  module.exports = estudianteRoutes;
 


