"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useRouter } from "next/navigation";

export default function CompaniesPage() {

  const router = useRouter();

  return (

    <main className="min-h-screen bg-gray-100">

      <Navbar />

      <section className="w-full px-6 lg:px-12 py-10">

        <div className="flex justify-between items-center mb-8">

          <div>

            <h1 className="text-4xl font-bold">
              Companies
            </h1>

            <p className="text-gray-600 mt-2">
              Manage registered companies.
            </p>

          </div>

          <button
            className="bg-purple-600 text-white px-6 py-3 rounded-xl"
          >
            + Add Company
          </button>

        </div>

        <div className="bg-white rounded-3xl p-10 shadow">

          Coming Soon

        </div>

      </section>

      <Footer />

    </main>

  );

}