"use client";

import Link from "next/link";
import { Poppins } from "next/font/google";

import { cn } from "@/lib/utils";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

const font = Poppins({ 
    weight: "600", 
    subsets: ["latin"] 
});

export const Navbar = () => {
    return (
        <div className="fixed w-full z-50 flex justify-between items-center py-2 px-4 border-b border-primary/10 bg-secondary h-16">
            <div className="flex items-center">
                <Link href="/">
                    <h1 className={cn("hidden md:block text-xl md:text-3xl font-bold bg-gradient-to-r from-green-600 via-blue-500 to-indigo-400 text-transparent bg-clip-text",
                    font.className)}>
                        Apparel.AI
                    </h1>
                </Link>
            </div>
            <div className="flex items-center gap-x-3">
                <Button variant="premium" size="sm">
                    Billing
                </Button>
                <UserButton />
            </div>
        </div>
    );
};