
export { }

declare global {
  interface Window {
    fs: typeof import('fs')
    ipcRenderer: import('electron').IpcRenderer
    shell: typeof import('electron').shell
    removeLoading: () => void
  }
}
