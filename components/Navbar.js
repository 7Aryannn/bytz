"use client";
import React from 'react';
import Link from 'next/link';

const Navbar = () => {
  return (
    <nav className="h-[80px] w-full bg-[#2D4F1E] border-b border-[#1A3011] flex items-center justify-between px-6 lg:px-10 shrink-0">
      <div className="flex items-center">
        <Link href="/" className="text-3xl font-extrabold tracking-widest text-[#F5E6CC] hover:text-[#EAE0C8] transition-colors cursor-pointer flex items-center gap-2 group">
          <span
            className="w-8 h-8 bg-current inline-block transform -translate-y-[1px]"
            style={{
              WebkitMaskImage: `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌿</text></svg>")`,
              WebkitMaskSize: "contain",
              WebkitMaskRepeat: "no-repeat",
              WebkitMaskPosition: "center",
              maskImage: `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌿</text></svg>")`,
              maskSize: "contain",
              maskRepeat: "no-repeat",
              maskPosition: "center"
            }}
          ></span>
          BYTZ
        </Link>
      </div>

      <div className="flex items-center gap-6 md:gap-8">
        {/* <Link href="#login" className="text-[#EAE0C8] hover:text-[#F5E6CC] transition-colors duration-300 font-bold relative group hidden sm:block">
          Login
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#F5E6CC] transition-all group-hover:w-full"></span>
        </Link>
        <Link href="#signup" className="text-[#EAE0C8] hover:text-[#F5E6CC] transition-colors duration-300 font-bold relative group hidden sm:block">
          Sign Up
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#F5E6CC] transition-all group-hover:w-full"></span>
        </Link> */}
        <Link
          href="/vault"
          className="px-5 py-2.5 rounded-xl font-bold bg-[#F5E6CC] text-[#2D4F1E] hover:bg-[#EAE0C8] shadow-md hover:shadow-lg transition-all flex items-center gap-2"
        >
          <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
          <span className="hidden sm:inline">My Vault</span>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;