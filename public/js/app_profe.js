var Publisher2;
var arrayConexiones=[];
var session;
let envioConexion;
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
    video.id="videalumnitos";
    //document.getElementById('videosAlumnos').appendChild(contenedorAlumno);
    if (alumnos == 1) {
      $('div.alumnosverticalalign.visible').css('margin-top', '9%');
      $('div.profesor-video-miniframe').css('width', '48%');
      $('div.profesor-video-miniframe').css('height', '47%');
      $('#videosAlumnos').append(contenedorAlumno);
      $('#'+nombre).addClass("alumno-video");
      $('div.alumno-video').css('width', '48%');
      $('div.alumno-video').css('height', '47%'); 
      }


    if (alumnos == 2) {
        $('div.alumnosverticalalign.visible').css('margin-top', '8%');
        $('div.profesor-video-miniframe').css('width', '32%');
        $('div.profesor-video-miniframe').css('height', '31%');
        $('div.alumno-video').css('width', '32%');
        $('#videosAlumnos').append(contenedorAlumno);
        $('#'+nombre).addClass("alumno-video");
        $('div.alumno-video').css('height', '31%');
    }             

    if (alumnos >= 3 && alumnos <= 6) {
        $('div.alumnosverticalalign.visible').css('margin-top', '6%');
        $('div.profesor-video-miniframe').css('width', '32%');
        $('div.profesor-video-miniframe').css('height', '31%');
        $('#videosAlumnos').append(contenedorAlumno);
        $('#'+nombre).addClass("alumno-video");
        $('div.alumno-video').css('width', '32%');
        $('div.alumno-video').css('height', '31%');
    }


    if (alumnos >= 6 && alumnos <= 14) {
        $('div.alumnosverticalalign.visible').css('margin-top', '3%');
        $('div.profesor-video-miniframe').css('width', '23%');
        $('div.profesor-video-miniframe').css('height', '22%');
        $('#videosAlumnos').append(contenedorAlumno);
        $('#'+nombre).addClass("alumno-video");
        $('div.alumno-video').css('width', '23%');
        $('div.alumno-video').css('height', '22%');
    }
    if (alumnos >= 15 && alumnos <= 23) {
        $('div.alumnosverticalalign.visible').css('margin-top', '2%');
        $('div.profesor-video-miniframe').css('width', '18%');
        $('div.profesor-video-miniframe').css('height', '17%');
        $('#videosAlumnos').append(contenedorAlumno);
        $('#'+nombre).addClass("alumno-video");
        $('div.alumno-video').css('width', '18%');
        $('div.alumno-video').css('height', '17%');

    }
    if (alumnos >= 24 && alumnos <= 34) {
        $('div.alumnosverticalalign.visible').css('margin-top', '1%');
        $('div.profesor-video-miniframe').css('width', '14%');
        $('div.profesor-video-miniframe').css('height', '13%');
        $('#videosAlumnos').append(contenedorAlumno);
        $('#'+nombre).addClass("alumno-video");
        $('div.alumno-video').css('width', '14%');
        $('div.alumno-video').css('height', '13%');

    }

    if (alumnos >= 35 && alumnos <= 55) {
        $('div.alumnosverticalalign.visible').css('margin-top', '0%');
        $('div.profesor-video-miniframe').css('width', '12%');
        $('div.profesor-video-miniframe').css('height', '11%');
        $('#videosAlumnos').append(contenedorAlumno);
        $('#'+nombre).addClass("alumno-video");
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
  session = OT.initSession(apiKey, sessionId);

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
          "token":tokenTeacher,
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
        "token":tokenTeacher,
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
    console.log(event);
    switch (event.data.type) {
      case "manoLevantada":
          console.log('paso por mano levantada');
          console.log(event);
          var levantado=document.getElementById(event.data.id);
          levantado.className='alumno-video handup';
          levantado.addEventListener('click',function(){
            switch (levantado.className) {
              //alumno-video
              case 'alumno-video handup':
                levantado.className='alumno-video talking';
                levantado.conexion=event.data.id;
                envioConexion=buscaEnArray(levantado.conexion,arrayConexiones);
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
                  envioConexion=buscaEnArray(levantado.conexion,arrayConexiones);                  levantado.className='alumno-video';
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
    
        
        break;
      case "chatMessage":
        console.log('chat de '+event.data.id);
        break;
      case "enviaPizarra":
        editor.save().then((outputData) => {
          console.log('Article data: ', outputData);
          enviaPizarra(outputData);
        }).catch((error) => {
          console.log('Saving failed: ', error)
        });
        break;
      default:
          break;
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
   // SIN VIDEO PEQUEÑO var videopeque=document.createElement('canvas');
    // SIN VIDEO PEQUEÑO  videopeque.id='videoprofepequenyo';
    /*var video2=video.cloneNode(true);
    video2.id="videoprofepequeño";
    video2.src=video.src;*/
    document.getElementById('videoprofe').appendChild(video);
     // SIN VIDEO PEQUEÑO var v = document.getElementById('videoprofesor');
     // SIN VIDEO PEQUEÑO document.getElementById('videoProfeAlumnos').appendChild(videopeque);
    // SIN VIDEO PEQUEÑO  $('#videoprofepequenyo').addClass("alumno-video");
    
     // SIN VIDEO PEQUEÑO var canvas = document.getElementById('videoprofepequenyo');
    
  
    /* SIN VIDEO PEQUEÑO
    detectWebcam(function(hasWebcam) {
      console.log('Webcam: ' + (hasWebcam ? 'yes' : 'no'));
      if(!hasWebcam)
      {
        var context = canvas.getContext('2d');
        var cw = Math.floor(canvas.clientWidth);
        var ch = Math.floor(canvas.clientHeight);
        canvas.width = cw;
        canvas.height = ch;
        context.drawImage(v,0,0,canvas.width,canvas.height);
        console.log('saco imagen de no hay video');
      }
      else
      {
        var context = canvas.getContext('2d');
        var cw = Math.floor(canvas.clientWidth);
        var ch = Math.floor(canvas.clientHeight);
        canvas.width = cw;
        canvas.height = ch;
        updateBigVideo(v,context,cw,ch);
      }
      });*/
      
   
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
    publisher.publishVideo(true);
  }
}
function lockRoom(lock)
{
  console.log('voy a cerrar/abrir sala '+tokenTeacher);
  if(lock===0)
  {
    fetch("/close",{
      method: "post",
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({
          "token": tokenTeacher
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
          "token": tokenTeacher
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
function enviaPizarra(datos)
{
  console.log('envio los datos de la pizarra');
  datosEnvio={
    type:'pizarra',
    datos:datos
  };
  session.signal(
    {
      data:datosEnvio
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
function graba()
{
  fetch("/archive/start", {
    method: "post",
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        "sessionId": sessionId
    })
}).then(function fetch(res) {
  return res.json();
}).then(function fetchJson(json) {
    console.log(json);
    if (json.success === true) {
       let  grabacion = json.archivo;
        return grabacion;
    }
    else {
        console.log('error ',json);
        return false;
    }
}).catch(function catchErr(error) {
    handleError(error);
    console.log(error);
});
}
function paraGraba(idgrabacion)
{
  fetch("/stop/" + idgrabacion, {
    method: "get",
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
}).then(function fetch(res) {
      return res.json();
}).then(function fetchJson(json) {
  console.log(json);
    if (json.success === true) {
        console.log('grabacion parada');
    }
    else {
        console.log('error ',json)
    }
}).catch(function catchErr(error) {
    handleError(error);
    console.log(error);
});
};


function updateBigVideo(v,c,w,h) {
  console.log('llego');
  detectWebcam(function(hasWebcam) {
    console.log('Webcam: ' + (hasWebcam ? 'yes' : 'no'));
      if(!hasWebcam)
      {
        c.drawImage(v,0,0,w,h);
        console.log('saco imagen de no hay video');
      }
    });
    if(v.paused || v.ended) 
    {
      return false;
    }
    c.drawImage(v,0,0,w,h);
    setTimeout(updateBigVideo,20,v,c,w,h);
};

/*$(document).ready(function()
{
    $(window).bind("beforeunload", function() { 
      fetch("/available", {
        method: "post",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "token":tokenTeacher,
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
        return confirm("Do you really want to close?"); 
    });
});*/
function getMp3Stream(callback) {
  var selector = new FileSelector();
  selector.accept = '*.mp3';
  selector.selectSingleFile(function(mp3File) {
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      context= new AudioContext();
      gainNode = context.createGain();
      gainNode.connect(context.destination);
      gainNode.gain.value = 0; // don't play for self

      var reader = new FileReader();
      reader.onload = (function(e) {
          // Import callback function
          // provides PCM audio data decoded as an audio buffer
          context.decodeAudioData(e.target.result, createSoundSource);
      });
      reader.readAsArrayBuffer(mp3File);

      function createSoundSource(buffer) {
          var soundSource = context.createBufferSource();
          soundSource.buffer = buffer;
          soundSource.start(0, 0 / 1000);
          soundSource.connect(gainNode);
          var destination = context.createMediaStreamDestination();
          soundSource.connect(destination);
          gainNode.gain.value = 0.05; 
          // durtion=second*1000 (milliseconds)
          callback(destination.stream, buffer.duration * 1000);
      }
  }, function() {
      document.querySelector('#btn-get-mixed-stream').disabled = false;
      alert('Please select mp3 file.');
  });
}
function recogeArchivo(){
  var pubOptions = {publishAudio:true, publishVideo:false};
  var audio= document.createElement('div');
  audio.id='pepito';
// Replace replacementElementId with the ID of the DOM element to replace:
   getMp3Stream(function(result,duration)
   {
    Publisher2 = OT.initPublisher('pepito', pubOptions);
    Publisher2.setAudioSource(result);
   });
} 
function detectWebcam(callback) {
  let md = navigator.mediaDevices;
  if (!md || !md.enumerateDevices) return callback(false);
  md.enumerateDevices().then(devices => {
    callback(devices.some(device => 'videoinput' === device.kind));
  })
}

