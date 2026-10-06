import {DatabaseSync} from 'node:sqlite';
import {mkdirSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
const file=resolve(process.env.DATA_FILE||'data/rules.sqlite');mkdirSync(dirname(file),{recursive:true});
const sqlite=new DatabaseSync(file);sqlite.exec('PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS rule_versions(id TEXT PRIMARY KEY,fy TEXT NOT NULL,effective_from TEXT NOT NULL,recorded_at TEXT NOT NULL,payload TEXT NOT NULL,evidence TEXT NOT NULL);CREATE TABLE IF NOT EXISTS source_checks(id TEXT PRIMARY KEY,checked_at TEXT NOT NULL,status TEXT NOT NULL,details TEXT NOT NULL);CREATE TABLE IF NOT EXISTS alerts(id TEXT PRIMARY KEY,created_at TEXT NOT NULL,message TEXT NOT NULL,delivery TEXT NOT NULL);');
function prepare(sql:string){let args:any[]=[];const statement=sqlite.prepare(sql);return {bind(...values:any[]){args=values;return this;},async all(){return {results:statement.all(...args)};},async first(){return statement.get(...args)??null;},async run(){return statement.run(...args);}};}
export const environment={...process.env,DB:{prepare,async batch(statements:any[]){sqlite.exec('BEGIN');try{const results=[];for(const s of statements)results.push(await s.run());sqlite.exec('COMMIT');return results;}catch(e){sqlite.exec('ROLLBACK');throw e;}}}};
