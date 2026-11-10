import{NavLink,Outlet,useNavigate}from'react-router-dom';
import{useAuth}from'../context/AuthContext.jsx';
export default function Layout(){
 const{session,logout}=useAuth(),nav=useNavigate(),isAdmin=session?.role==='admin';
 return <div className="shell"><aside className="sidebar"><div className="brand"><span className="brand-icon">$</span><b><i>Money</i> Matters</b></div><nav>
 <NavLink to="/">▣　Dashboard</NavLink>
 <NavLink to="/transactions">▤　{isAdmin?'All Transactions':'Transactions'}</NavLink>
 <NavLink to="/profile">♙　Profile</NavLink>
 </nav><div className="side-bottom"><span>{isAdmin?'Administrator':'My Account'}</span><button className="link" onClick={()=>{logout();nav('/login')}}>↪ Logout</button></div></aside><main className="main"><Outlet/></main></div>
}
