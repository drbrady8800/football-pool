"use client";
import React from "react";
import { useRouter } from "next/navigation";

import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

interface CarderHeaderWithLinkProps {
  title: string;
  description?: string;
  href: string;
}

export default function CarderHeaderWithLink({ 
  title,
  description,
  href,
}: CarderHeaderWithLinkProps) {
  const router = useRouter();

  return (
    <CardHeader
      className="cursor-pointer group"
      onClick={() => router.push(href)}
    >
      <div className="flex items-center">
        <div className="flex flex-col gap-1.5">
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        <ArrowRight 
          className={'w-6 h-6 transition-all duration-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-4'} 
        />
      </div>
    </CardHeader>
  );
}