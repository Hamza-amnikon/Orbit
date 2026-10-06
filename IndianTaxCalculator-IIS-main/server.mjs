import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {calculate,validateInput} from './lib/tax.ts';
import {selectRule,publicRules,monitoring} from './lib/rule-store.ts';
import {json,sameOrigin,body,admin,monitorAuth,privateHeaders} from './lib/security.ts';
import {report} from './lib/report.ts';
import {checkOfficialSources} from './lib/monitor.ts';
const port=Number(process.env.PORT||3000),host=process.env.HOST||'127.0.0.1';
if(!process.env.PUBLIC_ORIGIN)throw Error('Set PUBLIC_ORIGIN in .env to the exact external HTTPS origin (or localhost for testing).');
if(!process.env.ADMIN_TOKEN||process.env.ADMIN_TOKEN.length<32)throw Error('Set ADMIN_TOKEN to a random secret of at least 32 characters.');
const origin=new URL(process.env.PUBLIC_ORIGIN);if(origin.pathname!=='/'||origin.search||origin.hash)throw Error('PUBLIC_ORIGIN must be an origin without a path.');
const root=resolve('dist');const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon','.woff2':'font/woff2'};
http.createServer(async(req,res)=>{try{
 const path=new URL(req.url,'http://localhost').pathname;
 const headers=new Headers();for(const [k,v] of Object.entries(req.headers))if(v)headers.set(k,Array.isArray(v)?v.join(','):v);
 let bytes=Buffer.alloc(0);for await(const chunk of req){if(bytes.length+chunk.length>8192){res.writeHead(413);res.end('Request too large');return;}bytes=Buffer.concat([bytes,chunk]);}
 const request=new Request(process.env.PUBLIC_ORIGIN+req.url,{method:req.method,headers,...(bytes.length?{body:bytes}:{} )});let response;
 if(path==='/api/rules'&&req.method==='GET')response=json(await publicRules());
 else if((path==='/api/calculate'||path==='/api/report')&&req.method==='POST'){sameOrigin(request);const input=validateInput(await body(request));const c=calculate(input.salary,await selectRule(input.fy));response=path.endsWith('report')?new Response(report(c),{headers:{...privateHeaders,'Content-Type':'application/pdf','Content-Disposition':'attachment; filename="India-Salary-Tax.pdf"'}}):json(c);}
 else if(path==='/api/admin'&&req.method==='GET')response=await admin(request)?json(await monitoring()):json({error:'Administrator access required.'},401);
 else if(path==='/api/monitor/check'&&req.method==='POST')response=await monitorAuth(request)?json(await checkOfficialSources()):json({error:'Scheduler credentials required.'},401);
 else if(path.startsWith('/api/'))response=json({error:'Route or method unavailable.'},404);
 else if(req.method==='GET'||req.method==='HEAD'){let file=resolve(root,'.'+decodeURIComponent(path));if(!file.startsWith(root+sep)&&file!==root){res.writeHead(403);res.end();return;}if(path==='/'||path==='/admin')file=resolve(root,'index.html');try{if(!(await stat(file)).isFile())throw Error();const content=await readFile(file);response=new Response(req.method==='HEAD'?null:content,{headers:{...privateHeaders,'Content-Type':mime[extname(file)]||'application/octet-stream'}});}catch{response=new Response('Not found',{status:404});}}
 else response=json({error:'Method unavailable.'},405);
 res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));
 }catch(e){const response=json({error:e.message||'Request failed'},400);res.writeHead(response.status,Object.fromEntries(response.headers));res.end(await response.text());}
}).listen(port,host,()=>console.log(`India Tax Calculator listening on ${host}:${port}`));
