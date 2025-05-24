import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Do4BTC',
  description: 'Bitcoin Lightning Network Integration Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-gray-50`}>
        {children}
        <footer className="w-full bg-black py-3 px-2 text-center fixed bottom-0 left-0 z-50 border-t border-black">
          <Link href="/contact" className="text-lg text-orange-400 underline font-bold hover:text-orange-300 transition">
            Contact Information
          </Link>
        </footer>
      </body>
    </html>
  )
} 