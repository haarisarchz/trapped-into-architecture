import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BookOpen } from "lucide-react";

export default function ResourcesPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-4xl mx-auto py-32 px-6 flex flex-col items-center justify-center text-center min-h-[60vh]">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <BookOpen className="w-10 h-10 text-gray-400" />
        </div>
        <h1 className="text-4xl font-bold mb-4">Resources</h1>
        <p className="text-xl text-gray-500 max-w-2xl">
          We are currently curating the best architectural resources, templates, and guides. 
          <br/><br/>
          <span className="font-bold text-black border border-gray-200 px-4 py-2 rounded-full inline-block mt-2 bg-gray-50">Coming Soon</span>
        </p>
      </div>
      <Footer />
    </main>
  );
}
