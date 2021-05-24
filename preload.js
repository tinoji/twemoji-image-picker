'use strict';

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    closeWindow: async () => await ipcRenderer.invoke('closeWindow'),

    filterEmoji: async (regex) => await ipcRenderer.invoke('filterEmoji', regex),

    notifySuccess: async (message) => await ipcRenderer.invoke('notifySuccess', message),

    notifyError: async (message) => await ipcRenderer.invoke('notifyError', message),

    download: async (url, size)  => await ipcRenderer.invoke('download', url, size),
});