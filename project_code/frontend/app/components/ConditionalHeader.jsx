"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";

const ROLE_STORAGE_KEY = "role";

export default function ConditionalHeader() {
  const pathname = usePathname();
  const router = useRouter();

  const role = useMemo(() => {
    if (typeof window === "undefined") return "student";
    const stored = window.localStorage.getItem(ROLE_STORAGE_KEY);
    return stored === "instructor" ? "instructor" : "student";
  }, []);

  const handleProfileClick = () => {
    const destination = role === "instructor" ? "/Instructor" : "/Student/chat";
    router.push(destination);
  };

  if (pathname.includes("Score")) {
    return null;
  }

  const renderHeader = (backgroundClass = "bg-white") => (
    <header className={`${backgroundClass} flex items-center justify-between px-10 py-4`}>
      <Link href="/" className="flex items-center gap-3">
        <Image src="/logo2.png" alt="Learn LLM" width={230} height={150} priority />
      </Link>
      <button
        onClick={handleProfileClick}
        className="flex items-center gap-3"
        aria-label="Open account home"
      >
        <Image
          src="/profile.png"
          alt="Account"
          width={150}
          height={150}
          priority
        />
      </button>
    </header>
  );

  if (pathname.startsWith("/Student")) {
    return renderHeader();
  }

  if (pathname.startsWith("/Instructor")) {
    return renderHeader();
  }

  if (pathname.startsWith("/LoginPage")) {
    return renderHeader("bg-purple-100");
  }

  return renderHeader();
}
