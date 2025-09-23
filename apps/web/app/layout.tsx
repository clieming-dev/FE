import "./globals.css";
import { SafeArea } from "@/shared/components";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SafeArea />
        {children}
      </body>
    </html>
  );
}
