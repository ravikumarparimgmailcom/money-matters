import{useState}from'react';
import{useToast}from'../context/ToastContext.jsx';
import{useAuth}from'../context/AuthContext.jsx';
export default function Profile(){
 const toast=useToast(),{session}=useAuth(),isAdmin=session?.role==='admin';
 const[form,F]=useState({name:session?.name||session?.full_name||'',username:session?.username||'',email:session?.email||'',dob:'',address:'',city:'',postal_code:'',country:''});
 const change=e=>F(p=>({...p,[e.target.name]:e.target.value}));
 return <><header className="top"><h2>{isAdmin?'Admin Profile':'Profile'}</h2></header>
 <section className="panel profile-card"><div className="profile-heading"><div className="profile-avatar">{(form.name||form.email|| (isAdmin?'A':'U')).charAt(0).toUpperCase()}</div><div><h3>{form.name|| (isAdmin?'Administrator':'My Profile')}</h3><p className="muted">{isAdmin?'Administrator account details':'Manage your personal details'}</p></div></div>
 <form className="profile" onSubmit={e=>{e.preventDefault();toast('Profile details are displayed locally. Connect the official profile update API to save changes permanently.')}}><div className="profile-grid">{[['name','Full Name'],['username','Username'],['email','Email Address'],['dob','Date of Birth'],['address','Permanent Address'],['city','City'],['postal_code','Postal Code'],['country','Country']].map(([k,l])=><label key={k}>{l}<input name={k} type={k==='dob'?'date':'text'} value={form[k]} onChange={change} readOnly={k==='email'}/></label>)}</div><button className="primary">Save Profile</button></form></section></>
}
