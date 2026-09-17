import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Noble Public School Dadu | Student Portal',
  description: 'Secure student and parent portal for Noble Public School Dadu',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
