import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function UnavailablePage({ searchParams }: { searchParams: { service?: string } }) {
  const service = searchParams.service || "This service";
  
  return (
    <>
      <Navbar />
      <main className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-4xl font-bold mb-4">{service} is not configured yet</h1>
        <p className="text-gray-500 mb-8">
          The administrator has not yet added a URL for {service}. Please check back later.
        </p>
        <Link href="/" className="bg-black text-white px-8 py-3 rounded-full hover:bg-gray-800 transition">
          Return Home
        </Link>
      </main>
      <Footer />
    </>
  );
}
