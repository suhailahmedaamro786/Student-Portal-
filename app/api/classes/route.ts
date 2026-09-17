import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return NextResponse.json({ error: 'Server Supabase configuration is missing.' }, { status: 500 });
  }

  const admin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data, error } = await admin
    .from('classes')
    .select('id,name,section,academic_year');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const classes = (data || []).sort((a, b) => {
    const aNum = Number(String(a.name).replace(/^Class\s*/i, ''));
    const bNum = Number(String(b.name).replace(/^Class\s*/i, ''));
    if (Number.isFinite(aNum) && Number.isFinite(bNum) && aNum !== bNum) return aNum - bNum;
    return String(a.name).localeCompare(String(b.name), undefined, { numeric: true, sensitivity: 'base' }) ||
      String(a.section || '').localeCompare(String(b.section || ''));
  });

  return NextResponse.json({ classes });
}
