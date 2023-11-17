import {authForPut} from "./http";
import fs from "fs";

const OSS = require('ali-oss');

const maxUploadRetry = 3;


export async function uploadFile(cid: string, path: string) {
    let authInfo = await getAuthForUpload(cid);
    let {requestId, access_key_id, access_key_secret, security_token, expiration, bucket_name, endpoint, region} = authInfo.data
    let client = new OSS({
        "region": region,
        "accessKeyId": access_key_id,
        "accessKeySecret": access_key_secret,
        "stsToken": security_token,
        "endpoint": endpoint,
        "bucket": bucket_name
    });
    const headers = {
        'x-oss-storage-class': 'Standard',
        'x-oss-object-acl': 'private',
    };
    let parts = path.split('\\');
    let fileName = parts[parts.length - 1];
    let desPath = "/task-files/" + fileName;
    let isUploaded = false;
    let fileSize = fs.statSync(path).size;
    for (let i = 0; i < maxUploadRetry && !isUploaded; i++) {
        if (fileSize <= 100 * 1024 * 1024) {
            try {
                let result = await client.put(desPath, path, {headers});
                console.log(result)
                isUploaded = true;
            } catch (error) {
                console.log(error);
                throw new Error("OSS 上传错误：" + error.message)
            }
        } else {
            let ckpt: any;
            const progress = async function (p: number, checkpoint: object, res: object) {
                ckpt = checkpoint;
                console.log(p, res);
                isUploaded = true;
            }
            try {
                await client.multipartUpload(desPath, path, {}),
                isUploaded = true;
            } catch (error) {
                console.log(error);
                throw new Error("OSS 上传错误：" + error.message)
            }
        }

    }

    return isUploaded;



}

export async function getAuthForUpload(cid: string) {
    try {
        const data = await authForPut(cid);

        const authInfo = JSON.parse(data);
        if (authInfo.code !== 200) {
            throw new Error("OSS 鉴权错误：" + authInfo.message);
        }

        return authInfo;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

