import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Trapped Into Architecture",
  description: "Official Privacy Policy for Trapped Into Architecture. Learn how we handle personal data, job postings, social media automations, and data deletion requests.",
  alternates: {
    canonical: "https://trappedintoarchitecture.com/privacy-policy",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-white text-black">
      <Navbar />

      <div className="max-w-4xl mx-auto py-16 px-6 sm:px-8">
        {/* Header */}
        <div className="border-b border-gray-200 pb-8 mb-10">
          <span className="text-xs uppercase tracking-widest font-bold text-gray-500">Legal & Transparency</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2 tracking-tight">Privacy Policy</h1>
          <p className="text-sm text-gray-500 mt-2">
            Last updated: October 17, 2026 • Effective Date: October 17, 2026
          </p>

          {/* AI Disclosure Notice Banner */}
          <div className="mt-6 p-4 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-sm flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-800 shrink-0 font-bold text-xs uppercase tracking-wider">
              AI Transparency Notice
            </div>
            <p className="text-xs sm:text-sm leading-relaxed text-amber-950">
              This Privacy Policy document was drafted and structured with <strong>Artificial Intelligence (AI) assistance</strong> to ensure clarity, completeness, and adherence to modern digital data regulations (including India&apos;s DPDP Act 2023 and Meta/LinkedIn Developer policies). It is reviewed, adopted, and officially enforced by the administration of <strong>Trapped Into Architecture</strong>.
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="prose prose-gray max-w-none text-gray-700 space-y-10 leading-relaxed text-sm sm:text-base">
          {/* Section 1 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Introduction</h2>
            <p>
              Welcome to <strong>Trapped Into Architecture</strong> (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;), accessible at{" "}
              <a href="https://trappedintoarchitecture.com" className="text-blue-600 underline font-medium">https://trappedintoarchitecture.com</a>.
              We provide a specialized platform connecting architectural firms, interior design studios, construction enterprises, and creative practices with architects, interior designers, 3D visualizers, drafts persons, and student interns across India.
            </p>
            <p className="mt-3">
              We are deeply committed to protecting the privacy, security, and integrity of the personal data shared by our community members. This Privacy Policy outlines what information we collect, how it is processed and shared, and the rights and choices available to you.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Information We Collect</h2>
            <p>Depending on how you interact with our platform, we collect the following categories of information:</p>
            <div className="space-y-4 mt-3">
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">A. Architectural Studio & Job Vacancy Information</h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  When employers or administrators publish vacancies, we collect studio/company names, office addresses, hiring position titles, experience requirements, salary ranges, verified application email addresses, contact telephone numbers, website URLs, and recruitment flyer graphics.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">B. User Account & Candidate Profile Details</h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  When you register an account or create a candidate profile, we collect your full name, display name, unique username, email address, contact phone number, profession, educational background, years of experience, city, state, portfolio links, LinkedIn/social profiles, and uploaded resume files.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">C. Direct Inquiries & Communications</h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  When you communicate with our support team via email, our website contact form, or official WhatsApp channels, we collect your name, contact identifier, and correspondence history to address your inquiry.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">D. Technical, Device & Analytics Data</h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  We automatically gather standard technical log data, such as internet protocol (IP) addresses, device hardware identifiers, browser types, operating systems, referring URLs, pages viewed, and access timestamps.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. How We Use Your Information</h2>
            <p>We process collected information strictly for legitimate platform purposes, including:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Displaying and categorizing architectural job vacancies and internship opportunities to relevant candidates.</li>
              <li>Enabling candidates to directly connect with hiring studios via verified email, contact numbers, or external portfolio submission links.</li>
              <li>Managing user authentication, session security, saved job bookmarks, and candidate profile management.</li>
              <li>Automatically syndicating public job postings and recruitment announcements to authorized social media channels (e.g., Meta/Instagram, LinkedIn, and X).</li>
              <li>Monitoring platform uptime, preventing fraudulent job postings or spam, and safeguarding users against cyber threats.</li>
              <li>Fulfilling legal and regulatory obligations under Indian law.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Third-Party Services & Automated Social Broadcasting</h2>
            <p>
              Trapped Into Architecture integrates with trusted third-party technology providers and application programming interfaces (APIs) to power platform functionality:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>
                <strong>Meta Platforms (Facebook & Instagram Graph APIs):</strong> When job opportunities and design flyers are published, our system may automatically format and broadcast them to Trapped Into Architecture&apos;s official Instagram and Facebook pages. No private candidate profile information is ever shared with Meta.
              </li>
              <li>
                <strong>LinkedIn API:</strong> Used to syndicate verified architectural job postings to our official LinkedIn community.
              </li>
              <li>
                <strong>Twitter / X API:</strong> Used to broadcast public job updates and urgent hiring notices.
              </li>
              <li>
                <strong>Google Analytics & Google for Jobs:</strong> We use Google Analytics to analyze aggregated visitor trends and Google structured schema data (JSON-LD) to make job opportunities directly discoverable within Google Search.
              </li>
              <li>
                <strong>Cloud & Database Infrastructure:</strong> User databases, authentication tokens, and media assets are securely hosted on Supabase (PostgreSQL with Row-Level Security) and Vercel cloud networks with end-to-end encryption.
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Data Sharing & Confidentiality</h2>
            <p>
              <strong>Public Job Listings:</strong> All information submitted specifically for public job advertisements (such as company name, office location, job flyer, application email, and contact number) is made publicly viewable on our website and searchable by search engines for hiring purposes.
            </p>
            <p className="mt-3">
              <strong>Candidate Privacy Guarantee:</strong> We do <strong>not</strong> sell, rent, lease, or monetize your personal details, resumes, or phone numbers to third-party data brokers, marketing agencies, or unsolicited telemarketers.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Cookies & Local Storage</h2>
            <p>
              We use essential cookies and browser local storage to keep you securely logged in, remember your preferences, and maintain your saved job bookmarks. You may adjust your browser settings to decline cookies; however, certain interactive features of our platform (such as account sessions) may not function properly without them.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Data Security & Storage</h2>
            <p>
              We implement industry-standard administrative and technical safeguards—including HTTPS/TLS encryption for all data in transit, strict database access control policies, and isolated environment keys—to protect personal data against unauthorized access, loss, or misuse. However, please be aware that no method of transmission over the internet or electronic storage is completely invulnerable.
            </p>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">8. User Rights & Data Deletion (Meta App & DPDP Compliance)</h2>
            <p>
              Under applicable data protection laws (including the <strong>Digital Personal Data Protection Act, 2023</strong>), you have the right to access, rectify, or erase the personal data we maintain about you.
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 mt-4 space-y-3">
              <h3 className="font-bold text-gray-900 text-sm sm:text-base">How to Request Account & Data Deletion</h3>
              <p className="text-xs sm:text-sm text-gray-700">
                If you wish to permanently delete your account, candidate profile, uploaded resumes, saved jobs, or remove a studio listing, you can submit a deletion request through either of the following methods:
              </p>
              <ul className="list-disc pl-6 text-xs sm:text-sm text-gray-700 space-y-1">
                <li>
                  <strong>By Email:</strong> Send an email from your registered email address to{" "}
                  <a href="mailto:admin.ti2a@gmail.com" className="text-blue-600 underline font-medium">admin.ti2a@gmail.com</a>{" "}
                  with the subject line: <code className="bg-gray-200 px-1 py-0.5 rounded text-xs text-gray-800">Account &amp; Data Deletion Request</code>.
                </li>
                <li>
                  <strong>By Contact Form:</strong> Submit a request via our{" "}
                  <Link href="/contact" className="text-blue-600 underline font-medium">Contact Page</Link>{" "}
                  indicating your username and registered email.
                </li>
              </ul>
              <p className="text-xs text-gray-500 pt-1">
                Upon verification, all personal identifiers, resumes, and saved data will be permanently purged from our active databases within 30 days.
              </p>
            </div>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">9. Children&apos;s Privacy</h2>
            <p>
              Trapped Into Architecture is an employment and professional networking service intended strictly for working professionals, job seekers, and university students aged 18 and older (or aged 16 and older under the supervision of a parent or guardian). We do not knowingly solicit or collect personal information from individuals under the age of 13. If you believe a minor has provided us with personal data, please contact us immediately to have the information removed.
            </p>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">10. AI-Assisted Content & Document Generation</h2>
            <p>
              To uphold digital transparency and efficiency, certain platform materials—including this Privacy Policy, automated job categorization tags, and promotional social media captions—may be synthesized or structured using <strong>Artificial Intelligence (AI) technologies</strong>.
            </p>
            <p className="mt-2">
              All AI-assisted outputs are subject to human administrative oversight by the Trapped Into Architecture management team to verify factual consistency and user safety.
            </p>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">11. Governing Law & Jurisdiction</h2>
            <p>
              This Privacy Policy and any disputes arising out of or related to the use of Trapped Into Architecture shall be governed by and construed in accordance with the <strong>laws of the Republic of India</strong>, including the Information Technology Act, 2000 and the Digital Personal Data Protection Act, 2023. Any legal proceedings shall be subject to the exclusive jurisdiction of the competent courts in <strong>Tamil Nadu, India</strong>.
            </p>
          </section>

          {/* Section 12 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">12. Contact Information</h2>
            <p>
              For any questions, clarifications, privacy inquiries, or data deletion requests regarding this policy, please reach out to our team:
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mt-4 space-y-2">
              <p className="font-bold text-gray-900">Trapped Into Architecture</p>
              <p className="text-sm">Location: Madurai, Tamil Nadu, India</p>
              <p className="text-sm">Website: <a href="https://trappedintoarchitecture.com" className="text-blue-600 underline">https://trappedintoarchitecture.com</a></p>
              <p className="text-sm">Email: <a href="mailto:admin.ti2a@gmail.com" className="text-blue-600 underline font-medium">admin.ti2a@gmail.com</a></p>
              <p className="text-sm">Contact Support: <Link href="/contact" className="text-blue-600 underline">trappedintoarchitecture.com/contact</Link></p>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}
