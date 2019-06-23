"use strict";
const { ipcRenderer } = require('electron');
const emoji = require('emoji.json');

// emoji
const parser = new DOMParser();
const stringContainingHTMLSource = emoji.filter((element) => (element["codes"].match(/ /) == null))
    .map((element) => `&#x${element["codes"]};`)
    .reduce((previous, current) => previous + current);

const doc = parser.parseFromString(stringContainingHTMLSource, "text/html");
const contents = document.getElementById("contents");
contents.innerHTML = doc.body.innerText;
twemoji.parse(contents);

// eventlistener
const emojis = Array.from(document.getElementsByClassName("emoji"));
emojis.map((el) => {
    el.onclick = (event) => {
        event.preventDefault();
        ipcRenderer.sendSync('download', el.src);
        ipcRenderer.send("copy");
        new Notification("Copied to clipboard!", {
            silent: true,
            icon: "/tmp/twemoji/tmp.png" 
        });
    };

    el.draggable = true;
    el.ondragstart = (event) => {
        event.preventDefault();
        ipcRenderer.sendSync("download", el.src);
        ipcRenderer.send('ondragstart');
    };
});
