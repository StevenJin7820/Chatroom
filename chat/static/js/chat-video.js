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

var userMedia = navigator.mediaDevices.getUserMedia(constraints)
    .then(stream => {
        localStream = stream;
        localVideo.srcObject = localStream;
        localVideo.muted = true;
    })
    .catch(error => {
        console.log('Error accessing media devices', error);
    })


document.querySelector('#video-on').onclick = function (e) {
    var videoContainer = document.querySelector('#video-container');
    var remoteVideo = document.createElement('video');
    var videoWrapper = document.createElement('div');
    
    remoteVideo.id = user_username + '-video';
    remoteVideo.autoplay = true;
    remoteVideo.playsInline = true;
    videoContainer.appendChild(videoWrapper);
    videoWrapper.appendChild(remoteVideo);
}
