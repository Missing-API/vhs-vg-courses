import type { Metadata } from 'next';
import 'swagger-ui-react/swagger-ui.css';
import packageJson from '../../package.json' assert { type: 'json' };

export const metadata: Metadata = {
  title: packageJson.name + ' - Swagger',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
