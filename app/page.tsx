'use client';
import {useEffect,useState} from 'react';
import {supabase} from '../lib/supabase';

export default function Home(){
 const [user,setUser]=useState<any>(null);const [loading,setLoading]=useState(true);
 useEffect(()=>{supabase().auth.getUser().then(({data})=>{setUser(data.user);setLoading(false)})},[]);
 if(loading)return <main className="wrap"><div className="card login"><p>Loading portal...</p></div></main>;
 if(!user)return <Login/>;
 return <main className="wrap"><div className="nav"><div><div className="brand">🏫 Noble Public School Dadu</div><div className="muted">Student / Parent Portal</div></div><button className="btn" onClick={()=>supabase().auth.signOut().then(()=>location.reload())}>Logout</button></div><div className="card"><h2>Welcome back</h2><p className="muted">{user.email}</p><span className="badge">Signed in</span></div><div className="grid section"><Stat title="Attendance" value="—"/><Stat title="Latest Result" value="—"/><Stat title="Overall Performance" value="—"/><Stat title="Announcements" value="0"/></div><div className="card section"><div className="row"><h2>Student / Parent Portal</h2><span className="badge">Secure RLS</span></div><p className="muted">Your attendance, exams, results, performance and announcements will appear here after the account is linked by the school admin.</p></div></main>
}
function Stat({title,value}:{title:string,value:string}){return <div className="card"><div className="muted">{title}</div><div className="stat">{value}</div></div>}
function Login(){
 const [email,setEmail]=useState('');const [password,setPassword]=useState('');const [error,setError]=useState('');const [busy,setBusy]=useState(false);
 async function submit(e:any){e.preventDefault();setError('');setBusy(true);const s=supabase();const {data,error:authError}=await s.auth.signInWithPassword({email:email.trim().toLowerCase(),password});if(authError){setBusy(false);setError('Invalid email or password. Please use the Student/Parent account credentials provided by the school.');return}const {data:profile,error:profileError}=await s.from('profiles').select('approved,role').eq('id',data.user.id).maybeSingle();if(profileError||!profile?.approved||!['student','parent'].includes(profile.role)){await s.auth.signOut();setBusy(false);setError('Access Denied: your account is not approved for the Student / Parent Portal. Please contact the school admin.');return}location.reload()}
 return <main className="wrap"><div className="card login"><h1>Noble Public School Dadu</h1><p className="muted">Student / Parent Portal</p><form onSubmit={submit}><label>Email</label><input className="input" type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="student@example.com or parent@example.com"/><label>Password</label><input className="input" type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your password"/>{error&&<div className="alert">{error}</div>}<button className="btn full" type="submit" disabled={busy}>{busy?'Checking account...':'Login'}</button></form><p className="muted">Only school-approved Student and Parent accounts can access this portal.</p></div></main>
}
