/*var gainNode;
//var context;

function recogeArchivo(){
   /* getMp3Stream(function(result,duration)
    {
        console.log(result,duration);
        console.log(typeof result);
        var audioPreview = document.createElement('audio');
        audioPreview.controls = true;
        audioPreview.autoplay = true;
        audioPreview.srcObject=result;
        document.body.appendChild(audioPreview);
        var gainController =new  MediaStreamGainController(result);
        // set gain to 20%
        gainController.setGain(.1);
        // set gain to 0, effectively muting it
        //gainControl.setGain(0); 
    });*/
/*getMixedMicrophoneAndMp3();
    
}
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
function getMixedMicrophoneAndMp3() {

    getMp3Stream(function(mp3Stream) {

        /*navigator.mediaDevices.getUserMedia({
            audio: true
        }).then(function(microphoneStream) {
            mixer = new MultiStreamsMixer([microphoneStream, mp3Stream],null,0.01);
            mixer.useGainNode = true;
            var audioPreview = document.createElement('audio');
            audioPreview.id="primero";
            audioPreview.controls = true;
            audioPreview.autoplay = true;
            audioPreview.srcObject = mixer.getMixedStream();
            document.body.appendChild(audioPreview);
            var recorder = RecordRTC(mixer.getMixedStream(), {
                recorderType: StereoAudioRecorder
            });
            
            recorder.startRecording();

            setTimeout(function() {
                recorder.stopRecording(function() {
                    console.log('por fion');
                    var elemento=document.getElementById('primero');
                    elemento.parentNode.removeChild(elemento);
                    var audioPreview2 = document.createElement('audio');
                    audioPreview2.id="segundo";
                    audioPreview2.controls = true;
                    audioPreview2.autoplay = true;        
                    audioPreview2.src = URL.createObjectURL(recorder.getBlob());

                     document.body.appendChild(audioPreview2);
                });
            }, 10000)
        });
    });
}
