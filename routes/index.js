var express = require('express');
var router = express.Router();
var path = require('path');
var _ = require('lodash');
var mongoose = require('mongoose');
let roomsModel = require('../models/rooms');
let usersModel = require('../models/user');
let entriesModel = require('../models/entries');
let pizarrasModel = require('../models/pizarra');
const rooms = mongoose.model('rooms');
const user = mongoose.model('users');
const pizarra = mongoose.model('pizarra')
let entry = mongoose.model('entries');
var randomToken = require('random-token');
const redis = require("redis");
const REDIS_URL = process.env.REDIS_URL;
const web=process.env.WEBPAGE_BASE_URL;
const client = redis.createClient({ host: REDIS_URL })
client.on('error', function (err) {
  console.log('error redis evento - ' + client.host + ':' + client.port + ' - ' + err);
});
client.on('ready', function (err) {
  console.log('conectado a redis');
});
client.on('end', function (err) {
  console.log('desconectado a redis');
});

var apiKey = process.env.TOKBOX_API_KEY;
var secret = process.env.TOKBOX_SECRET;

if (!apiKey || !secret) {
  console.error('=========================================================================================================');
  console.error('');
  console.error('FALTA TOKBOX_API_KEY O TOKBOX_SECRET!!!!');
  console.error('ESTA EL .env??? ', path.resolve('.env'), 'O LAS HAS PUESTO EN LAS VARIABLES DE ENTORNO???');
  console.error('');
  console.error('=========================================================================================================');
  process.exit();
}

var OpenTok = require('opentok');
var opentok = new OpenTok(apiKey, secret);

var roomToSessionIdDictionary = {};

router.get('/', function (req, res) {
  //AQUI IRA EL HOME DE HOLACLASS!!!
  res.render('index', { title: 'Entrada', userId: '5eafecf7b440541b0369ee07' });
  //res.redirect('/room')
});

//AQUI EL FORMULARIO PARA CREAR UNA HABITACION!!
router.get('/room', function (req, res) {
  res.render('crearclase', { title: 'Clase Espira' });
});
/**
 * GET /session ESTE NO SIRVE DE MOMENTO PERO REDIRIGE A /room/session
 */
router.get('/session', function (req, res) {
  res.redirect('/room/session');
});
/**
 * POST /room/
 * crea una sala y guarda en BBDD los datos de la sala
 */
router.post('/room', function (req, res) {
  var roomName = req.body.nombreSala;
  //console.log(req.body);
  console.log(roomName);

  var sessionId;
  var token;
  console.log('creando sala con nombre: ' + roomName);
  opentok.createSession({ mediaMode: 'routed' }, function (err, session) {
    //const room = new rooms(req.body);
    console.log(req.body);
    user.findOne({ email: req.body.email }, function (err, user) {
      let amount = req.body.amount;
      if (user) {

        var tokenSala = randomToken(16);
        var tokenProfe = randomToken(16);
        console.log('el token ' + tokenSala);
        let arrayParticipants;
        if (req.body.participants) {
          let participantes = req.body.participants;
          participantes.map(item => {
            let tokenParticipant = randomToken(16)
            let datosParticipant = {
              email: item,
              token: tokenParticipant
            }
            arrayParticipants.push(datosParticipant);
          });

        }
        let objetoModelo = {
          ownerId: user._id,
          nombreSala: req.body.nombreSala,
          maxParticipants: req.body.maxParticipants,
          sessionId: session.sessionId,
          unifiedToken: tokenSala,
          teacherToken: tokenProfe,
          payment: {
            tipo: req.body.tipoSala,
            amount: amount
          }
        };
        console.log(web);
        if (arrayParticipants) {
          objetoModelo.participants = arrayParticipants;
        }
        const room = new rooms(objetoModelo);
        room.save((err, room) => {
          if (err) {
            console.log(err);
            const error = new Error(err);
            error.status = 500;
            return;
          }
          console.log(room);
          // generate token
          token = opentok.generateToken(session.sessionId);
          res.setHeader('Content-Type', 'application/json');
          res.send({
            apiKey: apiKey,
            sessionId: session.sessionId,
            token: token,
            tokenSala: tokenProfe,
            tokenLink:objetoModelo.unifiedToken,
            web:web
          });
        });
        if (err) {
          console.log(err);
          res.status(500).send({ error: 'createSession error:' + err });
          return;
        }
      }

    });

  });
  // }*/
});
/**
 * GET /room/:name
 */
