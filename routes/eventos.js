const express = require('express');
const Joi = require('joi')
const ruta = express.Router();
const estudiantes = require('./estudiantes');


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
    detallesEvento() {
        return `Id Evento: ${this.idE}, Titulo: ${this.titulo}, fecha: ${this.fecha}, hora: ${this.hora}, lugar: ${this.lugar}, Orador: ${this.NombreOrador}, Lista de Alumnos: \t\n${this.listaRe}`;
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

console.log(estudiantes.estudiantes)

/* function existeAlumnoLista(estudiantes, listaAlum){
    if(estudiantes.existeEstudiante())
} */
//_______________________________________________________________GETS

ruta.get('/', (req, res) => {
    res.send(eventos)
})

ruta.get('/:idE', (req, res) => {
    const idE = req.params.idE;
    let evento = existeEvento(idE)
    if(!evento){
        res.status(404).send(`El evento ${idE} no se ha encontrado`)
        return;
    }
    res.send(evento);
    return;
})

//_______________________________________________________________POST

ruta.post('/', (req, res) => {
    const { error, value } = validarEvento(req.body);
    if (!error) {
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
        if(existeDisponibilidad(req.body.fecha, req.body.hora, req.body.lugar)){
            res.status(400).send(`Ya existe un evento que existe en esa fecha, hora y lugar`);
            return;
        }
        eventos.push(event);
        res.send(event); // Enviamos solamente el objeto idE
    } else {
        const mensaje = error.details[0].message;
        res.status(400).send(mensaje);
    }
});

//_______________________________________________________________PUT

ruta.put('/:idE', (req, res) => {
    let evento = existeEvento(req.params.idE)
    if(!evento){
        res.status(404).send(`No se ha encontrado el evento con ID: ${evento}`)
        return;
    }
    const {error, value} = validarEvento(req.body);
    if(!error){
        if(existeDisponibilidad(req.body.fecha, req.body.hora, req.body.lugar)){
            res.status(400).send(`Ya existe un evento que existe en esa fecha, hora y lugar`);
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
        res.status(404).send(`No se ha encontrado el evento con ID: ${evento}`)
        return;
    }
    const index = eventos.indexOf(evento);
    eventos.splice(index, 1);
    res.send(evento)
})


module.exports = ruta; //Exporta el objeto ruta 