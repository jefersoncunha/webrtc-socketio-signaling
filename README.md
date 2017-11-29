# WebRTC with Socket.io over Node.js

### Install on Linux/Ubuntu/CentOS/Debian/Mac etc.

1. Download and extract **ZIP file** of this repository then copy `folder-location` of the`server.js` file
2. Open **Node.js command prompt** window
3. Type command `cd folder-location` where `folder-location` can be `C:\socketio-over-nodejs`
4. Type `npm install express` or [download ZIP](http://code.snyco.net/node_modules/express.zip)
5. Type `npm install socket.io` or [download ZIP](http://code.snyco.net/node_modules/socket.io.zip)
6. Type `node server` to run the node.js server

Then open `http://localhost:8888/`.

# How to use?

In `ui.js` files you can find `openSocket` method; or in all libraries; you can find `openSignalingChannel` method.

```javascript
var SIGNALING_SERVER = 'https://localhost:8888';
connection.openSignalingChannel = function(config) {
   var channel = config.channel || this.channel || 'default-namespace';
   var sender = Math.round(Math.random() * 9999999999) + 9999999999;
   
   io.connect(SIGNALING_SERVER).emit('new-channel', {
      channel: channel,
      sender : sender
   });
   
   var socket = io.connect(SIGNALING_SERVER + channel);
   socket.channel = channel;
   
   socket.on('connect', function () {
      if (config.callback) config.callback(socket);
   });
   
   socket.send = function (message) {
        socket.emit('message', {
            sender: sender,
            data  : message
        });
    };
   
   socket.on('message', config.onmessage);
};
```

`io.connect(URL).emit('new-channel')` starts a new namespace that is used privately or publicly to transmit/exchange appropriate stuff e.g. room-details, participation-requests, SDP, ICE, etc.

# `openSocket`

```javascript
var config = {
    openSocket: function (config) {
        var SIGNALING_SERVER = 'https://localhost:8888';

        config.channel = config.channel || location.href.replace(/\/|:|#|%|\.|\[|\]/g, '');
        var sender = Math.round(Math.random() * 999999999) + 999999999;

        io.connect(SIGNALING_SERVER).emit('new-channel', {
            channel: config.channel,
            sender: sender
        });

        var socket = io.connect(SIGNALING_SERVER + config.channel);
        socket.channel = config.channel;
        socket.on('connect', function () {
            if (config.callback) config.callback(socket);
        });

        socket.send = function (message) {
            socket.emit('message', {
                sender: sender,
                data: message
            });
        };

        socket.on('message', config.onmessage);
    }
};

```

# Presence Detection

You can detect presence of a room like this:

```javascript
var SIGNALING_SERVER = 'https://localhost:8888';
function testChannelPresence(channel) {
    var socket = io.connect(SIGNALING_SERVER);
    socket.on('presence', function (isChannelPresent) {
        console.log('is channel present', isChannelPresent);
        if (!isChannelPresent) startNewSession();
    });
    socket.emit('presence', channel);
}

// test whether default channel already created or not!
testChannelPresence('default-channel');
```

This command runs node.js server via `server.js` file. That file handles socket.io relevant stuff.

# Note

Each experiment is using something like this:

```javascript
var SIGNALING_SERVER = '/';
```

This is the URL of your site. By default it will be equal to `http://localhost:8888/`.

It is strongly recommended to use absolute URL including port number:

```javascript
var SIGNALING_SERVER = 'http://domain.com:8888/';
```

