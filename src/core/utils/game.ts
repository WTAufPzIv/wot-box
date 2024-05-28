import { GameName } from '../const/game';
import { IipcMessage } from '../const/type'

export function ipcMessageTool(namespace: string, command: string, payload: any = {}, listener: string = ''): Promise<IipcMessage> {
    if (listener) {
        return new Promise((resolve) => {
            (window as any).electron.ipcRenderer.send(namespace, command, payload);
            (window as any).electron.ipcRenderer.once(listener, (ipcMessage: IipcMessage) => {
                resolve(ipcMessage as IipcMessage);
            });
        });
    }
    (window as any).electron.ipcRenderer.send(namespace, command, payload);
    return Promise.resolve({
        status: 1,
        message: '',
        payload: {}
    });
}

export async function addGamePathByDialog(): Promise<IipcMessage> {
    return await ipcMessageTool('dialog', 'open-directory-dialog', {}, 'selected-directory')
}

export async function addGamePathBySearch(): Promise<any> {
    return new Promise(async (res, rej) => {
        const resp = await ipcMessageTool('dialog', 'search-game-path', {}, 'search-game-path-res');
        if (resp.status) {
            const pathArr = resp.payload;
            if (pathArr.length === 0) rej('未查找到游戏');
            for(const item of pathArr) {
                const temp = item.replace('\\lgc_api.exe', '')
                const isWot = await isWotFolder(temp);
                if (isWot) res(temp);
            }
        } else {
            rej(resp.message)
        }
    })
}

export async function showErrorByDialog(title: string, message: string) {
    return await alert(title + message)
}

export async function isWotFolder(path: string): Promise<boolean> {
    const checkList = [
        'WorldOfTanks.exe',
        'res',
        'res_mods',
        'version.xml',
        'lgc_api.exe'
    ]
    const list = await ipcMessageTool('file', 'get-file-list', { path }, 'send-file-list')
    return (list.status && list.payload && list.payload.length > 0 && checkList.every(element => list.payload.includes(element))) || 0;
}

export async function parseGameInstallation(path: string) {
    const isWot = await isWotFolder(path);
    if (!isWot) throw new Error('非WOT文件夹')
    const wotVersionXml = await ipcMessageTool('file', 'read-version-xml', { path }, 'send-version-xml');
    const versionXmlRaw = JSON.parse(wotVersionXml.payload)['version.xml'];
    const { meta, version } = versionXmlRaw
    const name = meta[0].realm[0].replace(/\s/g, "");
    return {
        path,
        gameVersion: version[0].split(' ')[1].replace('v.', ''),
        gameName: (GameName as any)[name]
    }
}

export async function getInstalledMods(path: string) {
    return await ipcMessageTool('file', 'get-installed-mods', { path }, 'installed-mods')
}

export async function getInstalledTrans(path: string) {
    return await ipcMessageTool('file', 'get-installed-trans', { path }, 'installed-trans')
}

export async function removeFileByFileList(pathList: string[]) {
    return await ipcMessageTool('file', 'delete-file', { pathList }, 'delete-file-res')
}

export async function openUrlByBrowser(url: string) {
    return await ipcMessageTool('shell', 'open-url-by-browser', { url })
}

export async function clearAllMods(path: string, gameVersion: string) {
    return await ipcMessageTool('file', 'clear-all-mods', { path, gameVersion }, 'clear-all-mods-res');
}

export async function closeLoginAndOpenMain() {
    return await ipcMessageTool('login-window-control', 'login-successful');
}

export async function closeMainAndOpenLogin() {
    return await ipcMessageTool('login-window-control', 'login-out');
}

export async function fetchLestaData(gameUsername: string) {
    return await ipcMessageTool('axios', 'get-gameuser-id', { gameUsername }, 'send-gameuser-id');
}

export async function deleteAppData() {
    return await ipcMessageTool('vuex', 'clear-vuex', {}, 'clear-vuex-res');
}

export async function restartApp() {
    return await ipcMessageTool('window-control', 'restart');
}

export async function startCheckGameRun() {
    return await ipcMessageTool('game-run', 'start-check', { processName: [ 'lgc.exe', 'worldoftanks.exe' ] });
}

export async function stopCheckGameRun() {
    return await ipcMessageTool('game-run', 'stop-check', 'stop-check-res');
}

export async function extractVip(mods: any, gamePath: string) {
    return await ipcMessageTool('file', 'extract-vip', { mods, path: gamePath }, 'extract-vip-res');
}

export async function deleteVip(mods: any) {
    return await ipcMessageTool('file', 'delete-vip', { mods }, 'delete-vip-res');
}

export async function startGame(path: string) {
    return await ipcMessageTool('game-run', 'start-game', { path: path + '\\lgc_api.exe' }, 'start-game-res');
}

export async function stopClient() {
    return await ipcMessageTool('game-run', 'stop-client', {} , 'stop-client-res');
}