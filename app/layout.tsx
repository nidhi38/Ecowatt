import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Providers } from '@/components/providers'
import { Navigation } from '@/components/navigation'
import { BlockchainStatusPanel } from '@/components/blockchain-status-panel'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'EcoWatt - Peer-to-Peer Energy Trading',
  description: 'Decentralized P2P energy marketplace powered by Ethereum blockchain. Trade renewable energy with transparent pricing and blockchain settlement.',
  icons: {
    icon: '/favicon.svg',
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className="font-sans antialiased flex flex-col min-h-screen">
        <Providers>
          <Navigation />
          <div className="flex-1">
            {children}
          </div>
          <footer className="border-t border-secondary/20 bg-card/50 backdrop-blur-sm p-4">
            <div className="max-w-7xl mx-auto">
              <BlockchainStatusPanel />
            </div>
          </footer>
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </Providers>
      </body>
    </html>
  )
}
