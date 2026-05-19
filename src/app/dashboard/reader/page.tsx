"use client";
import React, { useState } from "react";
import Sidebar from "@/components/sidebar";
import Contents from "@/components/contents";
import Navbar from "@/components/navbar";
import UpdateProfile from "@/components/updateprofile";

const Page = () => {
  // 'blogs' is selected by default when the user opens the dashboard
  const [activeView, setActiveView] = useState<"blogs" | "profile" | "published" | "drafts" | "create">("blogs");


  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Top Global Navigation Bar */}
      <Navbar />

      {/* Split Content Area */}
      <div className="flex flex-1 relative">
        {/* Fixed Left Sidebar - Passing state controllers down */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* Flexible Right Main Content Viewport */}
        <main className="flex-1 p-6 md:p-8 lg:p-10 max-w-5xl mx-auto w-full overflow-y-auto bg-slate-900">

          {/* Conditional Rendering: Show Blogs Feed */}
          {activeView === "blogs" && (
            <>
              <div className="max-w-2xl mx-auto mb-6">
                <h1 className="text-3xl font-bold tracking-tight text-white">Articles Feed</h1>
                <p className="text-slate-400 text-sm mt-1">Explore fresh stories published by verified creators.</p>
              </div>
              {/* Renders the complete dynamic blog card feed stack */}
              <Contents />
            </>
          )}
          {/* Conditional Rendering: Show Update Profile Form */}
          {activeView === "profile" && (
            <div className="py-4">
              {/* <UpdateProfile />  */}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Page;
