import { createHmac, timingSafeEqual, randomBytes } from 'node:crypto';

const b64 = (v) => Buffer.from(v).toString('base64url');
const sign = (v) => createHmac('sha256', process.env.SESSION_SECRET || '').update(v).digest('base64url');

export function createToken(payload) {
  if (!process.env.SESSION_SECRET) throw new Error('SESSION_SECRET is not configured');
  const body = b64(JSON.stringify({...payload, exp: Math.floor(Date.now()/1000)+60*60*8}));
  const content = `v1.${body}`;
  return `${content}.${sign(content)}`;
}
export function verifyToken(token) {
  if (!process.env.SESSION_SECRET || typeof token !== 'string') return null;
  const [v, body, sig] = token.split('.');
  if (v !== 'v1' || !body || !sig) return null;
  const expected = Buffer.from(sign(`${v}.${body}`)), actual = Buffer.from(sig);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  try { const p=JSON.parse(Buffer.from(body,'base64url').toString()); if (!p.exp || p.exp < Date.now()/1000 || !['admin','user'].includes(p.role)) return null; if (p.role==='user' && p.userId==null) return null; return p; } catch { return null; }
}
export function send(res,status,data){res.statusCode=status;res.setHeader('Content-Type','application/json');res.end(JSON.stringify(data));}
export async function body(req){if(req.body && typeof req.body==='object') return req.body; if(typeof req.body==='string') return JSON.parse(req.body||'{}'); let s=''; for await(const c of req)s+=c; return s?JSON.parse(s):{};}
export function session(req){const h=req.headers.authorization||'';return verifyToken(h.startsWith('Bearer ')?h.slice(7):'');}
export function hasuraConfig(){const base=(process.env.HASURA_API_BASE_URL||'https://bursting-gelding-24.hasura.app/api/rest').replace(/\/$/,'');if(!process.env.HASURA_ADMIN_SECRET)throw new Error('HASURA_ADMIN_SECRET is missing in server environment');return {base,secret:process.env.HASURA_ADMIN_SECRET};}
