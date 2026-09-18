"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/ga/report");
        const json = await res.json();
        if (json.error) {
          setError(json.error);
        } else {
          setData(json);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <main className="min-h-screen bg-gray-100">
      <Navbar />
      <section className="w-full px-6 lg:px-12 py-10">
        <h1 className="text-4xl font-bold mb-8">Platform Analytics</h1>
        
        {loading && <div className="text-gray-500">Loading data...</div>}
        
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200">
            <h3 className="font-bold">Notice</h3>
            <p>{error}</p>
          </div>
        )}

        {data && (
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white p-6 rounded-2xl shadow border">
              <h3 className="text-gray-500 text-sm font-medium uppercase">Active Users</h3>
              <p className="text-3xl font-bold mt-2">{data.users}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow border">
              <h3 className="text-gray-500 text-sm font-medium uppercase">Total Sessions</h3>
              <p className="text-3xl font-bold mt-2">{data.sessions}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow border">
              <h3 className="text-gray-500 text-sm font-medium uppercase">Page Views</h3>
              <p className="text-3xl font-bold mt-2">{data.pageViews}</p>
            </div>
          </div>
        )}
      </section>
      <Footer />
    </main>
  );
}

