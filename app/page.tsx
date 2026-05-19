import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100">

      <Navbar />

      {/* HERO SECTION */}
      <section className="bg-gray-900 text-white py-28 px-10 text-center">

        <h1 className="text-6xl font-bold mb-6">
          Find Architecture Jobs Faster
        </h1>

        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Discover architecture firms, internships, remote jobs,
          and career resources in one place.
        </p>

        
        <Link
       href="/jobs"
  className="bg-white text-black px-8 py-4 rounded-2xl text-xl font-semibold hover:bg-gray-200 transition inline-block"
>
  Explore Jobs
</Link>

      </section>

      {/* FEATURE SECTION */}
      <section className="py-20 px-10">

        <h2 className="text-4xl font-bold mb-10 text-center">
          Featured Categories
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          <div className="bg-white p-8 rounded-2xl shadow-md">
            <h3 className="text-2xl font-semibold mb-3">
              Architecture Firms
            </h3>

            <p className="text-gray-600">
              Explore top companies hiring architects and designers.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-md">
            <h3 className="text-2xl font-semibold mb-3">
              Internships
            </h3>

            <p className="text-gray-600">
              Find internships for architecture students worldwide.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-md">
            <h3 className="text-2xl font-semibold mb-3">
              Practice Exams
            </h3>

            <p className="text-gray-600">
              Prepare for architecture entrance and licensing exams.
            </p>
          </div>

        </div>

      </section>

    </main>
  );
}