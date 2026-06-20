import type { Metadata, Viewport } from 'next'
import './globals.css'
import BottomNav from '@/components/BottomNav'
import SplashScreen from '@/components/SplashScreen'

export const metadata: Metadata = {
  title: 'Do Young — ดูยัง?',
  description: 'your watched shelf',
  applicationName: 'Do Young',
  appleWebApp: {
    capable: true,
    title: 'Do Young',
    statusBarStyle: 'black-translucent',
  },
  formatDetection: { telephone: false },
}

export const viewport: Viewport = {
  themeColor: '#0D0D0D',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const themeScript = `(function(){try{var t=localStorage.getItem('dy:theme');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t)}else{document.documentElement.setAttribute('data-theme','dark')}}catch(e){document.documentElement.setAttribute('data-theme','dark')}})();`
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body suppressHydrationWarning>
        <SplashScreen />
        <main className="max-w-lg mx-auto min-h-dvh pb-[calc(5rem+env(safe-area-inset-bottom))] px-4">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  )
}
