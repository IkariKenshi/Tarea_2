const express = require('express');
const Joi = require('joi');
const ruta = express.Router();
const estudiantes = require('./estudiantes');
console.log(estudiantes.estudiantes);


//_______________________________________________________________Clase

class evento{
    constructor(idE, titulo, fecha, hora, lugar, NombreOrador, listaRe = []){

        this.idE = idE,
        this.titulo = titulo,
        this.fecha = fecha,
        this.hora = hora,
        this.lugar = lugar,
        this.NombreOrador = NombreOrador,
        this.listaRe = listaRe
    }
};

var idEC = 3;

//_______________________________________________________________Objetos creados
var eventos = [
    new evento(1, "Conferencia de Ciencia", "2023-05-15", "9:00", "Auditorio Central", "Dr. Juan Pérez", [1, 3]),
    new evento(2, "Taller de Marketing Digital", "2023-06-01", "14:00", "Sala 102", "Lic. María Rodríguez", [1, 2]),
    new evento(3, "Exposición de Arte Contemporáneo", "2023-06-10", "18:00", "Galería de Arte", "Artista invitado", [2, 3])
];

//_______________________________________________________________Validaciones

function existeEvento (idE){
    return (eventos.find(n => n.idE === parseInt(idE)))
}

function existeDisponibilidad(fecha, hora, lugar){
    for(let i = 0; i < eventos.length; i++){
        if(eventos[i].fecha === fecha && eventos[i].hora === hora && eventos[i].lugar === lugar){
            return true;
        }
    }
    return false;
}

function validarEvento(evento) {
    const schema = Joi.object({
        titulo: Joi.string().min(3).required(),
        fecha: Joi.string().required(),
        hora: Joi.string().required(),
        lugar: Joi.string().required(),
        NombreOrador: Joi.string().required(),
        listaRe: Joi.array().items(Joi.number()).unique().required() // unicos y numeros
    });
    return schema.validate(evento);
}

function obtenerIdsNoEncontrados(estudiantes, listaAlum){
    const noEncontrados = [];
    for(let i = 0 ; i < listaAlum.length; i++){
      let encontrado = false;
      for(let j = 0 ; j < estudiantes.estudiantes.length; j++){
        if(estudiantes.estudiantes[j].id === listaAlum[i]){
          encontrado = true;
          break;
        }
      }
      if(!encontrado){
        noEncontrados.push(listaAlum[i]);
      }
    }
    return noEncontrados;
  }

// Función que obtiene los datos del estudiante según el id
function obtenerEstudiantePorId(id) {
    for (let i = 0; i < estudiantes.estudiantes.length; i++) {
      if (estudiantes.estudiantes[i].id == id) {
        return estudiantes.estudiantes[i];
      }
    }
    return null;
  }

  // Función que recorre la lista de ids y devuelve los datos de los estudiantes
  function obtenerEstudiantesPorLista(listaIds) {
    return listaIds.map((id) => obtenerEstudiantePorId(id));
  }

//_______________________________________________________________GETS

ruta.get('/', (req, res) => {
    res.send(eventos);
})


ruta.get('/:idE', (req, res) => {
    const idE = req.params.idE;
    let evento = existeEvento(idE);
    if(!evento){
        res.status(404).send(`El evento ${idE} no se ha encontrado`);
        return;
    }
    const estudiantesEvento = obtenerEstudiantesPorLista(evento.listaRe);
    evento = {...evento, estudiantes: estudiantesEvento};
    res.send(evento);
    return;
  })

//_______________________________________________________________POST

ruta.post('/', (req, res) => {
    const { error, value } = validarEvento(req.body);
    if (!error) {
        if(existeDisponibilidad(req.body.fecha, req.body.hora, req.body.lugar)){
            res.status(400).send(`Ya existe un evento que existe en esa fecha, hora y lugar`);
            return;
        }
        const idsNoEncontrados = obtenerIdsNoEncontrados(estudiantes, req.body.listaRe);
        if(idsNoEncontrados.length > 0){
          res.status(404).send(`Los siguientes ids no se encontraron en la lista de estudiantes: ${idsNoEncontrados }`);
          return;
        }
        idEC = idEC + 1;
        const event = new evento(
            idEC,
            req.body.titulo,
            req.body.fecha,
            req.body.hora,
            req.body.lugar,
            req.body.NombreOrador,
            req.body.listaRe
        );
        eventos.push(event);
        res.send(event); // Enviamos solamente el objeto idE
    }
    else {
      const mensaje = error.details[0].message;
      res.status(400).send(mensaje);
    }
});

//_______________________________________________________________PUT

ruta.put('/:idE', (req, res) => {
    let evento = existeEvento(req.params.idE);
    if(!evento){
        res.status(404).send(`No se ha encontrado el evento con ID: ${req.params.idE}`);
        return;
    }
    const {error, value} = validarEvento(req.body);
    if(!error){
        if(existeDisponibilidad(req.body.fecha, req.body.hora, req.body.lugar)){
            res.status(400).send(`Ya existe un evento que existe en esa fecha, hora y lugar`);
            return;
        }
        const idsNoEncontrados = obtenerIdsNoEncontrados(estudiantes, req.body.listaRe);
        if(idsNoEncontrados.length > 0){
          res.status(404).send(`Los siguientes ids no se encontraron en la lista de estudiantes: ${idsNoEncontrados}`);
          return;
        }
        else{
            evento.titulo = value.titulo;
            evento.fecha = value.fecha;
            evento.hora = value.hora;
            evento.lugar = value.lugar;
            evento.NombreOrador = value.NombreOrador;
            evento.listaRe = value.listaRe;

            res.send(evento);
        }
    }
    else if(error){
        const mensaje = error.details[0].message;
        res.status(400).send(mensaje);
    }
      return;
})

//_______________________________________________________________DELETE

ruta.delete('/:idE', (req, res) => {
    let evento  = existeEvento(req.params.idE);
    if(!evento){
        res.status(404).send(`No se ha encontrado el evento con ID: ${req.params.idE}`)
        return;
    }
    const index = eventos.indexOf(evento);
    eventos.splice(index, 1);
    res.send(evento);
})

ruta.delete('/estudiantes/:id', (req, res) => {
    const id = req.params.id;
    const index = estudiantes.estudiantes.findIndex(e => e.id === parseInt(id));
    if (index === -1) {
      return res.status(404).send('El estudiante no existe');
    }
    estudiantes.estudiantes.splice(index, 1);

    // Actualizar eventos
    eventos.forEach(evento => {
      const index = evento.listaRe.indexOf(parseInt(id));
      if (index !== -1) {
        evento.listaRe.splice(index, 1);
      }
    });

    res.send('Estudiante eliminado correctamente');
  });


const eventosObjetos = {
    ruta,
    eventos
};

module.exports = eventosObjetos;