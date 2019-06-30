"use strict";
const { ipcRenderer } = require('electron');
const emoji = require('emoji.json');

const parser = new DOMParser();
let sourceString = emoji.filter((el) => (el["codes"].match(/ /) == null))
    .map((el) => `&#x${el["codes"]};`)
    .reduce((previous, current) => previous + current);

let doc = parser.parseFromString(sourceString, "text/html");
let contents = document.getElementById("contents");
contents.innerHTML = doc.body.innerText;
twemoji.parse(contents);
addEventlisteners();

// TODO: fix
function search() {
    const query = document.getElementById("search-query");
    const regex = new RegExp(query.value)

    sourceString = emoji.filter((el) => (el["codes"].match(/ /) == null))
        .filter((el) => el["name"].match(regex) != null)
        .map((el) => `&#x${el["codes"]};`)
        .reduce((previous, current) => previous + current);

    doc = parser.parseFromString(sourceString, "text/html");
    contents = document.getElementById("contents");
    contents.innerHTML = doc.body.innerText;
    twemoji.parse(contents);

    addEventlisteners();
}

function addEventlisteners() {
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
}
