import {NextResponse} from 'next/server';
import {createClient} from '@supabase/supabase-js';

export async function GET(){
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!url||!key)return NextResponse.json({error:'Server Supabase configuration is missing.'},{status:500});
  const admin=createClient(url,key,{auth:{autoRefreshToken:false,persistSession:false}});
  const {data,error}=await admin.from('classes').select('id,name,section,academic_year').order('name').order('section');
  if(error)return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({classes:data||[]});
}
