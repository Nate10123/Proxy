import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'Drift — A new window to the web',description:'A personal web proxy for reading public pages.'};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body>{children}</body></html>}
