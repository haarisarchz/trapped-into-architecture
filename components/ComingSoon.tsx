"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Clock } from "lucide-react";

export default function ComingSoon({ title, description }: { title: string, description: string }) {
  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-gray-400">
          <Clock size={40} />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">{title}</h1>
        <p className="text-gray-500 text-lg md:text-xl max-w-xl mx-auto">
          {description}
        </p>
        <button 
          onClick={() => window.history.back()}
          className="mt-8 px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition"
        >
          Go Back
        </button>
      </div>

      <Footer />
    </main>
  );
}
