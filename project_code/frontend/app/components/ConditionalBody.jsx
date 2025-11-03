"use client";
import { usePathname } from "next/navigation";

export default function ConditionalBody({ children }) {
  const pathname = usePathname();
  
  if (pathname.startsWith('/LoginPage')) {
    return (
      <body className="min-h-screen bg-purple-100">
        {children}
      </body>
    );
  }
  
  // Default layout for other pages
  return (
    <body className="min-h-screen bg-gray-50">
      {children}
    </body>
  );
}
