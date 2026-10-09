import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
const env={...process.env,ANATO_VERIFY_BUILD:'1',PLAYWRIGHT_BASE_URL:'http://127.0.0.1:3100'};
const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
if (!env.PLAYWRIGHT_CHROME_PATH && process.platform === 'win32' && existsSync(chrome)) env.PLAYWRIGHT_CHROME_PATH = chrome;
const server=spawn(process.execPath,['--use-system-ca','node_modules/next/dist/bin/next','dev','--hostname','127.0.0.1','--port','3100','--webpack'],{env,stdio:['ignore','pipe','pipe'],windowsHide:true});
let started=false;
let serverError;
server.on('error', error => { serverError = error; });
server.stdout.on('data', data=>{const text=data.toString();process.stdout.write(text);if(text.includes('Ready'))started=true;});
server.stderr.on('data',data=>process.stderr.write(data));
async function main(){
 for(let i=0;i<60&&!started&&!serverError&&server.exitCode===null;i++) await new Promise(r=>setTimeout(r,500));
 if(!started)throw new Error('Verification server did not start');
 const response=await fetch(env.PLAYWRIGHT_BASE_URL+'/app',{signal:AbortSignal.timeout(240000)});
 await response.text();
 if (!response.ok) throw new Error('Verification page failed to load: HTTP ' + response.status);
 console.log('Verification server HTTP:',response.status);
 const runner=spawn(process.execPath,['node_modules/@playwright/test/cli.js','test',...process.argv.slice(2)],{env,stdio:'inherit',windowsHide:true});
 const code=await new Promise(resolve=>runner.on('exit',resolve));
 process.exitCode=code ?? 1;
}
try{await main();}catch(error){console.error(error.message);process.exitCode=1;}finally{
 if (process.platform === 'win32' && server.pid && server.exitCode === null) {
  const cleanup = spawn('taskkill', ['/PID', String(server.pid), '/T', '/F'], {stdio:'ignore', windowsHide:true});
  await Promise.race([new Promise(resolve => { cleanup.on('exit', resolve); cleanup.on('error', resolve); }), new Promise(resolve => setTimeout(resolve, 5000))]);
  cleanup.kill();
  server.kill();
 } else server.kill();
 process.exit(process.exitCode || 0);
}
