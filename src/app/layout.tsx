import type { Metadata } from 'next';
import { Open_Sans, Poppins } from 'next/font/google';
import './globals.css';

const headingFont = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const bodyFont = Open_Sans({
  variable: '--font-open-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'EduSphere ERP | School operations',
  description: 'A connected workspace for independent school communities.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${headingFont.variable} ${bodyFont.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
