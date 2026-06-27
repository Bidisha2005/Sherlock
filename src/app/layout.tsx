// src/app/layout.tsx

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PBL Program Intelligence & Grant Reporting Assistant',
  description: 'Monitor PBL implementation and generate grant reports',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-8">
                <h1 className="text-xl font-bold text-blue-600">
                  PBL Intelligence
                </h1>
                <div className="flex space-x-4">
                  <a href="/" className="text-gray-700 hover:text-blue-600">
                    Dashboard
                  </a>
                  <a href="/dashboard" className="text-gray-700 hover:text-blue-600">
                    Program Review
                  </a>
                  <a href="/grant-report" className="text-gray-700 hover:text-blue-600">
                    Grant Reports
                  </a>
                </div>
              </div>
            </div>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}