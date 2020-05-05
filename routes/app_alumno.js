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
  // Subscribe to a newly created stream
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

  session.on('sessionDisconnected', function sessionDisconnected(event) {
    console.log('You were disconnected from the session.', event.reason);
  });

  // initialize the publisher
  var publisherOptions = {
    insertMode: 'append',
    width: '33%',
    height: '33%',
    resolution:'320x240',
    name:'pepito',
    publishAudio:false,
    style:{nameDisplayMode:'on'}
  };
  var publisher = OT.initPublisher('subscriber', publisherOptions, handleError);
  // Connect to the session
  session.connect(token, function callback(error) {
    if (error) {
      handleError(error);
    } else {
      console.log((session.connection.data));
      // If the connection is successful, publish the publisher to the session
      session.publish(publisher, function(error){
        if(error)
        {
          handleError(error);
        }
        docReady(function() {
          // DOM is loaded and ready for manipulation here
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
// See the config.js file.
if (API_KEY && TOKEN && SESSION_ID) {
  apiKey = API_KEY;
  sessionId = SESSION_ID;
  token = TOKEN;
  initializeSession();
} else if (SAMPLE_SERVER_BASE_URL) {
  // Make an Ajax request to get the OpenTok API key, session ID, and token from the server
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
  // see if DOM is already available
  if (document.readyState === "complete" || document.readyState === "interactive") {
      // call on next available tick
      setTimeout(fn, 1);
  } else {
      document.addEventListener("DOMContentLoaded", fn);
  }
}    
