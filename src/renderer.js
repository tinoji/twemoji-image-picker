'use strict';

show();

document.getElementById('close-btn').addEventListener('click', () => {
    window.api.closeWindow();
});

async function show() {
    let contents = document.getElementById('contents');
    while (contents.firstChild) {
        contents.removeChild(contents.firstChild);
    }

    const query = document.getElementById('search-input');
    const regex = new RegExp(query.value);

    const filtered = await window.api.filterEmoji(regex);
    filtered.map((el) => {
        let dom = document.createElement('span');
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
        el.addEventListener('click', (e) => {
            e.preventDefault();

            // prevent repeated clicks
            let container = document.querySelector('.main-container');
            container.style['pointer-events'] = 'none';
            setTimeout(() => {
                container.style['pointer-events'] = 'auto';
            }, 1000);

            const v = parseInt(document.getElementById('png-size-input').value);
            if (!/^\d*$/.test(v) || v === '' || parseInt(v) === 0 || parseInt(v) > 4096) {
                window.api.notifyError('Invalid size value.');
            } else {
                window.api.download(el.src, parseInt(v));
                window.api.notifySuccess('Copied image to clipboard!');
            }
        });
    });
}