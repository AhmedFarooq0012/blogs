import Contents from "@/components/contents";
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <div className="min-h-screen bg-gray-50 text-black flex flex-col">
        {/* Top Global Navigation Bar */}
        <Navbar />

        {/* Split Layout Section */}
        <div className="flex flex-1 relative">
          {/* Left Side Navigation Panel - Hidden on Mobile */}
          <div className="hidden md:block">
            <Sidebar />
          </div>

          {/* Right Side Main Scrollable Feed Stream Viewport */}
          <main className="flex-1 p-6 md:p-8 lg:p-10 max-w-5xl mx-auto w-full overflow-y-auto bg-slate-900">
            <div className="max-w-2xl mx-auto mb-6">
              <h1 className="text-3xl font-bold tracking-tight text-white">Articles Feed</h1>
              <p className="text-slate-400 text-sm mt-1">Explore fresh stories published by verified creators.</p>
            </div>

            <Contents />
          </main>
        </div>
      </div>
    </>
  );
}
