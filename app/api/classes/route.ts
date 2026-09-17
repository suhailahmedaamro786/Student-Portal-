import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return NextResponse.json({ error: 'Server Supabase configuration is missing.' }, { status: 500 });
  }

  const admin = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await admin
    .from('classes')
    .select('id,name,section,academic_year');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const classes = [...(data || [])].sort((a, b) => {
    const aNumber = Number((a.name || '').match(/\d+/)?.[0]);
    const bNumber = Number((b.name || '').match(/\d+/)?.[0]);
    const aHasNumber = Number.isFinite(aNumber);
    const bHasNumber = Number.isFinite(bNumber);

    if (aHasNumber && bHasNumber && aNumber !== bNumber) return aNumber - bNumber;
    if (aHasNumber !== bHasNumber) return aHasNumber ? 1 : -1;

    return `${a.name} ${a.section}`.localeCompare(`${b.name} ${b.section}`, undefined, {
      numeric: true,
      sensitivity: 'base',
    });
  });

  return NextResponse.json({ classes });
}
