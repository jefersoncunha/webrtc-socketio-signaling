var isHeroku = !!process.env.DYNO

var fs = require('fs');
var express = require('express');
var _static = require('node-static');

var file = new _static.Server('./static', {
    cache: false
});

let options = {}
let app

console.log('is heroku?', !!process.env.DYNO)

function serverCallback(request, response) {
    request.addListener('end', function () {
        response.setHeader('Access-Control-Allow-Origin', '*');
        response.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        file.serve(request, response);
    })
    .resume();
}

if(process.env.DYNO){
    // ou qualquer variável de ambiente que houver só no heroku (tu pode setar as tuas próprias)
    app = require('http').createServer(serverCallback);
} else {
    // se local
    let options = {
        key: fs.readFileSync('./fake-keys/privatekey.pem'),
        cert: fs.readFileSync('./fake-keys/certificate.pem')
    };
    app = require('https').createServer(options, serverCallback);
}

// console.log(app);


var io = require('socket.io').listen(app, {
    log: true,
    origins: '*:*'
});

io.set("transports", ["xhr-polling"]);
io.set("polling duration", 10);

var channels = {};

io.sockets.on('connection', function (socket) {
    var initiatorChannel = '';
    if (!io.isConnected) io.isConnected = true;
    socket.on('new-channel', function (data) {
        if (!channels[data.channel]) initiatorChannel = data.channel;
        channels[data.channel] = data.channel;
        onNewNamespace(data.channel, data.sender);
    });
    socket.on('presence', function (channel) {
        var isChannelPresent = !! channels[channel];
        socket.emit('presence', isChannelPresent);
    });
    socket.on('disconnect', function (channel) {
        if (initiatorChannel) delete channels[initiatorChannel];

    });
});

function onNewNamespace(channel, sender) {
    io.of('/' + channel).on('connection', function (socket) {
        var username;
        if (io.isConnected) {
            io.isConnected = false;
            socket.emit('connect', true);
        }
        socket.on('message', function (data) {
            if (data.sender == sender) {
                if(!username) username = data.data.sender;
                socket.broadcast.emit('message', data.data);
            }
        });
        socket.on('disconnect', function() {
            if(username) {
                socket.broadcast.emit('user-left', username);
                username = null;
            }
        });
    });
}

// O HEROKU pede pra subir o app em uma porta e por padrão ele coloca uma variável de ambiente chamada PORT
// se ela não existir, sobe o app em localhost:8888 :)

// app.listen(process.env.PORT || 3000, function(){
//   let host = isHeroku ? 'https://webrtc-socketio-signaling.herokuapp.com' : 'https://localhost:3000'
//   console.log(`Online! Acåcess: ${host}`)
// });

var port = process.env.PORT || 3000;
app.listen(port, function () {
  var addr = app.address();
  console.log('   app listening on http://' + addr.address + ':' + addr.port);
});
