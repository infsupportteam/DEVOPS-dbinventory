import "./globals.css";

export const metadata = {
  title: "SOCAN Database Inventory",
  description: "SOCAN Database Inventory",
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
