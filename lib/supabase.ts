import {createBrowserClient} from '@supabase/ssr';

export function supabase(){
  const runtime=typeof window!=='undefined'?(window as any).__NPSD_SUPABASE__:{ };
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL||runtime?.url;
  const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||runtime?.key;
  if(!url||!key)throw new Error('Supabase configuration is unavailable. Please redeploy after setting NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in Netlify.');
  return createBrowserClient(url,key);
}
