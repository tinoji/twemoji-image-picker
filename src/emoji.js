const { ipcRenderer } = require('electron')
const emoji = require('emoji.json');
const twemoji = require('twemoji')

// emoji
const parser = new DOMParser();
const stringContainingHTMLSource = emoji.filter((element) => (element["codes"].match(/ /) == null))
    .map((element) => `&#x${element["codes"]};`)
    .reduce((previous, current) => previous + current);

const doc = parser.parseFromString(stringContainingHTMLSource, "text/html");
const contents = document.getElementById("contents");
contents.innerHTML = doc.body.innerText;
twemoji.parse(document.getElementById("contents"))

// eventlistener
const emojis = Array.from(document.getElementsByClassName("emoji"))
emojis.map((el) => {
    el.onclick = (event) => {
        event.preventDefault()
        ipcRenderer.sendSync('download', el["src"])
        ipcRenderer.send("copy")
        new Notification("Copied to clipboard!", {
            silent: true
            // TODO: icon
        })
    }

    el.draggable = true
    el.ondragstart = (event) => {
        event.preventDefault()
        ipcRenderer.sendSync("download", el["src"])
        ipcRenderer.send('ondragstart')
    }
})
