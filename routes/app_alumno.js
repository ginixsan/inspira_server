/* global OT API_KEY TOKEN SESSION_ID SAMPLE_SERVER_BASE_URL */

var apiKey;
var sessionId;
var token;
var profeId;
function handleError(error) {
  if (error) {
    console.error(error);
  }
}

function initializeSession() {
  var session = OT.initSession(apiKey, sessionId);
  session.on("connectionCreated", function(event) {
    console.log(event.connection.connectionId);
  });
  session.on('streamCreated', function streamCreated(event) {
    
    console.log('el nombre es '+event.stream.name);
    if(event.stream.name==='Profe')
    {
      console.log(event.stream.connection.connectionId);
      profeId=event.stream.connection.connectionId;
      var subscriberOptions = {
        insertMode: 'append',
        width: '100%',
        height: '100%',
        preferredResolution:{width: 1280, height: 720}
      };
      session.subscribe(event.stream, 'publisher', subscriberOptions, handleError);

    }
    else
    {
      var subscriberOptions = {
        insertMode: 'append',
        width: '33%',
        height: '33%',
        preferredResolution:{width: 320, height: 240}
      };
      session.subscribe(event.stream, 'subscriber', subscriberOptions, handleError);
    }
  });

  session.on('sessionConnected', function sessionDisconnected(event) {
    console.log('Me he conectado a la sesion.', event.reason);
    //LLAMA A REDIS Y DILE QUE TE HAS CONECTADO CON EL TOKEN
    fetch("/available", {
      method: "post",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "token":token,
        "available":true
      })
    })
    .then( (response) => { 
      console.log(response);
      //hagamos algo bonito que cambie el mundo y tratemos errores!!!
    }).catch(function catchErr(error) {
      handleError(error);
      console.log(error);
    });
    
  });
  session.on('sessionDisconnected', function sessionDisconnected(event) {
    console.log('Me he desconectado de la sesion.', event.reason);
    //LLAMA A REDIS Y DILE QUE TE HAS DESCONECTADO
    fetch("/available", {
      method: "post",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "token":token,
        "available":false
      })
    })
    .then( (response) => { 
      console.log(response);
      //hagamos algo bonito que cambie el mundo y tratemos errores!!!
    }).catch(function catchErr(error) {
      handleError(error);
      console.log(error);
    });
  });

  var publisherOptions = {
    insertMode: 'append',
    width: '33%',
    height: '33%',
    resolution:'320x240',
    name:'alumno',
    publishAudio:false,
    style:{nameDisplayMode:'on'}
  };
  var publisher = OT.initPublisher('subscriber', publisherOptions, handleError);
  session.connect(token, function callback(error) {
    if (error) {
      handleError(error);
    } else {
      console.log((session.connection.data));
      session.publish(publisher, function(error){
        if(error)
        {
          handleError(error);
        }
        docReady(function() {
          let botonLevantaMano=document.getElementById('botonLevanta');
        
                botonLevantaMano.onclick=function(){
                  console.log('MANO LEVANTADA');
                  console.log(profeId);
                  session.signal(
                    {
                      //to: profeId,
                      data:"manoLevantada"
                    },
                    function(error) {
                      if (error) {
                        console.log("signal error ("+ error.name+ "): " + error.message);
                      } else {
                        console.log("signal sent.");
                      }
                    }
                  );
                  
                };
        });
       });
    }
  });
}
API_KEY=apiKey;
SESSION_ID=sessionId;
TOKEN=token;
if (API_KEY && TOKEN && SESSION_ID) {
  apiKey = API_KEY;
  sessionId = SESSION_ID;
  token = TOKEN;
  initializeSession();
} else if (SAMPLE_SERVER_BASE_URL) {
  fetch(SAMPLE_SERVER_BASE_URL + '/room/ginix').then(function fetch(res) {
    return res.json();
  }).then(function fetchJson(json) {
    apiKey = json.apiKey;
    sessionId = json.sessionId;
    token = json.token;
    console.log(token);

    initializeSession();
  }).catch(function catchErr(error) {
    handleError(error);
    alert('Failed to get opentok sessionId and token. Make sure you have updated the config.js file.');
  });
}
function docReady(fn) {
  if (document.readyState === "complete" || document.readyState === "interactive") {
      setTimeout(fn, 1);
  } else {
      document.addEventListener("DOMContentLoaded", fn);
  }
}    
