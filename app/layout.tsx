import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata={title:'Noble Public School Dadu | Student Portal',description:'Secure student and parent portal for Noble Public School Dadu'};

export default function RootLayout({children}:{children:React.ReactNode}){
  const config={
    url:process.env.NEXT_PUBLIC_SUPABASE_URL||'',
    key:process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||''
  };
  return <html lang="en"><body><script dangerouslySetInnerHTML={{__html:`window.__NPSD_SUPABASE__=${JSON.stringify(config)};`}} />{children}</body></html>
}
