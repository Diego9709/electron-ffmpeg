import {v4 as uuidv4} from 'uuid';
/**
 * 打开本地文件
 * @param path
 */
export function openPath(path: string) {

    window.shell.openPath(path).then(r => {})

}

export function openUrl(path: string) {
    window.shell.openExternal(path).then(r => {})
}

export function generateUUID(): string {
    return uuidv4();
}