router.get('/room/:token', function (req, res) {
  var token = req.params.token;

  rooms.findOne({ unifiedToken: token }, function (err, habita) {
    if (habita) {
      //es alumno
      let objetoModelo = {
        salaId: habita._id,
        tokenEntrada: token,
        nombreSala: habita.nombreSala,
        entradaSalida: 1
      };
      const entrada = new entry(objetoModelo);
      entrada.save((err, result) => {
        if (err) {
          console.log(err);
          const error = new Error(err);
          error.status = 500;
          return;
        }
        console.log('el session id es ' + habita.sessionId);
        const sessionId = habita.sessionId;
        const tokenOpen = opentok.generateToken(sessionId);
        console.log(result);
        // generate token
       // res.render('indexalumno', {

        res.render('salaalumno', {
          apiKey: apiKey,
          sessionId: sessionId,
          token: tokenOpen,
          title: habita.nombreSala,
          studentToken:habita.unifiedToken
        });
      });
    }
    else {
      rooms.findOne({ teacherToken: token }, function (err, habita) {
        if (habita) {
          //es profe
          let objetoModelo = {
            salaId: habita._id,
            tokenEntrada: token,
            nombreSala: habita.nombreSala,
            entradaSalida: 1
          };
          const entrada = new entry(objetoModelo);
          //REGISTRO ENTRADA
          entrada.save((err, result) => {
            if (err) {
              console.log(err);
              const error = new Error(err);
              error.status = 500;
              return;
            }
            console.log('el session id es ' + habita.sessionId);
            const sessionId = habita.sessionId;
            const tokenOpen = opentok.generateToken(sessionId);
            const envio = {
              apiKey: apiKey,
              sessionId: sessionId,
              token: tokenOpen,
              title: habita.nombreSala,
              tokenProfe:token
            };
            console.log(envio);
            res.render('salaprofe', envio);
          });
        }
        else {
          //esta sala no existe
          res.send({
            exists: false
          })
        }
      });
    }
  });
});

//ABRIR CERRAR UNA SALA ENVIADO EL TOKEN DEL PROFE!!
//DEBERIA PASARSE A POST PARA MAS SEGURIDAD
router.post('/close', function (req, res) {
  console.log(req.body.token);
  var token = req.body.token;
  rooms.findOne({ teacherToken: token }, function (err, habita) {
    if (habita) {
      //console.log(habita);
      client.hgetall(habita.unifiedToken, function (err, result) {
        console.log(result);
        let datos=result;
        console.log(datos.abierta);
        if (datos) {
          if (datos.abierta == 'false') {
            console.log('la abro');
            datos.abierta = true;
          }
          else {
            console.log('la cierro');
            datos.abierta = false;
          }

          client.hmset(habita.unifiedToken, datos, function (err, reply) {
            console.log(reply);
            res.send({
              exists: true,
              available: true,
              full: false,
              closed: datos.abierta
            });
          });
        }
        else {
          //res.redirect('/room/'+token);
          res.send({
            exists: true,
            available: false
          });
        }
      })
    }
    else {
      res.send({
        exists: false
      });
    }
  });


});



//get el form de acceso
router.get('/acceso/:token', function (req, res) {
  console.log('acceso a la sala ' + req.params.token);
  var token = req.params.token;
  rooms.findOne({ unifiedToken: token }, function (err, habita) {
    if (habita) {
      console.log('existe la habita')
      console.log(habita);
      res.render('acceso', { nombreSala: habita.nombreSala, tipoPago: habita.payment.tipo, amount: habita.payment.amount, token: token });
    }
    else {
      res.send({
        exists: false
      });
    }
  });
});


//COMPRUEBA SI UNA SALA ESTA DISPONIBLE PARA ENTRAR
// ABIERTA? DISPONIBLE? HAY HUECOS?
router.get('/available/:token', function (req, res) {
  console.log(req.params.token);
  var token = req.params.token;
  rooms.findOne({ unifiedToken: token }, function (err, habita) {
    if (habita) {
      console.log(habita);
      client.hgetall(habita.unifiedToken, function (err, result) {
        if (result) {
          if (result.abierta === true && result.participantes > 0) {
            console.log(result);
            //meter datos de usuario en BASE DE DATOS ANALYTICS

            res.redirect('/room/' + token);
          }
          else {
            let llena = false;
            if (result.participantes <= 0) {
              llena = true;
            }
            //res.redirect('/room/'+token);
            res.send({
              exists: true,
              available: true,
              closed: result.abierta,
              full: llena
            });
          }
        } 
        else {
          res.send({
            exists: true,
            available: false
          });
        }

      })
    }
    else {
      res.send({
        exists: false
      });
    }
  });


});



//MODIFICA UNA SALA SUMANDO O RESTANDO UN PARTICIPANTE
//O EN CASO DE SER EL PROFE CREA O CIERRA LA SALA AL SALIR

