import "./globals.css";
import ConditionalHeader from "./components/ConditionalHeader";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <ConditionalHeader />
        <main className="mx-auto max-w-5xl p-4">{children}</main>
      </body>
    </html>
  );
}