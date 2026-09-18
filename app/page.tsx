'use client';
import {useEffect,useMemo,useState} from 'react';
import {QRCodeSVG} from 'qrcode.react';
import {supabase} from '../lib/supabase';

type Child={id:string;student_id:string;full_name:string;father_name?:string|null;photo_url?:string|null;class_id?:string|null;className?:string};
const empty={full_name:'',father_name:'',guardian_name:'',dob:'',gender:'',cnic:'',guardian_cnic:'',phone:'',whatsapp:'',email:'',address:'',city:'Dadu',admission_session:'2026-27',class_id:'',section:'',previous_school:'',previous_class:'',admission_date:'',photo_url:'',emergency_name:'',emergency_phone:'',relationship:'',notes:'',password:'',confirm_password:''};
export default function Home(){const [view,setView]=useState<'home'|'register'|'status'|'login'|'portal'>('home');const [session,setSession]=useState<any>(null);const [checking,setChecking]=useState(true);useEffect(()=>{const s=supabase();s.auth.getUser().then(async({data})=>{if(data.user){const {data:p}=await s.from('profiles').select('approved,role,full_name').eq('id',data.user.id).maybeSingle();if(p?.approved&&p.role === 'student'){setSession({...data.user,role:p.role,full_name:p.full_name});setView('portal')}}setChecking(false)});const {data:l}=s.auth.onAuthStateChange(()=>{});return()=>l.subscription.unsubscribe()},[]);if(checking)return <main className="shell"><div className="loaderCard">Loading NPSD Portal…</div></main>;if(view==='portal'&&session)return <Dashboard user={session}/>;return <main className="shell">{view==='home'&&<HomeView go={setView}/>} {view==='register'&&<Registration go={setView}/>} {view==='status'&&<Status go={setView}/>} {view==='login'&&<Login onSuccess={(u:any)=>{setSession(u);setView('portal')}} go={setView}/>}</main>}
function HomeView({go}:{go:any}){return <div className="hero"><div className="heroCard"><div className="logo">NPSD</div><span className="eyebrow">Noble Public School Dadu</span><h1>Student Portal</h1><p>Apply for portal access, track your admission request, and securely access your school records after approval.</p><div className="entryGrid"><button className="entryCard" onClick={()=>go('login')}><span>🎓</span><b>Existing / Enrolled Student</b><small>Already enrolled? Open your Student Portal.</small><strong>Login →</strong></button><button className="entryCard" onClick={()=>go('register')}><span>📝</span><b>New Admission</b><small>Apply for portal access and track your application.</small><strong>Apply Now →</strong></button></div><button className="statusLink" onClick={()=>go('status')}>Already applied? Check admission status →</button><div className="steps"><span>01 Registration</span><span>02 Admin Approval</span><span>03 CNIC Verification</span><span>04 Portal</span></div></div><div className="featureGrid"><Feature icon="🪪" t="Digital Student Card" d="View and print your official portal card."/><Feature icon="📊" t="Results & Performance" d="See published marks, grades and progress."/><Feature icon="📅" t="Attendance" d="Track daily attendance and percentage."/><Feature icon="🔐" t="Secure Access" d="Approval and row-level data isolation."/></div></div>}
function Feature({icon,t,d}:{icon:string;t:string;d:string}){return <div className="feature"><b>{icon} {t}</b><p>{d}</p></div>}
function Registration({go}:{go:any}){
 const [form,setForm]=useState<any>({full_name:'',father_name:'',cast:'',dob:'',gender:'',cnic:'',class_id:'',password:'',confirm_password:''});
 const [photo,setPhoto]=useState<File|null>(null); const [classes,setClasses]=useState<any[]>([]); const [busy,setBusy]=useState(false); const [error,setError]=useState(''); const [done,setDone]=useState<any>(null);
 useEffect(()=>{fetch('/api/classes',{cache:'no-store'}).then(r=>r.json()).then(j=>setClasses(j.classes||[])).catch(()=>setClasses([]))},[]);
 const set=(k:string,v:string)=>setForm((x:any)=>({...x,[k]:v}));
 async function submit(e:any){e.preventDefault();setError('');
  if(form.password!==form.confirm_password)return setError('Passwords do not match.');
  if(!/^\\d{13}$/.test(form.cnic))return setError('CNIC / B-Form must be exactly 13 digits.');
  if(!form.class_id)return setError('Please select a class.');
  setBusy(true);
  try{const fd=new FormData(); Object.entries(form).forEach(([k,v])=>fd.append(k,String(v??''))); if(photo)fd.append('photo',photo);
   const r=await fetch('/api/register',{method:'POST',body:fd}); const j=await r.json(); if(!r.ok)throw new Error(j.error||'Registration failed.'); setDone(j); setForm({full_name:'',father_name:'',cast:'',dob:'',gender:'',cnic:'',class_id:'',password:'',confirm_password:''}); setPhoto(null);
  }catch(err:any){setError(err.message)}finally{setBusy(false)}
 }
 if(done)return <div className="centerCard"><div className="successIcon">✓</div><span className="eyebrow">APPLICATION SUBMITTED</span><h1>Admission request received</h1><p>Your request is now waiting for school administration review.</p><div className="requestBox"><span>Student ID / Roll No</span><strong>{done.student_id}</strong><span>Request ID</span><strong>{done.request_id}</strong><span>Tracking Token</span><strong>{done.tracking_token}</strong></div><p className="muted">Save your Student ID and Tracking Token. After approval, login with your CNIC and password.</p><button className="primary" onClick={()=>go('status')}>Check Status</button></div>;
 return <div className="formShell"><div className="formTop"><button className="back" onClick={()=>go('home')}>← Back</button><span className="eyebrow">NEW ADMISSION</span><h1>Student Admission Form</h1><p>Simple registration. Enter accurate information for your admission record and student card.</p></div>
 <form onSubmit={submit} className="formCard"><SectionTitle t="Student Information"/>
 <div className="grid2"><Field l="Student Name *" v={form.full_name} set={set} k="full_name" placeholder="Full name"/><Field l="Father Name *" v={form.father_name} set={set} k="father_name" placeholder="Father name"/>
 <Field l="Cast *" v={form.cast} set={set} k="cast" placeholder="Cast / Biradari"/><Select l="Class *" v={form.class_id} set={set} k="class_id" opts={classes.map(c=>({value:c.id,label:`${String(c.name).replace(/^Class\\s*/i,'')} — ${c.section}`}))}/>
 <Field l="CNIC / B-Form *" v={form.cnic} set={set} k="cnic" placeholder="Exactly 13 digits" inputMode="numeric" maxLength={13}/><Field l="Date of Birth *" type="date" v={form.dob} set={set} k="dob"/>
 <Select l="Gender *" v={form.gender} set={set} k="gender" opts={['Male','Female','Other']}/><Field l="Password *" type="password" v={form.password} set={set} k="password" placeholder="Minimum 8 characters"/>
 <Field l="Confirm Password *" type="password" v={form.confirm_password} set={set} k="confirm_password" placeholder="Repeat password"/></div>
 <label className="photoUpload">Student Photo *<input type="file" accept="image/jpeg,image/png,image/webp" required onChange={e=>setPhoto(e.target.files?.[0]||null)}/><small>{photo?photo.name:'JPG, PNG or WebP — max 2 MB'}</small></label>
 {error&&<div className="error">{error}</div>}<div className="summary"><b>Before submitting</b><p>One CNIC can only be registered once. If this CNIC is already used, the system will stop duplicate applications.</p><p>After approval: <strong>CNIC + Password → Student Portal → Digital Card</strong></p></div>
 <div className="formActions"><button type="submit" className="primary" disabled={busy}>{busy?'Submitting…':'Submit Admission Request'}</button></div></form></div>
}
function Step({n,t,active,done}:{n:string;t:string;active:boolean;done:boolean}){return <div className={`step ${active?'active':''} ${done?'done':''}`}><b>{done?'✓':n}</b><span>{t}</span></div>}
function SectionTitle({t}:{t:string}){return <div className="sectionTitle"><h2>{t}</h2></div>}
function Field({l,v,set,k,type='text',placeholder='',inputMode}:any){return <label>{l}<input type={type} value={v} placeholder={placeholder} inputMode={inputMode} required={l.includes('*')} onChange={e=>set(k,e.target.value)} /></label>}
function Select({l,v,set,k,opts}:any){return <label>{l}<select value={v} required={l.includes('*')} onChange={e=>set(k,e.target.value)}><option value="">Select…</option>{opts.map((o:any)=><option key={typeof o==='string'?o:o.value} value={typeof o==='string'?o:o.value}>{typeof o==='string'?o:o.label}</option>)}</select></label>}
function Status({go}:{go:any}){const [id,setId]=useState('');const [token,setToken]=useState('');const [data,setData]=useState<any>(null);const [error,setError]=useState('');async function check(e:any){e.preventDefault();setError('');const r=await fetch('/api/request-status',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({request_id:id,tracking_token:token})});const j=await r.json();if(!r.ok)setError(j.error||'Request not found.');else setData(j)}return <div className="centerCard"><button className="back" onClick={()=>go('home')}>← Back</button><span className="eyebrow">Application Tracker</span><h1>Check Request Status</h1><p>Enter the Request ID and tracking token from your registration confirmation.</p><form onSubmit={check}><Field l="Request ID *" v={id} set={(_:any,v:string)=>setId(v)} k=""/><Field l="Tracking Token *" v={token} set={(_:any,v:string)=>setToken(v)} k=""/>{error&&<div className="error">{error}</div>}<button className="primary full" type="submit">Check Status</button></form>{data&&<div className="statusResult"><span className={`status ${data.status}`}>{data.status}</span><h2>{data.student_id}</h2><p>{data.full_name} • {data.class_name||'Class pending'}</p><p>{data.status==='approved'?'Your portal access is approved. Use CNIC + password to login.':data.status==='rejected'?'Please contact the school administration.':'Your application is still under admin review.'}</p>{data.status==='approved'&&<button className="primary" onClick={()=>go('login')}>Continue to Verification</button>}</div>}</div>}
function Login({onSuccess,go}:{onSuccess:any;go:any}){const [cnic,setCnic]=useState('');const [password,setPassword]=useState('');const [busy,setBusy]=useState(false);const [error,setError]=useState('');
 async function submit(e:any){e.preventDefault();setBusy(true);setError('');try{const r=await fetch('/api/cnic-login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({cnic,password})});const j=await r.json();if(!r.ok)throw new Error(j.error||'Verification failed.');const s=supabase();const {error:e2}=await s.auth.setSession(j.session);if(e2)throw e2;const {data:u}=await s.auth.getUser();if(!u.user)throw new Error('Unable to verify the signed-in account.');const {data:p}=await s.from('profiles').select('role,full_name,approved').eq('id',u.user.id).maybeSingle();if(!p?.approved||p.role!=='student')throw new Error('Student account is not approved.');onSuccess({...u.user,role:p.role,full_name:p.full_name})}catch(e:any){setError(e.message)}finally{setBusy(false)}}
 return <div className="centerCard"><button className="back" onClick={()=>go('home')}>← Back</button><span className="eyebrow">STUDENT LOGIN</span><h1>Welcome back</h1><p>Enter your CNIC / B-Form and password after admin approval.</p><form onSubmit={submit}><Field l="CNIC / B-Form *" v={cnic} set={(_:any,v:string)=>setCnic(v)} k="" inputMode="numeric" maxLength={13}/><Field l="Password *" type="password" v={password} set={(_:any,v:string)=>setPassword(v)} k=""/>{error&&<div className="error">{error}</div>}<button className="primary full" disabled={busy}>{busy?'Signing in…':'Open Student Portal'}</button></form><p className="muted">New student? <button className="textBtn" onClick={()=>go('register')}>Apply for admission</button> · <button className="textBtn" onClick={()=>go('status')}>Check status</button></p></div>}
function Dashboard({user}:{user:any}){
 const [dark,setDark]=useState(false);
 const [children,setChildren]=useState<Child[]>([]);
 const [selected,setSelected]=useState('');
 const [attendance,setAttendance]=useState<any[]>([]);
 const [results,setResults]=useState<any[]>([]);
 const [announcements,setAnnouncements]=useState<any[]>([]);
 const [loading,setLoading]=useState(true);

 async function loadChild(id:string){
  const s=supabase();
  const [a,r,n]=await Promise.all([
   s.from('attendance').select('attendance_date,status').eq('student_id',id).order('attendance_date',{ascending:false}).limit(31),
   s.from('results').select('marks_obtained,total_marks,grade,position,pass,exams(name,exam_date)').eq('student_id',id).eq('published',true).order('id',{ascending:false}).limit(50),
   s.from('announcements').select('id,title,body,published_at').eq('published',true).order('published_at',{ascending:false}).limit(5)
  ]);
  setAttendance(a.data||[]);
  setResults(r.data||[]);
  setAnnouncements(n.data||[]);
  setLoading(false);
 }

 async function load(){
  const s=supabase();
  const {data}=await s.from('students').select('id,student_id,full_name,father_name,photo_url,class_id,classes(name,section)').eq('user_id',user.id).maybeSingle();
  const list:Child[] = data ? [{
   ...data,
   className:(data as any).classes
    ? String((data as any).classes.name).replace(/^Class\\s*/i,'')+' / '+String((data as any).classes.section)
    : ''
  }] : [];
  setChildren(list);
  if(list[0]){
   setSelected(list[0].id);
   await loadChild(list[0].id);
  }else{
   setLoading(false);
  }
 }

 useEffect(()=>{void load()},[user.id]);

 const child=children.find(c=>c.id===selected);
 if(loading)return <main className="shell"><div className="loaderCard">Loading student portal…</div></main>;

 return <main className={"shell "+(dark?'themeDark':'')}>
  <div className="portalShell">
   <header className="portalHeader">
    <div>
     <span className="eyebrow">NPSD Student Portal</span>
     <h1>Welcome, {user.full_name||child?.full_name||'Student'}</h1>
     <p>{child?.student_id} • {child?.className||'Class'}</p>
    </div>
    <div className="navActions">
     <button className="themeBtn" onClick={()=>setDark(!dark)}>{dark?'☀️':'🌙'} Theme</button>
     <button className="secondary" onClick={()=>supabase().auth.signOut().then(()=>location.reload())}>Sign out</button>
    </div>
   </header>
   <div className="portalGrid">
    <section className="portalCard">
     <h2>Student Profile</h2>
     {child?.photo_url&&<img src={child.photo_url} alt="Student" className="studentPhoto"/>}
     <p><b>Name:</b> {child?.full_name}</p>
     <p><b>Student ID:</b> {child?.student_id}</p>
     <p><b>Father:</b> {child?.father_name||'—'}</p>
     <p><b>Class:</b> {child?.className||'—'}</p>
    </section>
    <section className="portalCard cardPanel">
     <h2>Digital Student Card</h2>
     <div className="studentCardPreview printCard">
      <div className="cardTop">
       <div><div className="cardLogo">NPSD</div><small>NOBLE PUBLIC SCHOOL DADU</small></div>
       <span>STUDENT ID CARD</span>
      </div>
      <div className="cardBody">
       <div className="cardPhoto">{child?.photo_url?<img src={child.photo_url} alt="Student"/>:'🎓'}</div>
       <div className="cardInfo">
        <h2>{child?.full_name}</h2>
        <p><b>Student ID</b><span>{child?.student_id}</span></p>
        <p><b>Class / Section</b><span>{child?.className||'—'}</span></p>
        <p><b>Father</b><span>{child?.father_name||'—'}</span></p>
        <p><b>Status</b><span>ENROLLED</span></p>
       </div>
       <div className="qrBox"><QRCodeSVG value={child?.student_id||''} size={126} level="H" includeMargin/><small>SCAN FOR ATTENDANCE</small></div>
      </div>
      <div className="cardFooter"><span>Official Student Card</span><span>NPSD · 2026–27</span></div>
     </div>
     <button className="primary" onClick={()=>window.print()}>🖨️ Print / Save PDF</button>
    </section>
    <section className="portalCard">
     <h2>Attendance</h2>
     <p>{attendance.filter(a=>a.status==='present').length} present records in recent history.</p>
     {attendance.slice(0,7).map((a,i)=><p key={i}>{a.attendance_date} — <b>{a.status}</b></p>)}
    </section>
    <section className="portalCard">
     <h2>Results</h2>
     {results.length ? results.slice(0,8).map((r,i)=><p key={i}>{(r.exams as any)?.name||'Exam'} — {r.marks_obtained}/{r.total_marks} — {r.grade||'—'}</p>) : <p className="muted">No published results yet.</p>}
    </section>
    <section className="portalCard">
     <h2>Announcements</h2>
     {announcements.length ? announcements.map(a=><div key={a.id}><b>{a.title}</b><p>{a.body}</p></div>) : <p className="muted">No announcements.</p>}
    </section>
   </div>
  </div>
 </main>;
}
