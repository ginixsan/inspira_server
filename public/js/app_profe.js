
var apiKey;
var sessionId;
var token;

function handleError(error) {
  if (error) {
    console.error(error);
  }
}
function CopyToClipboard(containerid) {
  if (document.selection) {
    var range = document.body.createTextRange();
    range.moveToElementText(document.getElementById(containerid));
    range.select().createTextRange();
    document.execCommand("copy");
  } else if (window.getSelection) {
    var range = document.createRange();
    range.selectNode(document.getElementById(containerid));
    window.getSelection().addRange(range);
    document.execCommand("copy");
    alert("El texto se ha copiado")
  }
}
function initializeSession() {
  var session = OT.initSession(apiKey, sessionId);

  session.on('streamCreated', function streamCreated(event) {
    var subscriberOptions = {
      insertMode: 'append',
      width: '33%',
      height: '33%',
      preferredResolution:{width: 320, height: 240}
    };
    session.subscribe(event.stream, 'subscriber', subscriberOptions, handleError);
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
  session.on("signal", function(event) {
    console.log("Se ha enviado una señal desde " + event.from.id);
    console.log(event.data);
  });
  var publisherOptions = {
    insertMode: 'append',
    width: '100%',
    height: '100%',
    resolution:'1280x720',
    name:'Profe'
  };
  var publisher = OT.initPublisher('publisher', publisherOptions, handleError);

  session.connect(token, function callback(error) {
    if (error) {
      handleError(error);
    } else {
      console.log((session));
      session.publish(publisher, handleError);
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
} 