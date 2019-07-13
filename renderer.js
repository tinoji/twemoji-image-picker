'use strict';

const { ipcRenderer, remote } = require('electron');
const emoji = require('emoji.json');
const appName = require('./package.json').name;

show();

document.getElementById('close-btn').addEventListener('click', () => {
    let window = remote.getCurrentWindow();
    window.close();
});

function show() {
    let contents = document.getElementById('contents');
    while (contents.firstChild) {
        contents.removeChild(contents.firstChild);
    }

    const query = document.getElementById('search-input');
    const regex = new RegExp(query.value);

    emoji
        .filter((el) => (el['codes'].match(/ /) == null)) // exclude surrogate pair
        .filter((el) => el['name'].match(regex) != null)
        .map((el) => {
            let dom = document.createElement('SPAN');
            dom.textContent = twemoji.convert.fromCodePoint(el['codes']);
            dom.title = el['name'];
            contents.appendChild(dom);
        });

    twemoji.parse(contents, {
        folder: 'svg',
        ext: '.svg'
    });

    addEventlisteners();
}

function addEventlisteners() {
    const emojis = Array.from(document.getElementsByClassName('emoji'));
    emojis.map((el) => {
        el.addEventListener('click', async (event) => {
            event.preventDefault();
            displayLoading(el);
            await sleep(0); // FIXME: hmm...

            const v = parseInt(document.getElementById('png-size-input').value);
            if (!/^\d*$/.test(v) || v === '' || parseInt(v) === 0 || parseInt(v) > 4096) {
                new Notification(appName, {
                    body: 'Invalid size value.',
                    silent: true,
                    icon: './assets/warning.png'
                });
            } else {
                const size = parseInt(v);
                const svgOptions = { width: size, height: size };
                ipcRenderer.sendSync('download', el.src, svgOptions);

                await sleep(0);
                new Notification(appName, {
                    body: 'Copied PNG image to clipboard!',
                    silent: true,
                    icon: './assets/check.png'
                });
            }
            hideLoading(el);
        });
    });
}

function displayLoading(el) {
    const rect = el.getBoundingClientRect();
    const x = rect.left + window.pageXOffset - 14;
    const y = rect.top + window.pageYOffset - 14;

    let loading = document.getElementById('loading');
    loading.style.left = x + 'px';
    loading.style.top = y + 'px';
    loading.style.display = 'inline-block';

    let overlay = document.getElementById('overlay');
    overlay.style.display = 'inline-block';

    el.style.zIndex = '3';
    el.style.backgroundColor = 'rgba(233, 233, 233, 1)';
}

function hideLoading(el) {
    let loading = document.getElementById('loading');
    loading.style.display = 'none';

    let overlay = document.getElementById('overlay');
    overlay.style.display = 'none';

    el.style.zIndex = null;
    el.style.backgroundColor = null;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
