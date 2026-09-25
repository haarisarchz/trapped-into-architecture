import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Clock } from "lucide-react";

export default function ResourcesPage() {
  return (
    <main className="min-h-screen bg-gray-50 text-black flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center py-20 px-6 text-center">
        <Clock className="w-16 h-16 text-gray-300 mb-6" />
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Coming Soon</h1>
        <p className="text-lg text-gray-600 max-w-lg">
          We are working hard on bringing you comprehensive architecture resources. Stay tuned!
        </p>
      </div>
      <Footer />
    </main>
  );
}


