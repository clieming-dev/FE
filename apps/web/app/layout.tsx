import "./globals.css";
import SafeAreaVars from "@/shared/SafeAreaVars";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SafeAreaVars />
        {children}
      </body>
    </html>
  );
}
