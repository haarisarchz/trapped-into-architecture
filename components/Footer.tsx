export default function Footer() {
  return (
    <footer className="bg-black text-white">

      <div className="max-w-7xl mx-auto px-6 md:px-10 py-8 md:py-14 grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-10">

        {/* BRAND */}

        <div>

          <h2 className="text-xl md:text-2xl font-bold mb-3">
            Trapped Into Architecture
          </h2>

          <p className="text-gray-400 leading-6 text-sm md:text-base">
            Careers, knowledge, opportunities and growth for
            architecture students and professionals.
          </p>

        </div>

        {/* QUICK LINKS */}

        <div>

          <h3 className="text-lg font-semibold mb-2">
            Quick Links
          </h3>

          <ul className="space-y-1 text-gray-400 text-sm md:text-base">

            <li>Home</li>
            <li>Jobs</li>
            <li>Companies</li>
            <li>Practice Exams</li>
            <li>Resources</li>

          </ul>

        </div>

        {/* JOB SEEKERS */}

        <div>

          <h3 className="text-lg font-semibold mb-2">
            For Job Seekers
          </h3>

          <ul className="space-y-1 text-gray-400 text-sm md:text-base">

            <li>Browse Jobs</li>
            <li>Create Profile</li>
            <li>Saved Jobs</li>
            <li>Career Advice</li>
            <li>Resume Tips</li>

          </ul>

        </div>

        {/* CONTACT */}

        <div>

          <h3 className="text-lg font-semibold mb-2">
            Contact
          </h3>

          <ul className="space-y-1 text-gray-400 text-sm md:text-base">

            <li>info@trappedintoarchitecture.com</li>
            <li>+91 98765 43210</li>
            <li>Chennai, India</li>

          </ul>

        </div>

      </div>

      {/* BOTTOM BAR */}

      <div className="border-t border-gray-800 py-3 text-center text-gray-500 text-xs md:text-sm">

        © 2026 Trapped Into Architecture. All rights reserved.

      </div>

    </footer>
  );
}