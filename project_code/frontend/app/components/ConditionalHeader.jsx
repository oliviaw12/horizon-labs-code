"use client";
import { usePathname } from "next/navigation";

export default function ConditionalHeader() {
  const pathname = usePathname();

  if (pathname.startsWith('/Student')) {
    return (
        <header className="bg-white relative h-16 flex items-center justify-between px-10 mt-10">
            <img src="/logo2.png" alt="Logo"/>
            <img src="/profile.png" alt="Profile"/>
        </header>
    )
  }
  
  return (
    <header className="border-b bg-white">
      <img src="/logo2.png" alt="Logo" style={{ float: "left" }}/>
    </header>
  );
}
