import "./globals.css";
import ConditionalHeader from "./components/ConditionalHeader";
import ConditionalBody from "./components/ConditionalBody";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <ConditionalBody>
        <ConditionalHeader />
        {children}
      </ConditionalBody>
    </html>
  );
}