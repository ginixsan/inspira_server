var arrayConexiones=[];

function handleError(error) {
  if (error) {
    console.error(error);
  }
}
function buscaEnArray(busco,array)
{
  var resultado =  array.filter(function(element) {
    return element.alumno == busco;
  });
  if(resultado)
  {
    return resultado[0].conexion;
  } 
  else  return null;
}
function remueveEnArray(busco,array)
{
  var resultado =  array.filter(function(element) {
    return element.alumno != busco;
  });
  if(resultado) return resultado;
  return array;
}
function anyadeAlumno(alumnos,video,nombre){
    var contenedorAlumno=document.createElement('div');
    contenedorAlumno.id=nombre; 
    contenedorAlumno.class="alumno-video";
    contenedorAlumno.appendChild(video);
    //document.getElementById('videosAlumnos').appendChild(contenedorAlumno);
    $('div.alumnosframe').append(contenedorAlumno);
    if (alumnos == 1) {
      $('div.alumnosverticalalign.visible').css('margin-top', '9%');
      $('div.profesor-video-miniframe').css('width', '48%');
      $('div.profesor-video-miniframe').css('height', '47%');
      $('div.alumnosframe').append(contenedorAlumno);
      $('div.alumno-video').css('width', '48%');
      $('div.alumno-video').css('height', '47%');
      }


    if (alumnos == 2) {
        $('div.alumnosverticalalign.visible').css('margin-top', '8%');
        $('div.profesor-video-miniframe').css('width', '32%');
        $('div.profesor-video-miniframe').css('height', '31%');
        $('div.alumno-video').css('width', '32%');
        $('div.alumnosframe').append(contenedorAlumno);
        $('div.alumno-video').css('height', '31%');
    }             

    if (alumnos >= 3 && alumnos <= 6) {
        $('div.alumnosverticalalign.visible').css('margin-top', '6%');
        $('div.profesor-video-miniframe').css('width', '32%');
        $('div.profesor-video-miniframe').css('height', '31%');
        $('div.alumnosframe').append(contenedorAlumno);
        $('div.alumno-video').css('width', '32%');
        $('div.alumno-video').css('height', '31%');
    }


    if (alumnos >= 6 && alumnos <= 14) {
        $('div.alumnosverticalalign.visible').css('margin-top', '3%');
        $('div.profesor-video-miniframe').css('width', '23%');
        $('div.profesor-video-miniframe').css('height', '22%');
        $('div.alumnosframe').append(contenedorAlumno);
        $('div.alumno-video').css('width', '23%');
        $('div.alumno-video').css('height', '22%');
    }
    if (alumnos >= 15 && alumnos <= 23) {
        $('div.alumnosverticalalign.visible').css('margin-top', '2%');
        $('div.profesor-video-miniframe').css('width', '18%');
        $('div.profesor-video-miniframe').css('height', '17%');
        $('div.alumnosframe').append(contenedorAlumno);
        $('div.alumno-video').css('width', '18%');
        $('div.alumno-video').css('height', '17%');

    }
    if (alumnos >= 24 && alumnos <= 34) {
        $('div.alumnosverticalalign.visible').css('margin-top', '1%');
        $('div.profesor-video-miniframe').css('width', '14%');
        $('div.profesor-video-miniframe').css('height', '13%');
        $('div.alumnosframe').append(contenedorAlumno);
        $('div.alumno-video').css('width', '14%');
        $('div.alumno-video').css('height', '13%');

    }

    if (alumnos >= 35 && alumnos <= 55) {
        $('div.alumnosverticalalign.visible').css('margin-top', '0%');
        $('div.profesor-video-miniframe').css('width', '12%');
        $('div.profesor-video-miniframe').css('height', '11%');
        $('div.alumnosframe').append(contenedorAlumno);
        $('div.alumno-video').css('width', '12%');
        $('div.alumno-video').css('height', '11%');

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
    console.log('streamCreated');
    console.log(event);
    
    arrayConexiones.push({
      alumno:event.stream.connection.connectionId,
      conexion:event.stream.connection
    });
    var subscriber=session.subscribe(event.stream,subscriberOptions, handleError);
    subscriber.on('videoElementCreated', function(event) {
      let numeroAlumnos=document.getElementById('numeroAlumnos').innerHTML;
      numeroAlumnos=parseInt(numeroAlumnos);
      numeroAlumnos++;
      console.log('video element created');
      console.log(event);
      //event.element.id=event.element.srcObject.id;
      event.element.poster="../img/coco.jpeg";
      let video=event.element;
      anyadeAlumno(arrayConexiones.length,video,arrayConexiones[arrayConexiones.length-1].alumno);
      
      document.getElementById('numeroAlumnos').innerHTML=numeroAlumnos;
      document.getElementById('numeroAlumnosVideos').innerHTML=numeroAlumnos;
      
     // $('div.alumnosframe').append('<div class="alumno-video"><br><br><br><br></div>');

      //document.getElementById('subscriber-video-parent-id').appendChild(event.element);
    });
  });
  session.on('streamDestroyed',function streamDestroyed(event){
    console.log(event);
    console.log(event.stream.connection.id);
    let aborrar=document.getElementById(event.stream.connection.id);
    aborrar.remove();
    arrayConexiones=remueveEnArray(event.stream.connection.id,arrayConexiones);
    let numeroAlumnos=document.getElementById('numeroAlumnos').innerHTML;
      numeroAlumnos=parseInt(numeroAlumnos);
      numeroAlumnos--;
      if(numeroAlumnos<0) numeroAlumnos=0;
      document.getElementById('numeroAlumnos').innerHTML=numeroAlumnos;
      document.getElementById('numeroAlumnosVideos').innerHTML=numeroAlumnos;
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
    console.log("Se ha enviado una señal desde " + event.from);
    console.log(event.data);
    if(event.data.type==="manoLevantada"){
      console.log('paso por mano levantada');
      console.log(event);
      var levantado=document.getElementById(event.data.id);
      levantado.className='alumno-video handup';
      levantado.addEventListener('click',function(e,conexion){
        switch (levantado.className) {
          //alumno-video
          case 'alumno-video handup':
            levantado.className='alumno-video talking';
            let envioConexion=buscaEnArray(event.data.id,arrayConexiones);
            session.signal(
              {
                to: envioConexion,
                data:{
                  id:'profe',
                  type:"unmute",
                }
              },
              function(error) {
                if (error) {
                  console.log("signal error ("+ error.name+ "): " + error.message);
                } else {
                  console.log("signal sent.");
                }
              }
            );
            break;
          case 'alumno-video talking':
              levantado.className='alumno-video';
              session.signal(
                {
                  to: envioConexion,
                  data:{
                    id:'profe',
                    type:"mute",
                  }
                },
                function(error) {
                  if (error) {
                    console.log("signal error ("+ error.name+ "): " + error.message);
                  } else {
                    console.log("signal sent.");
                    levantado.removeEventListener('click',function(e){
                      console.log('ya ni habla ni nada quito listener');
                    })
                  }
                }
              );
              break;
          default:
            break;
        }
        

      });

    }
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
    var video=event.element;
    video.id="videoprofesor";
    video.poster="../img/coco.jpeg";
    var video2=video.cloneNode(true);
    document.getElementById('videoprofe').appendChild(video);
    document.getElementById('videoProfeAlumnos').appendChild(video2);

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
function lockRoom(lock)
{
  console.log('voy a cerrar/abrir sala');
  if(lock===0)
  {
    fetch("/close",{
      method: "post",
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({
          "token": token
      })
      }).then(function fetch(res) {
                    return res.json();
        }).then(function fetchJson(json) {
            console.log(json);
                    if(json.available==true&&json.exists==true){
                        console.log('sala abierta '+json.closed);
                    }
                    else
                    {
                        if(json.available==false)
                        {
                            alert('la sala aun no esta abierta');
                        }
                        if(json.exists==false)
                        {
                            alert('la sala no existe');
                        }
                    }
        }).catch(function catchErr(error) {
        //handleError(error);
        console.log(error);
        });
}
  else
  {
    fetch("/close",{
      method: "post",
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({
          "token": token
      })
      }).then(function fetch(res) {
                    return res.json();
        }).then(function fetchJson(json) {
            console.log(json);
                    if(json.available==true&&json.exists==true){
                        console.log('sala abierta '+json.closed);
                    }
                    else
                    {
                        if(json.available==false)
                        {
                            alert('la sala aun no esta abierta');
                        }
                        if(json.exists==false)
                        {
                            alert('la sala no existe');
                        }
                    }
        }).catch(function catchErr(error) {
        //handleError(error);
        console.log(error);
        });
  }
}