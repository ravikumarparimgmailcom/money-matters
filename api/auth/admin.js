import { createToken, body, send } from '../../server/session.js';
import { timingSafeEqual } from 'node:crypto';
const equal=(a,b)=>{const x=Buffer.from(String(a??'')),y=Buffer.from(String(b??''));return x.length===y.length&&timingSafeEqual(x,y);};
export default async function handler(req,res){
 if(req.method!=='POST')return send(res,405,{message:'Method not allowed'});
 try{
  const {email,password}=await body(req);
  if(!process.env.ADMIN_EMAIL||!process.env.ADMIN_PASSWORD||!process.env.SESSION_SECRET)return send(res,503,{message:'Admin authentication is not configured. Check server environment variables.'});
  if(!equal(email,process.env.ADMIN_EMAIL)||!equal(password,process.env.ADMIN_PASSWORD))return send(res,401,{message:'Admin email or password does not match server configuration.'});
  return send(res,200,{token:createToken({role:'admin',userId:null}),role:'admin',userId:null});
 }catch(e){return send(res,500,{message:e.message||'Admin login failed'});}
}