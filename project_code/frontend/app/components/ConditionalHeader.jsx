"use client";
import { usePathname } from "next/navigation";

export default function ConditionalHeader() {
  const pathname = usePathname();

  if (pathname.includes('Score')) {
    return null;
  }

  if (pathname.startsWith('/Student')) {
    return (
        <header className="bg-white flex items-center justify-between px-10 py-4">
            <img src="/logo2.png" alt="Logo"/>
            <img src="/profile.png" alt="Profile"/>
        </header>
    )
  }
  if (pathname.startsWith('/Instructor')) {
    return (
        <header className="bg-white flex items-center justify-between px-10 py-4">
            <img src="/logo2.png" alt="Logo"/>
            <img src="/profile.png" alt="Profile"/>
        </header>
    )
  }
  if (pathname.startsWith('/LoginPage')) {
    return (
        <header className="bg-purple-100 px-10 py-4">
            <img src="/logo2.png" alt="Logo" className=""/>
        </header>
    )
  }
  
  return (
    <header className="bg-white px-10 py-4">
      <img src="/logo2.png" alt="Logo"/>
    </header>
  );
}
