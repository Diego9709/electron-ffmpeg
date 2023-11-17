
import { ipcMain, dialog } from 'electron'
import spawn from 'cross-spawn';
import child_process from "child_process";
import * as os from 'os';
import {appPath, fileType} from '../common/const'
import path from "path";
import fs from "fs";
import {addToTaskQueue} from "../common/submit";
let lastChildProcess: child_process.ChildProcess = {} as child_process.ChildProcess;
const isDevelopment = process.env.NODE_ENV !== "production";
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
    ipcMain.handle("processAudios", async (event, fileTask) => {
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
                    appPath,
                    isDevelopment ? "./public/ffmpeg.exe" : "../public/ffmpeg.exe"
                );
                cmd = ffmpegPath;
            } else if (os.platform() === 'darwin') {
                // Adjust for macOS
                env.PATH = '/usr/local/bin:' + env.PATH;
            } else if (os.platform() === 'linux') {
                // Adjust for Linux
                env.PATH = '/usr/local/bin:' + env.PATH;
            }
            let fileLoc = fileTask.path;
            let outFileName = fileTask.id + '_' + fileTask.name + '.pcm';
            let outCache = path.join(
                os.homedir(),
                'AppData',
                'Roaming',
                'WhisperX',
                'cache',
                outFileName
            )

            // create cache dir if not exist
            if (!fs.existsSync(path.dirname(outCache))) {
                fs.mkdirSync(path.dirname(outCache), { recursive: true });
            }


            cmder = ["-i", fileLoc, "-f", "s16le", "-acodec", "pcm_s16le", "-ac", "1", "-ar", "16000",'-y', outCache];

            lastChildProcess = spawn(cmd, cmder, {
                env: env,
                stdio: 'inherit'
            });


            lastChildProcess.on('close', (code) => {
                if (code === 0) {
                    console.log(`Child process exited with code ${code},Ready to submit audio file to server.`)
                    resolve(outCache);
                } else {
                    console.error(`Child process exited with code ${code}`);
                    resolve("");
                }

            })

            lastChildProcess.on("error", (data) => {
                console.log(data.toString());
                resolve("")
            });


        })



    });


    ipcMain.handle("uploadAudio", async (event, taskDetails: string) => {
        addToTaskQueue(taskDetails);
    })

}
