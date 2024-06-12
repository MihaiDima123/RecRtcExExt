let recorder = null;
let stream = null;

const options = {
    type: 'video',
    timeSlice: 1000, // Send data in chunks of 1 second
    mimeType: 'video/webm;codecs=vp9',
    ondataavailable: function(blob) {
        console.log("On Data")
        uploadChunk(blob);
    }
}

document.getElementById('start').addEventListener('click', startRecording)
document.getElementById('stop').addEventListener('click', stopRecording)

function startRecording() {
    chrome.tabCapture.capture({
        video: true,
        audio: true,
    }, 
    async function(mediaStream) {
        stream = mediaStream

        recorder = RecordRTC(stream, options);

        recorder.startRecording();
    });
}

function stopRecording() {
    if (recorder == null) {
        console.error("Recorder not")
        return;
    }

    recorder.stopRecording(function() {
        let blob = recorder.getBlob();
        invokeSaveAsDialog(blob);

        stream.getTracks().forEach(track => track.stop());
    });
}

async function uploadChunk(blob) {
    let formData = new FormData();
    formData.append('chunk', blob, 'chunk.webm');

    try {
        await fetch('http://localhost:8080/onchunk', {
            method: 'POST',
            body: formData
        });
    } catch (error) {
        console.error('Failed to upload chunk:', error);
    }
}