router.post('/available/', function (req, res) {
  console.log('paso por available');
  var token = req.body.token;
  var available = req.body.available;
  console.log(token+' '+available);
  rooms.findOne({ unifiedToken: token }, function (err, habita) {
    if (habita) {
      //es alumno
      console.log('pasa es alumno');
      client.hgetall(habita.unifiedToken, function (err, result) {
        if (result) {
          console.log(result);
          //la sala esta arrancada
          if (result.participantes <= 0) {
            //pero llena
            res.send({
              exists: true,
              available: true,
              full: true
            });
          }
          else {
            if (result.abierta == false) {
              res.send({
                exists: true,
                available: true,
                full: false,
                closed: true
              });
            }
            else {
              let participantes = available ? result - 1 : result + 1;
              client.hmset(habita.unifiedToken, {
                'participantes': participantes,
                'abierta': true
              }, function (err, reply) {
                console.log(reply);
                res.send({
                  exists: true,
                  available: true,
                  full: false,
                  closed: false
                });
              });
            }
          }
        }
        else
        {
          res.send({
            exists: true,
            available: false,
            full: false,
            closed: false
          });
        }
      })
    }
    else {
      rooms.findOne({ teacherToken: token }, function (err, habita) {
        if (habita) {
          if (available === true) {
            //es profe y entra
            console.log('esprofe');
            let participantes = habita.maxParticipants - 1;
            client.hmset(habita.unifiedToken, {
              'participantes': participantes,
              'abierta': true
            }, function (err, reply) {
              if(err) console.log(err);
              console.log(reply);
              res.send({
                exists: true,
                available: true,
                full: false,
                closed: false
              });
            });
          }
          else {
            //SALE DE LA SALA PORQUE BORRAMOS DE LA CACHE LA SALA
            client.del(habita.unifiedToken, function (err, reply) {
              console.log(reply);
              res.send({
                exists: true,
                available: false,
                full: false
              });
            });
          }

        }
        else {
          res.send({
            exists: false
          });
        }
      });
    }
  });
});
/**
 * 
 * GRABA LA SALA
 */
router.post('/archive/start', function (req, res) {
  var json = req.body;
  var sessionId = json.sessionId;
  console.log('voy a arrancar la grabacion '+sessionId);
  opentok.startArchive(sessionId, { name: sessionId }, function (err, archive) {
    if (err) {
      console.error('error en startArchive');
      console.error(err);
      res.status(500).send({ success: false, error: 'startArchive error:' + err });
      return;
    }
    res.setHeader('Content-Type', 'application/json');
    res.send({
      success: true,
      archivo: archive.id
    });
  });
});

/**
 * PARA LA GRABACION
 */
router.get('/stop/:archiveId', function (req, res) {
  var archiveId = req.params.archiveId;
  console.log('paro archivo archive: ' + archiveId);
  opentok.stopArchive(archiveId, function (err, archive) {
    if (err) {
      console.error('error en stopArchive');
      console.error(err);
      res.status(500).send({ success: false, error: 'stopArchive error:' + err });
      return;
    }
    res.setHeader('Content-Type', 'application/json');
    res.send({
      success: true
    });
  });
});

/**
 * RECUPERA EL ARCHIVO PARA VER
 */
router.get('/archive/:archiveId/view', function (req, res) {
  var archiveId = req.params.archiveId;
  console.log('voy a ver archivo: ' + archiveId);
  opentok.getArchive(archiveId, function (err, archive) {
    if (err) {
      console.error('error en getArchive');
      console.error(err);
      res.status(500).send({ error: 'getArchive error:' + err });
      return;
    }

    if (archive.status === 'available') {
      res.redirect(archive.url);
    } else {
      res.render('view', { title: 'Archiving Pending' });
    }
  });
});

/**
 * GET /archive/:archiveId
 */
router.get('/archive/:archiveId', function (req, res) {
  var archiveId = req.params.archiveId;

  console.log('voy a bajar archivo: ' + archiveId);
  opentok.getArchive(archiveId, function (err, archive) {
    if (err) {
      console.error('error eb getArchive');
      console.error(err);
      res.status(500).send({ error: 'getArchive error:' + err });
      return;
    }

    res.setHeader('Content-Type', 'application/json');
    res.send(archive);
  });
});

/**
 * RECUPERA TODOS LAS GRABACIONES
 */
router.get('/archive', function (req, res) {
  var options = {};
  if (req.query.count) {
    options.count = req.query.count;
  }
  if (req.query.offset) {
    options.offset = req.query.offset;
  }

  console.log('voy a listar archivos');
  opentok.listArchives(options, function (err, archives) {
    if (err) {
      console.error('error en listArchives'); 
      console.error(err);
      res.status(500).send({ error: 'infoArchive error:' + err });
      return;
    }

    res.setHeader('Content-Type', 'application/json');
    res.send(archives);
  });
});
//ruta antigua para subir notas
router.post('/oldnotes', async function (req, res) {
  try {
    if (!req.files) {
      res.send({
        status: false,
        message: 'No file uploaded'
      });
    } else {
      let data = [];

      _.forEach(_.keysIn(req.files.photos), (key) => {
        let photo = req.files.photos[key];

        photo.mv('./uploads/' + photo.name);

        data.push({
          name: photo.name,
          mimetype: photo.mimetype,
          size: photo.size
        });
      });

      res.send({
        status: true,
        message: 'Files are uploaded',
        data: data
      });
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

//ruta que guarda en la base de datos un documento creado especificamente para una sala
router.post('/notes', async function (req, res) {
  try {
    const pizarra = new pizarra(req.body);
    pizarra.save((err, pizarra) => {
      if (err) {
        console.log(err);
        const error = new Error(err);
        error.status = 500;
        return;
      }
      console.log(pizarra);
      let vuelta = pizareq.body;
      vuelta.success = true;
      res.send(vuelta);
    });
  } catch (err) {
    res.status(500).send(err);
  }
});
module.exports = router;
