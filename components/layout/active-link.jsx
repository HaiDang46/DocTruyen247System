"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function ActiveLink({
  href,
  checkQuery = false,
  className = "",
  activeClassName = "",
  children,
}) {
  const pathname = usePathname();
  const [currentQuery, setCurrentQuery] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentQuery(window.location.search);
    }
  }, [pathname]);

  const isActive = checkQuery
    ? href.includes("?")
      ? pathname === href.split("?")[0] &&
        currentQuery.includes(href.split("?")[1])
      : pathname === href && !currentQuery.includes("type=")
    : href === "/"
      ? pathname === "/"
      : pathname.startsWith(href);

  const combinedClassName =
    `${className} ${isActive ? activeClassName : ""}`.trim();

  return (
    <Link href={href} className={combinedClassName}>
      {children}
    </Link>
  );
}
