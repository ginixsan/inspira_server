var express = require('express');
var router = express.Router();
var path = require('path');
var _ = require('lodash');
var mongoose = require('mongoose');
var roomsModel = require('../models/rooms');
let usersModel=require('../models/user');
const rooms = mongoose.model('rooms');
const user= mongoose.model('users');
var randomToken = require('random-token');


var apiKey = process.env.TOKBOX_API_KEY;
var secret = process.env.TOKBOX_SECRET;

if (!apiKey || !secret) {
  console.error('=========================================================================================================');
  console.error('');
  console.error('Missing TOKBOX_API_KEY or TOKBOX_SECRET');
  console.error('Find the appropriate values for these by logging into your TokBox Dashboard at: https://tokbox.com/account/#/');
  console.error('Then add them to ', path.resolve('.env'), 'or as environment variables' );
  console.error('');
  console.error('=========================================================================================================');
  process.exit();
}

var OpenTok = require('opentok');
var opentok = new OpenTok(apiKey, secret);

// IMPORTANT: roomToSessionIdDictionary is a variable that associates room names with unique
// unique sesssion IDs. However, since this is stored in memory, restarting your server will
// reset these values if you want to have a room-to-session association in your production
// application you should consider a more persistent storage

var roomToSessionIdDictionary = {};

// returns the room name, given a session ID that was associated with it
function findRoomFromSessionId(sessionId) {
  return _.findKey(roomToSessionIdDictionary, function (value) { return value === sessionId; });
}

router.get('/', function (req, res) {
  res.render('index', { title: 'Entrada',userId:'5eafecf7b440541b0369ee07'});
  //res.redirect('/room')
});

//crea habitacion
router.get('/room',function(req,res){
 res.render('crearclase',{title: 'Clase Espira'});
});
/**
 * GET /session redirects to /room/session
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
router.get('/assets/app_profe.js',function(req,res){
  res.sendFile(path.join(__dirname + '/app_profe.js'));
});
router.get('/stylesheets/app_profe.css',function(req,res){
  res.sendFile(path.join(__dirname + '/app_profe.css'));
});
router.get('/assets/app_alumno.js',function(req,res){
  res.sendFile(path.join(__dirname + '/app_profe.js'));
});
router.get('/stylesheets/app_alumno.css',function(req,res){
  res.sendFile(path.join(__dirname + '/app_profe.css'));
});
/**
 * GET /room/:name
 */
router.get('/room/:token', function (req, res) {
  var token = req.params.token;
  rooms.findOne({unifiedToken:token},function(err,habita){
    if(habita)
    {
      console.log('el session id es '+habita.sessionId);
      const sessionId=habita.sessionId;
      const tokenOpen = opentok.generateToken(sessionId);
      res.render('indexalumno',{ apiKey: apiKey,
        sessionId: sessionId,
        token: tokenOpen});
      //res.sendFile(path.join(__dirname + '/app.js'));
    }
    else
    {
      rooms.findOne({teacherToken:token},function(err,habita){
        if(habita)
        {
          console.log('el session id es '+habita.sessionId);
          const sessionId=habita.sessionId;
          const tokenOpen = opentok.generateToken(sessionId);
          res.render('indexprofe',{ apiKey: apiKey,
            sessionId: sessionId,
            token: tokenOpen});
          //res.sendFile(path.join(__dirname + '/app.js'));
        }
      });
    }
  });
});
/*router.get('/room/:token', function (req, res) {
  var token = req.params.token;
  rooms.findOne({unifiedToken:token},function(err,habita){
    if(habita)
    {
      console.log('el session id es '+habita.sessionId);
      const sessionId=habita.sessionId;
      const tokenOpen = opentok.generateToken(sessionId);
      res.render('indexprofe',{ apiKey: apiKey,
        sessionId: sessionId,
        token: tokenOpen});
      //res.sendFile(path.join(__dirname + '/app.js'));
    }
  });
  
  
});*/
router.get('/available/:token', function (req, res) {
  var token = req.params.token;
  rooms.findOne({unifiedToken:token},function(err,habita){
    if(habita)
    {
      console.log('el session id es '+habita.sessionId);
      const sessionId=habita.sessionId;
      const tokenOpen = opentok.generateToken(sessionId);
      res.render('indexprofe',{ apiKey: apiKey,
        sessionId: sessionId,
        token: tokenOpen});
      //res.sendFile(path.join(__dirname + '/app.js'));
    }
  });
  
  
});
/**
 * POST /archive/start
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

module.exports = router;
