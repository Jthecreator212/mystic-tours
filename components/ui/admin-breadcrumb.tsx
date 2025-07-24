"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./breadcrumb";
import React from "react";

const labelMap: Record<string, string> = {
  "mt-operations": "Dashboard",
  "tours": "Tours",
  "bookings": "Bookings",
  "images": "Images",
  "customers": "Customers",
  "finances": "Finances",
  "settings": "Settings",
};

export default function AdminBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname
    .replace(/^\//, "")
    .split("/")
    .filter(Boolean);

  // Only show breadcrumbs for subpages (not just /mt-operations)
  if (segments.length <= 1) return null;

  let path = "";

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        {segments.map((seg, i) => {
          path += "/" + seg;
          const isLast = i === segments.length - 1;
          const label = labelMap[seg] || seg.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
          return (
            <React.Fragment key={path}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="text-[#d83f31] font-bold">{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild className="text-[#1a5d1a] hover:text-[#e9b824] font-semibold">
                    <Link href={path}>{label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && (
                <BreadcrumbSeparator key={path + "-sep"}>
                  <span className="text-[#e9b824]">›</span>
                </BreadcrumbSeparator>
              )}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
} 