import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Clock } from "lucide-react";

export default function PracticeExamsPage() {
  return (
    <main className="min-h-screen bg-gray-50 text-black flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center py-20 px-6 text-center">
        <Clock className="w-16 h-16 text-gray-300 mb-6" />
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Coming Soon</h1>
        <p className="text-lg text-gray-600 max-w-lg">
          Practice exams are under development. Check back later to test your skills!
        </p>
      </div>
      <Footer />
    </main>
  );
}


