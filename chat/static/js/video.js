const user_username = JSON.parse(document.getElementById('user_username').textContent);
const roomName = JSON.parse(document.getElementById('room-name').textContent);


var mapPeers = {};

var loc = window.location;
var wsStart = 'ws://';

var chatSocket;

if(loc.protocol == 'https:' ){
    wsStart = 'wss://';
}

var endPoint = wsStart + loc.host + '/home/chatrooms/' + roomName + '/'

console.log('endPoint: ', endPoint)

chatSocket = new WebSocket(endPoint);

function chatSocketOnMessage(event){
    var parsedData = JSON.parse(event.data);
    var username = parsedData['username'];
    var action = parsedData['action'];

    if(username == user_username){
        return;
    }

    var receiver_channel_name = parsedData['message']['receiver_channel_name'];

    if(action == 'new-peer'){
        createOfferer(username, receiver_channel_name);
        return;
    }

    if(action == 'new-offer'){
        var offer = parsedData['message']['sdp'];
        createAnswerer(offer, username, receiver_channel_name);
    }

    if(action == 'new-answer'){
        var answer = parsedData['message']['sdp'];

        var peer = mapPeers[username][0];

        peer.setRemoteDescription(answer);

        return;
    }
}

chatSocket.addEventListener('open', (e)=> {
    console.log('Connection Established');
    sendSignal('new-peer', {});
});

chatSocket.addEventListener('error', function(event){
    console.log('Websocket Error: ', event);
});

chatSocket.addEventListener('close', (e) =>{
    console.log('Connection Closed');
});

chatSocket.addEventListener('message', chatSocketOnMessage);

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


function createOfferer(username, receiver_channel_name){
    var peer = new RTCPeerConnection(null);

    addLocalTracks(peer);

    var dc = peer.createDataChannel('channel');
    dc.addEventListener('open', () =>{
        console.log('Connection Opened');
    });


    var remoteVideo = createVideo(username);
    setOnTrack(peer, remoteVideo);

    mapPeers[username] = [peer, dc];

    peer.addEventListener('iceconnectionstatechange', () =>{
        var iceConnectionState = peer.iceConnectionState;

        if(iceConnectionState === 'failed' || iceConnectionState === 'disconnected' || iceConnectionState === 'closed'){
            delete mapPeers[username];
            if(iceConnectionState != 'closed'){
                peer.close();
            }

            removeVideo(remoteVideo);
        }
    });

    peer.addEventListener('icecandidate', (event) =>{
        if(event.candidate){
            console.log('New ice candidate', JSON.stringify(peer.localDescription));
            return;
        }

        sendSignal('new-offer', {
            'sdp' : peer.localDescription,
            'reciever_channel_name' : receiver_channel_name
        })
    });

    peer.createOffer()
        .then(o => peer.setLocalDescription(o))
        .then(() => {
            console.log('Local Description Set Successfully');
        }) 
}

function createAnswerer(offer, username, receiver_channel_name){
    var peer = new RTCPeerConnection(null);

    addLocalTracks(peer);

    var remoteVideo = createVideo(username);
    setOnTrack(peer, remoteVideo);

    peer.addEventListener('datachannel', e =>{
        peer.dc = e.channel;
        dc.addEventListener('open', () =>{
            console.log('Connection Opened');
        });
        mapPeers[username] = [peer, peer.dc];
    });

    peer.addEventListener('iceconnectionstatechange', () =>{
        var iceConnectionState = peer.iceConnectionState;

        if(iceConnectionState === 'failed' || iceConnectionState === 'disconnected' || iceConnectionState === 'closed'){
            delete mapPeers[username];
            if(iceConnectionState != 'closed'){
                peer.close();
            }

            removeVideo(remoteVideo);
        }
    });

    peer.addEventListener('icecandidate', (event) =>{
        if(event.candidate){
            console.log('New ice candidate', JSON.stringify(peer.localDescription));
            return;
        }

        sendSignal('new-answer', {
            'sdp' : peer.localDescription,
            'reciever_channel_name' : receiver_channel_name
        })
    });

    peer.setRemoteDescription(offer)
        .then( () => 
        {
            console.log('Remote Description Successfully Created For %s.', username);

            return peer.createAnswer();

        })
        .then(a =>
        {
            console.log('Answer Created!');

            peer.setLocalDescription(a);
        })

}

function addLocalTracks(peer){
    localStream.getTracks().forEach(track =>{
        peer.addTrack(track, localStream);
    })
    return; 
}

function createVideo(username){
        var videoContainer = document.querySelector('#video-container');
        var remoteVideo = document.createElement('video');

        remoteVideo.id = username + '-video';
        remoteVideo.autoplay = true;
        remoteVideo.playsInline = true;

        var videoWrapper = document.createElement('div');
        
        videoContainer.appendChild(videoWrapper);
        videoWrapper.appendChild(remoteVideo);

        return remoteVideo;
}

function setOnTrack(peer, remoteVideo){
    var remoteStream = new MediaStream();

    remoteVideo.srcObject = remoteStream;

    peer.addEventListener('track', async (event) =>
    {
        remoteStream.addTrack(event.track, remoteStream);
    });
}

function removeVideo(video){
    var videoWrapper = video.parentNode;

    videoWrapper.parentNode.removeChild(videoWrapper);
}


function sendSignal(action, message){
    var jsonStr = JSON.stringify({
        'username' : user_username,
        'action' : action,
        'message' : message
    })

    chatSocket.send(jsonStr);
}

var btnSendMsg = document.querySelector('#submit');
var chatBox = document.querySelector('#chat-text');
var messageInput = document.querySelector('#input');

btnSendMsg.addEventListener('click', sendMsgOnClick);


function sendMsgOnClick(){
    var message = messageInput.value;
    let currentDate = new Date();
    let hours = currentDate.getHours();
    hours = (hours % 12) || 12;
    let time = hours + ":" + currentDate.getMinutes();
    message = (user_username + ': ' + message + '\n');
    chatBox.value += message;

    var dataChannels = getDataChannels();

    for(index in dataChannels){
        dataChannels[index].send(message);
    }

    messageInput.value = '';
}

function getDataChannels(){
    var dataChannels = [];

    for(users in mapPeers){
        var datachannel = mapPeers[users][1];
        dataChannels.push(datachannel);
    }

    return dataChannels;
}
