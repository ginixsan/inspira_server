var express = require('express');
var router = express.Router();
var path = require('path');
var _ = require('lodash');
var mongoose = require('mongoose');
let roomsModel = require('../models/rooms');
let usersModel=require('../models/user');
let entriesModel=require('../models/entries');
const rooms = mongoose.model('rooms');
const user= mongoose.model('users');
let entry=mongoose.model('entries');
var randomToken = require('random-token');
const redis = require("redis");
const REDIS_URL = process.env.REDIS_URL
const client=redis.createClient({host:REDIS_URL} )
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
  console.error('ESTA EL .env??? ', path.resolve('.env'), 'O LAS HAS PUESTO EN LAS VARIABLES DE ENTORNO???' );
  console.error('');
  console.error('=========================================================================================================');
  process.exit();
}

var OpenTok = require('opentok');
var opentok = new OpenTok(apiKey, secret);

var roomToSessionIdDictionary = {};

router.get('/', function (req, res) {
  //AQUI IRA EL HOME DE HOLACLASS!!!
  res.render('index', { title: 'Entrada',userId:'5eafecf7b440541b0369ee07'});
  //res.redirect('/room')
});

//AQUI EL FORMULARIO PARA CREAR UNA HABITACION!!
router.get('/room',function(req,res){
 res.render('crearclase',{title: 'Clase Espira'});
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
router.post('/room',function (req, res) {
  var roomName = req.body.nombreSala;
  //console.log(req.body);
  console.log(roomName);

  var sessionId;
  var token;
  console.log('creando sala con nombre: ' + roomName);
    opentok.createSession({ mediaMode: 'routed' }, function (err, session) {
      //const room = new rooms(req.body);
      console.log(req.body); 
      user.findOne({email:req.body.email},function(err,user)
      {
        let amount=req.body.amount;
        if(user)
        { 
            
          var tokenSala = randomToken(16);
          var tokenProfe=randomToken(16);
          console.log('el token '+token);
          let objetoModelo={
            ownerId:user._id,
            nombreSala:req.body.nombreSala,
            maxParticipants:req.body.maxParticipants,
            sessionId:session.sessionId,
            unifiedToken:tokenSala,
            teacherToken:tokenProfe,
            payment:{
              tipo:req.body.tipoSala,
              amount:amount
            }
          };
          
          const room = new rooms(objetoModelo);
          room.save((err, room) => {
            if (err) 
            {
              console.log(err);
              const error= new Error(err);
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
                tokenSala:tokenProfe
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
  
  rooms.findOne({unifiedToken:token},function(err,habita){
    if(habita)
    {
      //es alumno
      let objetoModelo={
        salaId:habita._id,
        tokenEntrada:token,
        nombreSala:habita.nombreSala,
        entradaSalida:1
      };
      const entrada = new entry(objetoModelo);
      entrada.save((err, result) => {
        if (err) 
        {
          console.log(err);
          const error= new Error(err);
          error.status = 500;
          return;
        }
        console.log('el session id es '+habita.sessionId);
        const sessionId=habita.sessionId;
        const tokenOpen = opentok.generateToken(sessionId);
        console.log(result);
        // generate token
        res.render('indexalumno',{ apiKey: apiKey,
          sessionId: sessionId,
          token: tokenOpen});
      });
    }
    else
    {
      rooms.findOne({teacherToken:token},function(err,habita){
        if(habita)
        {
          //es profe
          let objetoModelo={
            salaId:habita._id,
            tokenEntrada:token,
            nombreSala:habita.nombreSala,
            entradaSalida:1
          };
          const entrada = new entry(objetoModelo);
          //REGISTRO ENTRADA
          entrada.save((err, result) => {
            if (err) 
            {
              console.log(err);
              const error= new Error(err);
              error.status = 500;
              return;
            }
            console.log('el session id es '+habita.sessionId);
            const sessionId=habita.sessionId;
            const tokenOpen = opentok.generateToken(sessionId);
            res.render('indexprofe',{ apiKey: apiKey,
              sessionId: sessionId,
              token: tokenOpen});
            });
        }
        else
        {
          //esta sala no existe
          res.send({
            exists:false
          })
        }
      });
    }
  });
});

//ABRIR CERRAR UNA SALA ENVIADO EL TOKEN DEL PROFE!!
//DEBERIA PASARSE A POST PARA MAS SEGURIDAD
router.get('/close/:token', function (req, res) {
  console.log(req.params.token);
  var token = req.params.token;
  rooms.findOne({teacherToken:token},function(err,habita){
    if(habita)
    {
      console.log(habita);
      client.get(habita.unifiedToken,function(err,result){
        if(result)
        {
          if(result.abierta===false)
          {
            result.abierta=true;
          }
          else
          {
            result.abierta=false;
          }
          
          client.hmset(habita.unifiedToken, result,function(err,reply) {
            console.log(reply);
            res.send({
              exists:true,
              available:true,
              full:false,
              closed:result.abierta
            });
          });
        }
        else
        {
          //res.redirect('/room/'+token);
          res.send({
            exists:true,
            available:false
          });
        }
      })
    }
    else
    {
      res.send({
        exists:false
      });
    }
  });
  
  
});



//get el form de acceso
router.get('/acceso/:token',function(req,res){
  console.log('acceso a la sala '+req.params.token);
  var token = req.params.token;
  rooms.findOne({unifiedToken:token},function(err,habita){
    if(habita)
    {
      console.log('existe la habita')
      console.log(habita);
      res.render('acceso',{ nombreSala:habita.nombreSala,tipoPago:habita.payment.tipo,amount:habita.payment.amount,token:token});
    }
    else
    {
      res.send({
        exists:false
      });
    }
  });
});


//COMPRUEBA SI UNA SALA ESTA DISPONIBLE PARA ENTRAR
// ABIERTA? DISPONIBLE? HAY HUECOS?
router.get('/available/:token', function (req, res) {
  console.log(req.params.token);
  var token = req.params.token;
  rooms.findOne({unifiedToken:token},function(err,habita){
    if(habita)
    {
      console.log(habita);
      client.get(habita.unifiedToken,function(err,result){
        if(result)
        {
          if(result.abierta===true&&result.participantes>0)
          {
            console.log(result);
            //meter datos de usuario en BASE DE DATOS ANALYTICS

            res.redirect('/room/'+token);
          }
          else
          {
            let llena=false;
            if(result.participantes<=0)
            {
              llena=true;
            }
            //res.redirect('/room/'+token);
            res.send({
              exists:true,
              available:true,
              closed:result.abierta,
              full:llena
            });
          }
        }
        else{
          res.send({
            exists:true,
            available:false
          });
        }
        
      })
    }
    else
    {
      res.send({
        exists:false
      });
    }
  });
  
  
});



//MODIFICA UNA SALA SUMANDO O RESTANDO UN PARTICIPANTE
//O EN CASO DE SER EL PROFE CREA O CIERRA LA SALA AL SALIR

router.post('/available/', function (req, res) {
  var token = req.body.token;
  var available=req.body.available;
  rooms.findOne({unifiedToken:token},function(err,habita){
    if(habita)
    {
      //es alumno
      client.get(habita.unifiedToken,function(err,result){
        if(result)
        {
          console.log(result);
          //la sala esta arrancada
          if(result.participantes<=0)
          {
            //pero llena
            res.send({
              exists:true, 
              available:true,
              full:true
            });
          }
          else
          {
            if(result.abierta==false)
            {
              res.send({
                exists:true, 
                available:true,
                full:false,
                closed:true
              });
            }
            else{
              let participantes=available?result-1:result+1;
              client.hmset(habita.unifiedToken, {
                  'participantes': participantes,
                  'abierta': true
                  },function(err,reply) {
                  console.log(reply);
                  res.send({
                    exists:true,
                    available:true,
                    full:false,
                    closed:false
                  });
                });
            }
          }
        }
      })
    }
    else
    {
      rooms.findOne({teacherToken:token},function(err,habita){
        if(habita)
        {
          if(available===true)
          {
            //es profe y entra
            let participantes=habita.maxParticipants-1;
            client.hmset(habita.unifiedToken, {
              'participantes': participantes,
              'abierta': true
              },function(err,reply) {
              console.log(reply);
              res.send({
                exists:true,
                available:true,
                full:false,
                closed:false
              });
            });
          }
          else
          {
            //SALE DE LA SALA PORQUE BORRAMOS DE LA CACHE LA SALA
            client.del(habita.unifiedToken, function(err, reply) {
              console.log(reply);
              res.send({
                exists:true,
                available:false,
                full:false
              });
          });
          }
          
        }
        else
        {
          res.send({
            exists:false
          });
        }
      });
    }
  });
});
/**
 * POST /archive/start
 * GRABA LA SALA
 */
router.post('/archive/start', function (req, res) {
  var json = req.body;
  var sessionId = json.sessionId;
  opentok.startArchive(sessionId, { name: findRoomFromSessionId(sessionId) }, function (err, archive) {
    if (err) {
      console.error('error in startArchive');
      console.error(err);
      res.status(500).send({ error: 'startArchive error:' + err });
      return;
    }
    res.setHeader('Content-Type', 'application/json');
    res.send(archive);
  });
});

/**
 * POST /archive/:archiveId/stop
 * PARA LA GRABACION
 */
router.post('/archive/:archiveId/stop', function (req, res) {
  var archiveId = req.params.archiveId;
  console.log('attempting to stop archive: ' + archiveId);
  opentok.stopArchive(archiveId, function (err, archive) {
    if (err) {
      console.error('error in stopArchive');
      console.error(err);
      res.status(500).send({ error: 'stopArchive error:' + err });
      return;
    }
    res.setHeader('Content-Type', 'application/json');
    res.send(archive);
  });
});

/**
 * GET /archive/:archiveId/view
 * RECUPERA EL ARCHIVO PARA VER
 */
router.get('/archive/:archiveId/view', function (req, res) {
  var archiveId = req.params.archiveId;
  console.log('attempting to view archive: ' + archiveId);
  opentok.getArchive(archiveId, function (err, archive) {
    if (err) {
      console.error('error in getArchive');
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

  // fetch archive
  console.log('attempting to fetch archive: ' + archiveId);
  opentok.getArchive(archiveId, function (err, archive) {
    if (err) {
      console.error('error in getArchive');
      console.error(err);
      res.status(500).send({ error: 'getArchive error:' + err });
      return;
    }

    // extract as a JSON object
    res.setHeader('Content-Type', 'application/json');
    res.send(archive);
  });
});

/**
 * GET /archive
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

  // list archives
  console.log('attempting to list archives');
  opentok.listArchives(options, function (err, archives) {
    if (err) {
      console.error('error in listArchives');
      console.error(err);
      res.status(500).send({ error: 'infoArchive error:' + err });
      return;
    }

    // extract as a JSON object
    res.setHeader('Content-Type', 'application/json');
    res.send(archives);
  });
});

router.post('/notes',async function(req,res){
    try {
        if(!req.files) {
            res.send({
                status: false,
                message: 'No file uploaded'
            });
        } else {
            let data = []; 

            //loop all files
            _.forEach(_.keysIn(req.files.photos), (key) => {
                let photo = req.files.photos[key];
                
                //move photo to uploads directory
                photo.mv('./uploads/' + photo.name);

                //push file details
                data.push({
                    name: photo.name,
                    mimetype: photo.mimetype,
                    size: photo.size
                });
            });

            //return response
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

module.exports = router;
