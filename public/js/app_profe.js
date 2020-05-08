

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
      preferredResolution:{width: 320, height: 240},
      insertDefaultUI:false
    };
    var subscriber=session.subscribe(event.stream,subscriberOptions, handleError);
    subscriber.on('videoElementCreated', function(event) {
      var video=document.createElement('div');
      video.setAttribute("id", "videoalumno34");
      document.getElementsByClassName('div.alumnosframe').append(video);
      let numeroAlumnos=document.getElementById('numeroAlumnos').innerHTML;
      numeroAlumnos=parseInt(numeroAlumnos);
      numeroAlumnos++;
      document.getElementById('numeroAlumnos').innerHTML=numeroAlumnos;
     // $('div.alumnosframe').append('<div class="alumno-video"><br><br><br><br></div>');

      //document.getElementById('subscriber-video-parent-id').appendChild(event.element);
    });
  });
  session.on('sessionConnected', function sessionDisconnected(event) {
    console.log('Me he conectado a la sesion.');
    console.log(event);
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
    name:'Profe',
    insertDefaultUI: false
  };
   publisher = OT.initPublisher(publisherOptions, handleError);
  
  publisher.on('videoElementCreated', function(event) {
    console.log('video element created');
    console.log(event.element);
    event.element.id="videoprofesor";
    event.element.poster="../img/coco.jpeg";
    document.getElementById('videoprofe').appendChild(event.element);
  });
  publisher.on('streamCreated',function(event){
    console.log('creadoStream');
    console.log(event);
    if(event.stream.hasVideo===false)
    {
      $('button.camera').children().attr("disabled","disabled");
    }
  });

  session.connect(token, function callback(error) {
    if (error) {
      handleError(error);
    } else {
      console.log((session));
      session.publish(publisher, handleError);
    }
  });
}

if (apiKey && sessionId && token) {

  initializeSession();
} 
function muteaAudio(audio)
{
  console.log('voy a mutear/desmutear audio');
  if(audio===0)
  {
    publisher.publishAudio(false);
  }
  else
  {
    publisher.publishAudio(false);
  }
}
function muteVideo(video)
{
  console.log('voy a mutear/desmutear video');
  if(video===0)
  {
    publisher.publishVideo(false);
  }
  else
  {
    publisher.publishVideo(false);
  }
}