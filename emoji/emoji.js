'use strict';
const { ipcRenderer, remote } = require('electron');
const emoji = require('emoji.json');

show();

// close button 
document.getElementById('close-btn').addEventListener('click', function (e) {
    let window = remote.getCurrentWindow();
    window.close();
}); 

function show() {
    let contents = document.getElementById('contents');
    while (contents.firstChild) {
        contents.removeChild(contents.firstChild);
    }

    const query = document.getElementById('search-query');
    const regex = new RegExp(query.value)

    emoji
        .filter((el) => (el['codes'].match(/ /) == null)) // exclude surrogate pair
        .filter((el) => el['name'].match(regex) != null)
        .map((el) => {
            let dom = document.createElement('SPAN');
            dom.textContent = twemoji.convert.fromCodePoint(el['codes']);
            dom.title = el['name'];
            contents.appendChild(dom);
        })

    twemoji.parse(contents);
    addEventlisteners();
}

function addEventlisteners() {
    const emojis = Array.from(document.getElementsByClassName('emoji'));
    emojis.map((el) => {
        el.onclick = (event) => {
            event.preventDefault();
            ipcRenderer.sendSync('download', el.src);
            ipcRenderer.send('copy');
            new Notification('Copied to clipboard!', {
                silent: true,
                icon: '/tmp/twemoji/tmp.png'
            });
        };

        el.draggable = true;
        el.ondragstart = (event) => {
            event.preventDefault();
            ipcRenderer.sendSync('download', el.src);
            ipcRenderer.send('ondragstart');
        };
    });
}
