/* global OT API_KEY TOKEN SESSION_ID SAMPLE_SERVER_BASE_URL */

var apiKey;
var sessionId;
var token;
var profeId;
var arrayConexiones=[];
var session;
var publisher;
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
  contenedorAlumno.appendChild(video);
  //document.getElementById('videosAlumnos').appendChild(contenedorAlumno);
  if (alumnos == 1) {
    $('div.alumnosverticalalign.visible').css('margin-top', '9%');
    $('div.profesor-video-miniframe').css('width', '48%');
    $('div.profesor-video-miniframe').css('height', '47%');
    $('div.alumnosframe').append(contenedorAlumno);
    $('#'+nombre).addClass("alumno-video");
    $('div.alumno-video').css('width', '48%');
    $('div.alumno-video').css('height', '47%');
    }


  if (alumnos == 2) {
      $('div.alumnosverticalalign.visible').css('margin-top', '8%');
      $('div.profesor-video-miniframe').css('width', '32%');
      $('div.profesor-video-miniframe').css('height', '31%');
      $('div.alumno-video').css('width', '32%');
      $('div.alumnosframe').append(contenedorAlumno);
      $('#'+nombre).addClass("alumno-video");
      $('div.alumno-video').css('height', '31%');
  }             

  if (alumnos >= 3 && alumnos <= 6) {
      $('div.alumnosverticalalign.visible').css('margin-top', '6%');
      $('div.profesor-video-miniframe').css('width', '32%');
      $('div.profesor-video-miniframe').css('height', '31%');
      $('div.alumnosframe').append(contenedorAlumno);
      $('#'+nombre).addClass("alumno-video");
      $('div.alumno-video').css('width', '32%');
      $('div.alumno-video').css('height', '31%');
  }


  if (alumnos >= 6 && alumnos <= 14) {
      $('div.alumnosverticalalign.visible').css('margin-top', '3%');
      $('div.profesor-video-miniframe').css('width', '23%');
      $('div.profesor-video-miniframe').css('height', '22%');
      $('div.alumnosframe').append(contenedorAlumno);
      $('#'+nombre).addClass("alumno-video");
      $('div.alumno-video').css('width', '23%');
      $('div.alumno-video').css('height', '22%');
  }
  if (alumnos >= 15 && alumnos <= 23) {
      $('div.alumnosverticalalign.visible').css('margin-top', '2%');
      $('div.profesor-video-miniframe').css('width', '18%');
      $('div.profesor-video-miniframe').css('height', '17%');
      $('div.alumnosframe').append(contenedorAlumno);
      $('#'+nombre).addClass("alumno-video");
      $('div.alumno-video').css('width', '18%');
      $('div.alumno-video').css('height', '17%');

  }
  if (alumnos >= 24 && alumnos <= 34) {
      $('div.alumnosverticalalign.visible').css('margin-top', '1%');
      $('div.profesor-video-miniframe').css('width', '14%');
      $('div.profesor-video-miniframe').css('height', '13%');
      $('div.alumnosframe').append(contenedorAlumno);
      $('#'+nombre).addClass("alumno-video");
      $('div.alumno-video').css('width', '14%');
      $('div.alumno-video').css('height', '13%');

  }

  if (alumnos >= 35 && alumnos <= 55) {
      $('div.alumnosverticalalign.visible').css('margin-top', '0%');
      $('div.profesor-video-miniframe').css('width', '12%');
      $('div.profesor-video-miniframe').css('height', '11%');
      $('div.alumnosframe').append(contenedorAlumno);
      $('#'+nombre).addClass("alumno-video");
      $('div.alumno-video').css('width', '12%');
      $('div.alumno-video').css('height', '11%');

  }
}

