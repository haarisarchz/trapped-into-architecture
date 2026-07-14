import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Navbar />

      {/* HERO SECTION */}
      <section className="bg-gray-900 text-white py-6 md:py-20 px-6 md:px-10 text-center">

        <h1 className="text-4xl md:text-4xl font-bold mb-4 leading-tight">
          Find Architecture Jobs Faster
        </h1>

        <p className="text-base md:text-xl text-gray-300 max-w-2xl mx-auto">
          Discover architecture firms, internships, remote jobs,
          and career resources in one place.
        </p>

        <Link
          href="/jobs"
          className="mt-8 bg-white text-black px-6 md:px-8 py-3 md:py-4 rounded-2xl text-lg md:text-xl font-semibold hover:bg-gray-200 transition inline-block"
        >
          Explore Jobs
        </Link>

      </section>

      {/* FEATURED CATEGORIES */}
      <section className="py-8 md:py-12 px-6 md:px-10 bg-gray-50">

        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">
          Featured Categories
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">

          <div className="bg-white p-5 md:p-6 rounded-2xl shadow-md">
            <h3 className="text-xl md:text-2xl font-semibold mb-3">
              Architecture Firms
            </h3>

            <p className="text-gray-600">
              Explore top companies hiring architects and designers.
            </p>
          </div>

          <div className="bg-white p-5 md:p-6 rounded-2xl shadow-md">
            <h3 className="text-xl md:text-2xl font-semibold mb-3">
              Internships
            </h3>

            <p className="text-gray-600">
              Find internships for architecture students worldwide.
            </p>
          </div>

          <div className="bg-white p-5 md:p-6 rounded-2xl shadow-md">
            <h3 className="text-xl md:text-2xl font-semibold mb-3">
              Practice Exams
            </h3>

            <p className="text-gray-600">
              Prepare for architecture entrance and licensing exams.
            </p>
          </div>

        </div>

      </section>

      <Footer />
    </>
  );
}
