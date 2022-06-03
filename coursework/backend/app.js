const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');
const utils = require('../../utils.js');
const Automerge = require('automerge');

let app = express();
const options = {
    inflate: true,
    limit: '100kb',
    type: 'application/octet-stream'
};
app.use(bodyParser.raw(options));

try {
    fs.mkdirSync(path.join(__dirname, 'data'));
} catch (err) {
    if (err.code !== 'EEXIST') {
        console.error(err);
    }
}

app.use(cors());

/*
app.get('/:id', (req, res) => {
    let id = req.params.id;
    let filename = path.join(__dirname, 'data', id);
    fs.stat(filename, (err, stats) => {
        if (err) {
            console.error(err);
            res.status(404).send('Not found');
        } else {
            res.sendFile(filename);
            console.log('sending');
        }
    });
});

app.post('/:id', (req, res) => {
    let id = req.params.id;
    fs.writeFileSync(path.join(__dirname, 'data', id), req.body);
    res.status(200).send('ok');
});
 */

const port = 5000;
const server = app.listen(port, () => {
    console.log('listening on http://localhost:' + port);
});

const rooms = [];

const activeSockets = [];

const io = require('socket.io')(server, {transports: ["websocket"]});

io.on('connection', (socket) => {
    console.log('New client connected');
    let currentRoom = null;
    const currentSocketEntry = {socket: socket, syncState: Automerge.initSyncState()};
    activeSockets.push(currentSocketEntry);

    socket.on('join', (id, responseCallback) => {
        console.log("User is trying to join a room " + id);
        let newRoom = rooms.find(c => c.id === id);
        if (!newRoom) {
            console.log("Creating room by id " + id);
            newRoom = {id: id, sockets: [], data: Automerge.init()};
            rooms.push(newRoom);
        }

        currentRoom = newRoom;
        console.log("User got connected to " + currentRoom.id);
        currentRoom.sockets.push(socket);
        responseCallback(Automerge.save(currentRoom.data));
    });

    socket.on('update-data', (data) => {
        console.log("Received new data");
        if (currentRoom) {
            const [nextDoc, nextSyncState, patch] = Automerge.receiveSyncMessage(currentRoom.data, currentSocketEntry.syncState, new Uint8Array(data));
            //currentRoom.data = Automerge.merge(currentRoom.data, Automerge.load(data));
            currentRoom.data = nextDoc;
            currentSocketEntry.syncState = nextSyncState;
            for (const s of currentRoom.sockets) {
                if (s !== socket || true) {
                    console.log("Sent new message to another socket in room " + currentRoom.id);
                    const anotherSocketEntry = activeSockets.find(so => so.socket === s);
                    const [nextSyncState, syncMessage] = Automerge.generateSyncMessage(currentRoom.data, anotherSocketEntry.syncState);
                    anotherSocketEntry.syncState = nextSyncState;
                    if (syncMessage) {
                        s.emit('update-data', syncMessage);
                    }
                }
            }
        }
    });

    socket.on('disconnect', () => {
        if (currentRoom) {
            utils.removeObjectFromArray(socket, currentRoom.sockets);
            utils.removeObjectFromArray(currentSocketEntry, activeSockets);
        }
        currentRoom = null;
        console.log('User got disconnected');
    });
});