function initializeSession() {
   session = OT.initSession(apiKey, sessionId);
  session.on("connectionCreated", function(event) {
    console.log(event.connection.connectionId);
  });
  session.on('streamCreated', function streamCreated(event) {
    
    console.log('el nombre es '+event.stream.name);
    if(event.stream.name==='Profe')
    {
      console.log(event.stream.connection.connectionId);
      profeId=event.stream.connection;
      var subscriberOptions = {
        insertMode: 'append',
        width: '100%',
        height: '100%',
        preferredResolution:{width: 1280, height: 720},
        insertDefaultUI: false
      };
      var subscriber=session.subscribe(event.stream,subscriberOptions, handleError);
      subscriber.on('videoElementCreated', function(event) {
        console.log('video element created del profe');
        console.log(event);
        //event.element.id=event.element.srcObject.id;
        event.element.poster="../img/coco.jpeg";
        let video=event.element; 
        video.id="profvideo"       
        document.getElementById('videoprofe').appendChild(video);
        var videopeque=document.createElement('canvas');
        videopeque.id='videoprofepequenyo';
        /*var video2=video.cloneNode(true);
        video2.id="videoprofepequeño";
        video2.src=video.src;*/
        document.getElementById('miniprofe').appendChild(videopeque);
        var v = document.getElementById('profvideo');
        var canvas = document.getElementById('videoprofepequenyo');
        var context = canvas.getContext('2d');
        var cw = Math.floor(canvas.clientWidth);
        var ch = Math.floor(canvas.clientHeight);
        canvas.width = cw;
        canvas.height = ch;
        updateBigVideo(v,context,cw,ch);        
      });

    }
    else
    {
      arrayConexiones.push({
        alumno:event.stream.connection.connectionId,
        conexion:event.stream.connection
      });
      var subscriberOptions = {
        insertMode: 'append',
        width: '33%',
        height: '33%',
        preferredResolution:{width: 320, height: 240},
        insertDefaultUI: false
      };
      var subscriber2=session.subscribe(event.stream,subscriberOptions, handleError);
      subscriber2.on('videoElementCreated', function(event) {
        console.log('video element created del alumno');
        console.log(event);
        //event.element.id=event.element.srcObject.id;
        event.element.poster="../img/coco.jpeg";
        let video=event.element;        
        document.getElementById('videoProfeAlumnos').appendChild(video);  
        let numeroAlumnos=document.getElementById('numeroalumnos').innerHTML;
        numeroAlumnos=parseInt(numeroAlumnos);
        numeroAlumnos++;      
        document.getElementById('numeroalumnos').innerHTML=numeroAlumnos;
        document.getElementById('numeroAlumnos').innerHTML=numeroAlumnos;
        anyadeAlumno(arrayConexiones.length,video,arrayConexiones[arrayConexiones.length-1].alumno);

      });
    }
  });

  session.on('streamDestroyed',function streamDestroyed(event){
    console.log(event);
    console.log(event.stream.connection.id);
    let aborrar=document.getElementById(event.stream.connection.id);
    aborrar.remove();
    arrayConexiones=remueveEnArray(event.stream.connection.id,arrayConexiones);
    let numeroAlumnos=document.getElementById('numeroalumnos').innerHTML;
      numeroAlumnos=parseInt(numeroAlumnos);
      numeroAlumnos--;
      if(numeroAlumnos<0) numeroAlumnos=0;
      document.getElementById('numeroAlumnos').innerHTML=numeroAlumnos;
      document.getElementById('numeroalumnos').innerHTML=numeroAlumnos;
  });

  session.on("signal", function(event) {
    console.log("Se ha enviado una señal desde " + event.from);
    console.log(event.data);
    switch (event.data.type) {
      case 'unmute':
        console.log('unmute');
        publisher.publishAudio=true;
        document.getElementById("videomio").className="alumno-video talking";
        break;
      case 'mute':
        publisher.publishAudio=false;
        console.log('mute');
        document.getElementById("videomio").className="alumno-video";
        break;
      case 'pizarra':
        console.log('actualiza pizarra con '+event.data.datos);
        editor.clear();
        editor.render(event.data.datos);
        break;
      default:
        break;
    }
  });
  session.on('sessionConnected', function sessionDisconnected(event) {
    console.log('Me he conectado a la sesion.', event.target.connection.id);
    //LLAMA A REDIS Y DILE QUE TE HAS CONECTADO CON EL TOKEN
    fetch("/available", {
      method: "post",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "token":studentToken,
        "available":true
      })
    })
    .then(function fetch(res) {
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
            console.log('la sala no esta abierta'+studentToken);
              alert('la sala aun no esta abierta');
              window.location.href='/acceso/'+studentToken;
          }
          if(json.exists==false)
          {
              alert('la sala no existe');
              //window.location.href='/';
          }
      }
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
        "token":studentToken,
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
 var alumno=Math.floor(Math.random() * 100000000000);
  var publisherOptions = {
    insertMode: 'append',
    width: '33%',
    height: '33%',
    resolution:'320x240',
    name:alumno,
    publishAudio:false,
    insertDefaultUI: false
  };
  publisher = OT.initPublisher(publisherOptions, handleError);
  publisher.on('videoElementCreated', function(event) {
    console.log('video element created');
    console.log(event.element);
    var video=event.element;
    video.id="videomio";
    video.poster="../img/coco.jpeg";
    document.getElementById('videoProfeAlumnos').appendChild(video);
    arrayConexiones.push({
      alumno:'yo',
      conexion:'lamia'
    });
    anyadeAlumno(arrayConexiones.length,video,arrayConexiones[arrayConexiones.length-1].alumno);
    
  });
  session.connect(token, function callback(error) {
    if (error) {
      handleError(error);
    } else {
      console.log((session.connection));
      session.publish(publisher, function(error){
        if(error)
        {
          handleError(error);
        }
          let botonLevantaMano=document.getElementById('levantamano');
        
                botonLevantaMano.onclick=function(){
                  console.log('MANO LEVANTADA');
                  console.log(profeId);
                  session.signal(
                    {
                      to: profeId,
                      data:{
                        id:session.connection.connectionId,
                        type:"manoLevantada",
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
                  
                };
       });
    }
  });
}
console.log(apiKey);
console.log(sessionId);
console.log(studentToken);
if (apiKey && sessionId && studentToken) {
  console.log('inicializo');
  initializeSession();
} 
/*function docReady(fn) {
  if (document.readyState === "complete" || document.readyState === "interactive") {
      setTimeout(fn, 1);
  } else {
      document.addEventListener("DOMContentLoaded", fn);
  }
}  */  
function updateBigVideo(v,c,w,h) {
  if(v.paused || v.ended) return false;
  c.drawImage(v,0,0,w,h);
  setTimeout(updateBigVideo,20,v,c,w,h);
};
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