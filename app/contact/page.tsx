import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ContactPage() {

  return (

    <main className="min-h-screen bg-gray-100">

      <Navbar />

      <section className="px-6 lg:px-12 py-16">

        <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-md border p-10">

          <h1 className="text-4xl font-bold mb-4">
            Contact Us
          </h1>

          <p className="text-gray-600 mb-10">
            Reach out for collaborations, support or feedback.
          </p>

          <div className="space-y-6">

            <input
              type="text"
              placeholder="Your Name"
              className="w-full border rounded-2xl px-5 py-4"
            />

            <input
              type="email"
              placeholder="Your Email"
              className="w-full border rounded-2xl px-5 py-4"
            />

            <textarea
              rows={6}
              placeholder="Your Message"
              className="w-full border rounded-2xl px-5 py-4"
            />

            <button className="bg-black text-white px-8 py-4 rounded-2xl font-semibold hover:bg-gray-800 transition">

              Send Message

            </button>

          </div>

        </div>

      </section>

      <Footer />

    </main>

  );

}