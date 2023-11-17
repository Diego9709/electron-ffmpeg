const http = require('http');

const baseUrl = 'trans.diego.run';

function sendRequest(method: string, url: string, data: any, headers = {}): Promise<string> {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: baseUrl,
            port: 80,
            path: url,
            method: method,
            headers: headers,
        };

        const req = http.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                if (res.statusCode === 200) {
                    resolve(responseData);
                } else {
                    throw new Error(`HTTP request failed with status code ${res.statusCode}`);
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

export async function authForPut(cid: string) {
    const url = '/whisper/oss/auth/putTask';
    const headers = {
        'Cookie': `cid=${cid}`,
    };
    return sendRequest('GET', url, null, headers);
}

export function authForGet(cid: string) {
    const url = '/whisper/oss/auth/getResult';
    const headers = {
        'Cookie': `cid=${cid}`,
    };
    return sendRequest('GET', url, null, headers);
}

export async function submitTask(task: any) {
    const url = '/whisper/client/task';
    let taskDto = {
        cid: task.cid,
        task_id: task.id,
        file_name: task.name,
        file_md5: '',
        resource_type: 'WHISPER',
        token: '',
        whisper_task_params: task.params
    }
    const headers = {
        'Content-Type': 'application/json',
        'Cookie': `cid=${task.cid}`,
    };
    console.log(taskDto)

    return sendRequest('POST', url, taskDto, headers);
}

