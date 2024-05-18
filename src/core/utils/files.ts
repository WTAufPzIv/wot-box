const xml2js = require('xml2js')
const fs = require('fs');
const cryptoJS = require('crypto-js');
const JSZip = require('jszip');
const path = require('path')
const { exec } = require('child_process');
const { app } = require('electron');
const { spawn } = require('child_process');
const fsPromise = require('fs').promises;

// 读取并解析XML文件的函数
export function readAndParseXML(filePath: string) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, (err: any, data: any) => {
            if (err) {
                reject(err);
                return;
            }         
            xml2js.parseString(data, (err: any, result: any) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(result);
            });
        });
    });
}

export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function readXvmHtml(xvmhtml: string, wgHtml: string, username: string) {
    const keys = [
        '总场次','胜率','WN8',
        'WG评级','名人堂评级','EF效率',
        '出战等级','平均侦察','平均占领',
        '装甲利用率','损伤率','场均击毁',
        '场均伤害','场均经验','击毁记录',
        '伤害记录','经验记录','幸存率',
        '总命中率','环线数量','战斗嘉奖数量',
    ];
    const reg = /<div class="h2">(.*)<\/div>/g;
    const reg1 = /"reg_timestamp": (\d*),/g
    const reg2 = /"last_battle_at": (\d*)/g
    const battleReport: Record<string, string> = {};
    const regRes1 = xvmhtml.match(reg);
    const regRes2 = wgHtml.match(reg1);
    const regRes3 = wgHtml.match(reg2);
    if (regRes1) {
        const arr = regRes1.map(item => {
            return item.replace(/<div class="h2">(.*)<\/div>/, '$1').replace(/\s*/g, '')
        });
        keys.forEach((item: string, index: number) => {
            battleReport[item] = arr![index];
        })
    }
    if (regRes2) {
        const arr = regRes2.map(item => {
            return item.replace(/"reg_timestamp": (\d*),/, '$1').replace(/\s*/g, '')
        });
        battleReport['账号创建时间'] = arr[0];
    }
    if (regRes3) {
        const arr = regRes3.map(item => {
            return item.replace(/"last_battle_at": (\d*)/, '$1').replace(/\s*/g, '')
        });
        battleReport['上次战斗时间'] = arr[0];
    }
    battleReport['name'] = username;
    return battleReport;
}

const key = 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCqJH2'; // 密钥，应保密并足够复杂

// 加密函数
export function encrypt(text: string) {
    const str = JSON.stringify({ str: text });
    const encJson = cryptoJS.AES.encrypt(str.replace(/[\n]/g, ''), key).toString();
    // 加密数据不是8的整数倍就会报malformed utf-8 data错误
    // 对加密数据进行base64处理, 原理：就是先将字符串转换为utf8字符数组，再转换为base64数据
    return cryptoJS.enc.Base64.stringify(cryptoJS.enc.Utf8.parse(encJson));
}
  
// 解密函数
export function decrypt(text: string) {
    const decData = cryptoJS.enc.Base64.parse(text).toString(cryptoJS.enc.Utf8);
    //解密数据
    const decJson = cryptoJS.AES.decrypt(decData, key).toString(cryptoJS.enc.Utf8);
    return JSON.parse(decJson).str
}

// 读取压缩包内大德层文件夹
export async function readZipRootFolder(zipFilePath: string, pattern = /\[大德\].*\/$/) {
    // 读取ZIP文件内容
    // const pattern = /^\[大德\].*\/$/;
    const data = fs.readFileSync(zipFilePath);
    const zip = await JSZip.loadAsync(data);
    // 查找符合命名模式的文件夹
    let folderPath = null;
    
    zip.forEach((relativePath: any, zipEntry: any) => {
        
        if (zipEntry.dir && relativePath.match(pattern)) {
            folderPath = relativePath;
        }
    });
    // 返回找到的文件夹路径，如果没有找到则返回null
    return folderPath;
}

// 使用7z命令行工具解压压缩包
export function unzipFile(zipFilePath: string, outputDir: string, password: string) {
    return new Promise((res, rej) => {
        // 构建7z.exe的路径
        const sevenZipPath = path.join(app.getPath('userData'), '7z.exe');
        const command = password
            ? `"${sevenZipPath}" x "${zipFilePath}" -p"${password}" -o"${outputDir}" -y`
            : `"${sevenZipPath}" x "${zipFilePath}" -o"${outputDir}" -y`

        exec(command, (error: any, stdout: any, stderr: any) => {
            if (error) {
                rej(error)
            }
            if (stderr) {
                rej(stderr)
            }
            res(stdout)
        });
    })
}

export function checkProcess(name: string) {
    return new Promise((res) => {
        const tasklist = spawn('tasklist');
          let output = '';

          tasklist.stdout.on('data', (data: any) => {
              output += data.toString();
          });

          tasklist.on('close', () => {
              const isRunning = output.toLowerCase().includes(name.toLowerCase());
              res(isRunning);
          });
    })
}

export function killProcess(name: string) {
    return new Promise((res) => {
        exec(`taskkill /F /IM ${name}`, () => {
            // do nother
            res(1);
        });
    })
}

// 递归处理目录和文件
export async function removeReadonlyAttr(dir: string) {
    const entries = await fsPromise.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            // 如果是目录，递归处理
            await removeReadonlyAttr(fullPath);
        } else if (entry.isFile()) {
            // 如果是文件，去除只读属性
            const stats = await fsPromise.stat(fullPath);
            const newMode = stats.mode | 0o200; // 添加写权限

            await fsPromise.chmod(fullPath, newMode);
        }
    }
}