const SERVER_URL = "http://localhost:5000/";
const socket = io(SERVER_URL, {transports: ["websocket"]});

let doc = null;
let syncState = null;
const docId = window.location.hash.replace(/^#/, '');
console.log("doc id = " + docId);
//let actorId = Automerge.getActorId(doc);
//console.log(actorId);

let form = document.querySelector("form");
let input = document.querySelector("#new-todo");
form.onsubmit = (ev) => {
    ev.preventDefault();
    addItem(input.value);
    input.value = null;
};

let offlineMode = false;
document.querySelector("#offline-mode-checkbox").addEventListener("input", e => {
    offlineMode = e.target.checked;
    console.log(offlineMode);
});

function addItem(text) {
    if (doc == null) return;
    let newDoc = Automerge.change(doc, doc => {
        if (!doc.items) doc.items = [];
        doc.items.push({text, done: false});
    });
    updateDoc(newDoc);
}

function updateDoc(newDoc) {
    render(newDoc);
    sendToRemote(docId, doc, newDoc);
    doc = newDoc;
}

function render(doc) {
    let list = document.querySelector("#todo-list");
    list.innerHTML = '';
    doc.items && doc.items.forEach((item, index) => {
        let itemEl = document.createElement('li');
        itemEl.innerText = item.text;
        itemEl.style = item.done ? 'text-decoration: line-through' : '';
        list.appendChild(itemEl);
    });
}

function sendToRemote(docId, oldDoc, newDoc) {
    const [nextSyncState, syncMessage] = Automerge.generateSyncMessage(newDoc, syncState);
    console.log(syncMessage);
    syncState = nextSyncState;
    if (syncMessage) {
        socket.emit('update-data', syncMessage);
    }
}

async function loadFromRemote(docId) {
    socket.emit('join', docId, (response) => {
        console.log(response);
        const byteArray = new Uint8Array(response);
        if (byteArray.length === 0) {
            doc = Automerge.init();
        } else {
            doc = Automerge.load(byteArray);
        }
        syncState = Automerge.initSyncState();
        render(doc);
    });
}

// Some guy said that you need to call frombase64 and tobase64 for it to work... but for me it seems to work regardless
//https://github.com/automerge/automerge/pull/458/commits/dfebf35298f53addfca721f8838863a792d300ac?short_path=3d99e51
socket.on('update-data', (data) => {
    if (doc === null) return;
    const [nextDoc, nextSyncState, patch] = Automerge.receiveSyncMessage(doc, syncState, new Uint8Array(data));
    doc = nextDoc;
    syncState = nextSyncState;
    //doc = Automerge.merge(doc, Automerge.load(new Uint8Array(data)));
    render(doc);

    sendToRemote("lol", "lol", doc);
});

// Call when the app starts up
loadFromRemote(docId);