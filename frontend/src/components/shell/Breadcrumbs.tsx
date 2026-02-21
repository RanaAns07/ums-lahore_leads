"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import React from "react";

export function Breadcrumbs() {
    const pathname = usePathname();
    const paths = pathname.split("/").filter((path) => path);

    if (paths.length === 0) return null;

    return (
        <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
                <li className="inline-flex items-center">
                    <span className="text-sm font-medium text-muted-foreground">Home</span>
                </li>
                {paths.map((path, index) => {
                    const href = `/${paths.slice(0, index + 1).join("/")}`;
                    const isLast = index === paths.length - 1;
                    const title = path.charAt(0).toUpperCase() + path.slice(1);

                    return (
                        <li key={path}>
                            <div className="flex items-center">
                                <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />
                                {isLast ? (
                                    <span className="text-sm font-medium text-foreground" aria-current="page">
                                        {title}
                                    </span>
                                ) : (
                                    <Link href={href} className="text-sm font-medium text-muted-foreground hover:text-foreground">
                                        {title}
                                    </Link>
                                )}
                            </div>
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
