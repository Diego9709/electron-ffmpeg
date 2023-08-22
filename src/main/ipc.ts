
import { ipcMain, dialog } from 'electron'
import spawn from 'cross-spawn';
import child_process from "child_process";
import * as os from 'os';
import { fileType} from './const'
import path from "path";
let fs = require("fs")
let lastChildProcess: child_process.ChildProcess = {} as child_process.ChildProcess;
export function initIpc() {
    ipcMain.handle('selectDic', async (event, arg) => {

        const { canceled, filePaths } = await dialog.showOpenDialog(
            {
                title: "请选择要导入的视频",
                properties: ['openDirectory']
            }

        )

        return filePaths[0] ? filePaths[0] + "\\" : ''

    })

    // 开始写逻辑代码
    ipcMain.handle('selectVideoFiles', async (event, arg) => {
        const { canceled, filePaths } = await dialog.showOpenDialog(
            {
                title: "请选择视频位置/Please select the video location",
                properties: ["openFile", "multiSelections"],
                filters: [{
                    name: "file format", extensions: fileType
                }]
            }

        )

        return filePaths || []
    })
    ipcMain.handle("processAudios", async (event, arg) => {
        return await new Promise((resolve, reject) => {

            if (lastChildProcess && lastChildProcess.pid) {
                lastChildProcess.kill();
            }

            let cmd = 'ffmpeg';
            let cmder = [];
            let env = process.env;

            if (os.platform() === 'win32') {
                // Adjust for Windows
                const ffmpegPath = path.join(
                    os.homedir(),
                    'AppData',
                    'Roaming',
                    'WhisperX',
                    'ffmpeg',
                    'ffmpeg.exe'
                );
                cmd = ffmpegPath;
            } else if (os.platform() === 'darwin') {
                // Adjust for macOS
                env.PATH = '/usr/local/bin:' + env.PATH;
            } else if (os.platform() === 'linux') {
                // Adjust for Linux
                env.PATH = '/usr/local/bin:' + env.PATH;
            }

            cmder = ["-i", arg.input, "-f", "s16le", "-acodec", "pcm_s16le", "-ac", "1", "-ar", "44100",'-y', arg.output];
            lastChildProcess = spawn(cmd, cmder, {
                env: env,
                stdio: 'inherit'
            });


            lastChildProcess.on('close', (code) => {
                if (code === 0) {
                    resolve(true);
                } else {
                    console.error(`Child process exited with code ${code}`);
                    resolve(false);
                }

            })


            lastChildProcess.on("error", (data) => {
                console.log(data.toString());
                resolve(false)
            });
        })

    });


}
