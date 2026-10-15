import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Trapped Into Architecture",
  description: "Official Privacy Policy for Trapped Into Architecture. Learn how we handle your personal data, job listings, and third-party integrations.",
  alternates: {
    canonical: "https://trappedintoarchitecture.com/privacy-policy",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-white text-black">
      <Navbar />

      <div className="max-w-4xl mx-auto py-16 px-6 sm:px-8">
        <div className="border-b border-gray-200 pb-8 mb-10">
          <span className="text-xs uppercase tracking-widest font-bold text-gray-500">Legal & Transparency</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2 tracking-tight">Privacy Policy</h1>
          <p className="text-sm text-gray-500 mt-2">
            Last updated: October 15, 2026 • Effective Date: October 15, 2026
          </p>
        </div>

        <div className="prose prose-gray max-w-none text-gray-700 space-y-8 leading-relaxed text-sm sm:text-base">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Introduction</h2>
            <p>
              Welcome to <strong>Trapped Into Architecture</strong> (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;), accessible at{" "}
              <a href="https://trappedintoarchitecture.com" className="text-blue-600 underline">https://trappedintoarchitecture.com</a>. We are committed to protecting the privacy of architects, interior designers, interns, fresh graduates, architectural studios, and visitors who use our platform to discover or advertise career opportunities.
            </p>
            <p className="mt-3">
              This Privacy Policy explains what personal information we collect, how it is used, shared, and stored, and your rights concerning your information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Information We Collect</h2>
            <p>We collect information in the following ways:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>
                <strong>Job Postings & Studio Information:</strong> When employers or administrators post job vacancies, we collect company names, office locations, position titles, requirements, application emails, phone numbers, portfolio links, and recruitment images/flyers.
              </li>
              <li>
                <strong>Direct Communications:</strong> When you reach out to us via our contact form, email, or WhatsApp, we collect your name, email address, phone number, and message content to assist with your inquiry.
              </li>
              <li>
                <strong>User Account Details:</strong> If you register or log in, we collect your username, email address, profile preferences, and saved jobs.
              </li>
              <li>
                <strong>Technical & Usage Data:</strong> We automatically collect standard internet log data, including IP address, browser type, device information, operating system, pages visited, and referring URLs.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. How We Use Your Information</h2>
            <p>We use collected data strictly for the following purposes:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>To host, publish, and display architectural job vacancies to job seekers across India.</li>
              <li>To allow candidates to connect with hiring firms directly via verified email, phone, or application links.</li>
              <li>To automatically broadcast public job postings to authorized social media channels (e.g., Meta/Facebook, Instagram, LinkedIn, and X).</li>
              <li>To operate, maintain, and optimize platform speed, security, and search discoverability.</li>
              <li>To respond to user inquiries, verify job submissions, and prevent spam or fraudulent job listings.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Third-Party Services & Social Media Integrations</h2>
            <p>
              Trapped Into Architecture integrates with authorized third-party APIs to deliver services and publish job announcements:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>
                <strong>LinkedIn API:</strong> Used to share verified architectural job advertisements to our authorized LinkedIn Company Page and community. No private user data is sent to LinkedIn without consent.
              </li>
              <li>
                <strong>Meta Platforms (Facebook & Instagram Graph APIs):</strong> Used to automatically broadcast published job flyers, role summaries, and hashtags to official Trapped Into Architecture pages.
              </li>
              <li>
                <strong>Twitter / X API:</strong> Used to share job alerts and vacancy updates.
              </li>
              <li>
                <strong>Google Services:</strong> We use Google Analytics to monitor aggregated platform traffic and Google for Jobs structured data to make architectural openings discoverable in Google Search.
              </li>
              <li>
                <strong>Cloud & Database Infrastructure:</strong> User data and job listings are stored securely on Supabase and Vercel with encrypted connections.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Data Sharing & Public Information</h2>
            <p>
              Job postings and firm contact details (such as official application emails and website URLs) submitted for public advertising are publicly accessible to job seekers on our website and indexed by search engines. We do <strong>not</strong> sell, rent, or trade your personal information to third-party data brokers or marketing agencies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Cookies & Tracking Technologies</h2>
            <p>
              We use essential cookies and lightweight analytics cookies to maintain your login session, save job bookmarks, and analyze traffic trends. You can instruct your browser to refuse all cookies or indicate when a cookie is being sent.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Data Security & Retention</h2>
            <p>
              We implement industry-standard technical measures (SSL/TLS encryption, secure database policies, and restricted API credentials) to safeguard your data. We retain published job listings for historical directory purposes unless an employer or candidate requests modification or deletion.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">8. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Request access to the personal data we hold about you.</li>
              <li>Request correction or removal of an outdated job listing or personal contact detail.</li>
              <li>Opt out of job notifications or marketing communications at any time.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">9. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, wish to exercise your rights, or want to update a job listing, please contact us:
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mt-4 space-y-2">
              <p><strong>Trapped Into Architecture</strong></p>
              <p>Website: <a href="https://trappedintoarchitecture.com" className="text-blue-600 underline">https://trappedintoarchitecture.com</a></p>
              <p>Contact Form: <Link href="/contact" className="text-blue-600 underline">trappedintoarchitecture.com/contact</Link></p>
              <p>Email: <a href="mailto:admin.ti2a@gmail.com" className="text-blue-600 underline">admin.ti2a@gmail.com</a></p>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}
