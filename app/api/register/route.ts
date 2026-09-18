import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createHash, randomUUID } from 'crypto';

const clean=(v:unknown)=>String(v??'').trim();
const digits=(v:unknown)=>clean(v).replace(/\D/g,'');
const hash=(v:string)=>createHash('sha256').update(v.toLowerCase()).digest('hex');

function db(){const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!url||!key)throw new Error('Server Supabase configuration is missing.');return createClient(url,key,{auth:{autoRefreshToken:false,persistSession:false}})}

export async function POST(req:Request){
 try{
  const form=await req.formData();
  const b:any=Object.fromEntries(form.entries());
  const required=['full_name','father_name','cast','dob','gender','cnic','class_id','password'];
  for(const k of required)if(!clean(b[k]))return NextResponse.json({error:`${k.replaceAll('_',' ')} is required.`},{status:400});
  const cnic=digits(b.cnic);
  if(!/^\d{13}$/.test(cnic))return NextResponse.json({error:'CNIC / B-Form must contain exactly 13 digits.'},{status:400});
  if(clean(b.password).length<8)return NextResponse.json({error:'Password must be at least 8 characters.'},{status:400});
  const photo=form.get('photo');
  if(!(photo instanceof File))return NextResponse.json({error:'Student photo is required.'},{status:400});
  if(photo.size>2*1024*1024)return NextResponse.json({error:'Student photo must be 2 MB or smaller.'},{status:400});
  if(!['image/jpeg','image/png','image/webp'].includes(photo.type))return NextResponse.json({error:'Photo must be JPG, PNG or WebP.'},{status:400});
  const s=db(), cnicHash=hash(cnic);
  const {data:existing,error:existingError}=await s.from('access_requests').select('id,status,student_id').eq('cnic_hash',cnicHash).maybeSingle();
  if(existingError)throw existingError;
  if(existing)return NextResponse.json({error:`CNIC already used. Existing application: ${existing.student_id} (${existing.status}).`},{status:409});
  const {data:existingStudent,error:studentError}=await s.from('students').select('student_id').eq('cnic_hash',cnicHash).maybeSingle();
  if(studentError)throw studentError;
  if(existingStudent)return NextResponse.json({error:`CNIC already used by enrolled student ${existingStudent.student_id}.`},{status:409});
  const requestId=randomUUID(), internalEmail=`student-${requestId}@npsd.invalid`;
  const {data:u,error:ue}=await s.auth.admin.createUser({email:internalEmail,password:clean(b.password),email_confirm:true,user_metadata:{full_name:clean(b.full_name),role:'student'}});
  if(ue||!u.user)throw ue||new Error('Unable to create secure account.');
  let photoUrl:string|null=null;
  try{
   const ext=photo.type==='image/png'?'png':photo.type==='image/webp'?'webp':'jpg';
   const path=`admissions/${requestId}.${ext}`;
   const bytes=new Uint8Array(await photo.arrayBuffer());
   const up=await s.storage.from('student-photos').upload(path,bytes,{contentType:photo.type,upsert:false});
   if(up.error)throw up.error;
   const pub=s.storage.from('student-photos').getPublicUrl(path);
   photoUrl=pub.data.publicUrl;
   const token=randomUUID()+randomUUID();
   const payload={auth_user_id:u.user.id,tracking_token:token,full_name:clean(b.full_name),father_name:clean(b.father_name),student_cast:clean(b.cast),dob:b.dob,gender:clean(b.gender),cnic:cnic,cnic_hash:cnicHash,guardian_cnic_hash:cnicHash,class_id:b.class_id,photo_url:photoUrl,status:'pending'};
   const {data:r,error:re}=await s.from('access_requests').insert(payload).select('id,student_id,tracking_token').single();
   if(re)throw re;
   await s.from('profiles').upsert({id:u.user.id,full_name:clean(b.full_name),email:internalEmail,role:'student',approved:false},{onConflict:'id'});
   return NextResponse.json({request_id:r.id,student_id:r.student_id,tracking_token:r.tracking_token});
  }catch(err){
   await s.auth.admin.deleteUser(u.user.id);
   if(photoUrl){const path=photoUrl.split('/student-photos/')[1];if(path)await s.storage.from('student-photos').remove([path]);}
   throw err;
  }
 }catch(e:any){return NextResponse.json({error:e?.message||'Registration failed.'},{status:500})}
}