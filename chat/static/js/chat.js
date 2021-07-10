const user_username = JSON.parse(document.getElementById('user_username').textContent);
document.querySelector('#submit').onclick = function (e) {
    const messageInputDom = document.querySelector('#input');
    const message = messageInputDom.value;
    chatSocket.send(JSON.stringify({
        'message': message,
        'username': user_username,
    }));
    messageInputDom.value = '';
};

const roomName = JSON.parse(document.getElementById('room-name').textContent);

const chatSocket = new WebSocket(
    'ws://' +
    window.location.host +
    '/ws/chat/' +
    roomName +
    '/'
);

chatSocket.onmessage = function (e) {
    const data = JSON.parse(e.data);
    console.log(data)
    let currentDate = new Date();
    let hours = currentDate.getHours();
    hours = (hours % 12) || 12;
    let time = hours + ":" + currentDate.getMinutes();
    document.querySelector('#chat-text').value += (data.username + ': ' + data.message + '\n')
}

var localStream = new MediaStream();

const constraints = {
    'video' : true,
    'audio' : true
};

const localVideo = document.querySelector('#video-chat');

const btnToggleAudio = document.querySelector('#mute');

const btnToggleVideo = document.querySelector('#video');

var userMedia = navigator.mediaDevices.getUserMedia(constraints)
    .then(stream => {
        localStream = stream;
        localVideo.srcObject = localStream;
        localVideo.muted = true;

        var audioTracks = stream.getAudioTracks();

        var videoTracks = stream.getVideoTracks();

        audioTracks[0].enabled = true;
        videoTracks[0].enabled = true;

        btnToggleAudio.addEventListener('click', () =>{
            audioTracks[0].enabled = !audioTracks[0].enabled;

            if(audioTracks[0].enabled){
                btnToggleAudio.innerHTML = 'Mute';

                return;
            }

            btnToggleAudio.innerHTML = 'Unmute';
        });

        btnToggleVideo.addEventListener('click', () =>{
           videoTracks[0].enabled = !videoTracks[0].enabled;

            if(videoTracks[0].enabled){
                btnToggleVideo.innerHTML = 'Video Off';

                return;
            }

            btnToggleVideo.innerHTML = 'Video On';
        });
    })
    .catch(error => {
        console.log('Error accessing media devices', error);
    })
