import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-white text-black">
      <Navbar />
      <div className="max-w-4xl mx-auto py-20 px-6 min-h-[60vh]">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <div className="prose lg:prose-xl text-gray-700">
          <p className="mb-4">
            Last updated: {new Date().toLocaleDateString()}
          </p>
          <p className="mb-4">
            Welcome to Trapped Into Architecture. Your privacy is important to us. This privacy policy explains how we collect, use, and protect your personal information when you use our website.
          </p>
          <h2 className="text-2xl font-bold mt-8 mb-4">Information We Collect</h2>
          <p className="mb-4">
            We may collect personal information that you provide to us, such as your name, email address, and contact details, when you register an account or fill out our contact forms.
          </p>
          <h2 className="text-2xl font-bold mt-8 mb-4">How We Use Your Information</h2>
          <p className="mb-4">
            The information we collect is used to provide and improve our services, communicate with you, and personalize your experience on our platform.
          </p>
          <p className="mt-8 text-sm text-gray-500">
            * This is a placeholder privacy policy. Please update with your official legal terms.
          </p>
        </div>
      </div>
      <Footer />
    </main>
  );
}


