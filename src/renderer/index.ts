// TODO: make class? 
"use strict";

import { ipcRenderer, remote } from "electron";
import * as emoji from "emoji.json";
import * as packageInfo from "../../package.json";
const twemoji = require("twemoji");
const appName = packageInfo.name;

show();

const closeBtn: HTMLElement = document.getElementById("close-btn") as HTMLElement;
closeBtn.addEventListener("click", () => {
    const window = remote.getCurrentWindow();
    window.close();
});

export function show() {
    const contents: HTMLElement = document.getElementById("contents") as HTMLElement;
    while (contents.firstChild) {
        contents.removeChild(contents.firstChild);
    }

    const query: HTMLInputElement = document.getElementById("search-input") as HTMLInputElement;
    const regex = new RegExp(query.value);

    emoji
        .filter((el: any) => (el.codes.match(/ /) == null)) // exclude surrogate pair
        .filter((el: any) => el.name.match(regex) != null)
        .map((el: any) => {
            const dom = document.createElement("span");
            dom.textContent = twemoji.convert.fromCodePoint(el.codes);
            dom.title = el.name;
            contents.appendChild(dom);
        });

    twemoji.parse(contents, {
        folder: "svg",
        ext: ".svg",
    });

    addEventlisteners();
}

function addEventlisteners() {
    const emojis = Array.from(document.getElementsByClassName("emoji"));
    emojis.map((el) => {
        el.addEventListener("click", async (event) => {
            event.preventDefault();
            displayLoading(el as HTMLElement);
            await sleep(0); // FIXME: hmm...

            const sizeInput: HTMLInputElement = document.getElementById("png-size-input") as HTMLInputElement;
            const size: number = parseInt(sizeInput.value);
            if (!/^\d*$/.test(size.toString()) || Number.isNaN(size) || size === 0 || size > 4096) {
                new Notification(appName, {
                    body: "Invalid size value.",
                    silent: true,
                    icon: "./assets/warning.png",
                });
            } else {
                ipcRenderer.sendSync("download", (el as HTMLImageElement).src, size);

                await sleep(0);
                new Notification(appName, {
                    body: "Copied PNG image to clipboard!",
                    silent: true,
                    icon: "./assets/check.png",
                });
            }
            hideLoading(el as HTMLElement);
        });
    });
}

function displayLoading(el: HTMLElement): void {
    const rect = el.getBoundingClientRect();
    const x = rect.left + window.pageXOffset - 14;
    const y = rect.top + window.pageYOffset - 14;

    const loading = document.getElementById("loading") as HTMLElement;
    loading.style.left = x + "px";
    loading.style.top = y + "px";
    loading.style.display = "inline-block";

    const overlay = document.getElementById("overlay") as HTMLElement;
    overlay.style.display = "inline-block";

    el.style.zIndex = "3";
    el.style.backgroundColor = "rgba(233, 233, 233, 1)";
}

function hideLoading(el: HTMLElement): void {
    const loading = document.getElementById("loading") as HTMLElement;
    loading.style.display = "none";

    const overlay = document.getElementById("overlay") as HTMLElement;
    overlay.style.display = "none";

    el.style.zIndex = null;
    el.style.backgroundColor = null;
}

function sleep(ms: number): Promise<number> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
