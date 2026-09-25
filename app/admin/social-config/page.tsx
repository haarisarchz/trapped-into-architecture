"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useRouter } from "next/navigation";

export default function SocialConfigPage() {
  const router = useRouter();
  
  const platforms = [
    { id: 'whatsapp', name: 'WhatsApp Channel', status: 'Not Configured' },
    { id: 'telegram', name: 'Telegram Channel', status: 'Not Configured' },
    { id: 'facebook', name: 'Facebook Page', status: 'Not Configured' },
    { id: 'instagram', name: 'Instagram Professional', status: 'Not Configured' },
    { id: 'x', name: 'X / Twitter', status: 'Not Configured' },
    { id: 'linkedin', name: 'LinkedIn Page', status: 'Not Configured' },
  ];

  return (
    <main className="min-h-screen bg-white text-black">
      <Navbar />
      <div className="max-w-4xl mx-auto py-12 px-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Social Media Configuration</h1>
          <button onClick={() => router.push('/admin')} className="bg-black text-white px-5 py-2 rounded-xl">
            Back to Dashboard
          </button>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 mb-8">
          <h2 className="text-xl font-bold mb-2">Master API Connections</h2>
          <p className="text-gray-600 mb-6">
            Configure official API credentials for each platform. Security notice: All secrets must be securely placed inside your Vercel Environment Variables (\`.env.local\`). Do not paste keys into this UI.
          </p>

          <div className="space-y-4">
            {platforms.map(p => (
              <div key={p.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl">
                <div>
                  <h3 className="font-bold text-lg">{p.name}</h3>
                  <p className="text-sm text-red-500 font-semibold mt-1">Status: {p.status}</p>
                </div>
                <div>
                  <button disabled className="bg-gray-200 text-gray-500 px-4 py-2 rounded-lg text-sm cursor-not-allowed">
                    Configure in .env
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}



