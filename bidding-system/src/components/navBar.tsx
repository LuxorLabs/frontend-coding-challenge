"use client";

import { useContext } from "react";
import { UserContext } from "@/common/context/userContext";

export default function Navbar() {
  const { user, loading } = useContext(UserContext);
  const initial =
    !loading && user?.name ? user.name.charAt(0).toUpperCase() : "";
  const fullName = user?.name ?? "";
  
  return (
    <nav className="bg-white shadow">
      <div className="max-w-4xl mx-auto flex items-center justify-between px-6 py-4">
        <h1 className="text-2xl font-bold">BidBidBid</h1>

        <div className="flex items-center">
          {loading ? (
            <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
          ) : (
            <div className="relative group">
              <div className="h-10 w-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold cursor-default">
                {initial}
              </div>
              <div className="absolute top-full bg-gray-800 text-white text-sm rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {fullName}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}