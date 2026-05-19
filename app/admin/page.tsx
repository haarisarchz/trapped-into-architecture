import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AdminDashboard() {

  return (

    <main className="min-h-screen bg-gray-100">

      <Navbar />

      <section className="w-full px-6 lg:px-12 py-10">

        {/* PAGE TITLE */}

        <div className="mb-10">

          <h1 className="text-4xl font-bold">
            Admin Dashboard
          </h1>

          <p className="text-gray-600 mt-2">
            Manage jobs, applications and platform activity.
          </p>

        </div>

        {/* DASHBOARD LAYOUT */}

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">

          {/* SIDEBAR */}

          <aside className="bg-white rounded-3xl border border-gray-200 shadow-md p-6 h-fit">

            <h2 className="text-2xl font-bold mb-6">
              Admin Panel
            </h2>

            <div className="space-y-3">

              <button className="w-full text-left px-4 py-3 rounded-2xl bg-black text-white font-medium">
                Dashboard
              </button>

              <button className="w-full text-left px-4 py-3 rounded-2xl hover:bg-gray-100 transition">
                Jobs
              </button>

              <button className="w-full text-left px-4 py-3 rounded-2xl hover:bg-gray-100 transition">
                Add Job
              </button>

              <button className="w-full text-left px-4 py-3 rounded-2xl hover:bg-gray-100 transition">
                Applications
              </button>

              <button className="w-full text-left px-4 py-3 rounded-2xl hover:bg-gray-100 transition">
                Settings
              </button>

            </div>

          </aside>

          {/* MAIN CONTENT */}

          <div className="space-y-8">

            {/* QUICK ACTIONS */}

<div className="bg-white rounded-3xl p-8 shadow-md border">

  <h2 className="text-2xl font-bold mb-6">
    Quick Actions
  </h2>

  <div className="flex flex-wrap gap-4">

    <button className="bg-black text-white px-6 py-3 rounded-2xl font-semibold hover:bg-gray-800 transition">

      Add Job

    </button>

    <button className="border px-6 py-3 rounded-2xl font-semibold hover:bg-gray-100 transition">

      Manage Jobs

    </button>

    <button className="border px-6 py-3 rounded-2xl font-semibold hover:bg-gray-100 transition">

      View Website

    </button>

    <button className="border px-6 py-3 rounded-2xl font-semibold hover:bg-gray-100 transition">

      Analytics

    </button>

  </div>

</div>

            {/* RECENT JOBS */}

<div className="bg-white rounded-3xl p-8 shadow-md border">

  <div className="flex items-center justify-between mb-8">

    <h2 className="text-2xl font-bold">
      Recent Jobs
    </h2>

    <button className="text-gray-500 hover:text-black transition">

      View All

    </button>

  </div>

  <div className="overflow-x-auto">

    <table className="w-full">

      <thead>

        <tr className="border-b">

          <th className="text-left py-4">
            Position
          </th>

          <th className="text-left py-4">
            Organization
          </th>

          <th className="text-left py-4">
            City
          </th>

          <th className="text-left py-4">
            Status
          </th>

        </tr>

      </thead>

      <tbody>

        <tr className="border-b">

          <td className="py-5 font-semibold">
            Junior Architect
          </td>

          <td className="py-5">
            ABC Architects
          </td>

          <td className="py-5">
            Chennai
          </td>

          <td className="py-5">

            <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm">

              Active

            </span>

          </td>

        </tr>

        <tr className="border-b">

          <td className="py-5 font-semibold">
            Interior Designer
          </td>

          <td className="py-5">
            Studio Edge
          </td>

          <td className="py-5">
            Bangalore
          </td>

          <td className="py-5">

            <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm">

              Active

            </span>

          </td>

        </tr>

        <tr>

          <td className="py-5 font-semibold">
            Landscape Architect
          </td>

          <td className="py-5">
            Green Studio
          </td>

          <td className="py-5">
            Hyderabad
          </td>

          <td className="py-5">

            <span className="bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm">

              Expired

            </span>

          </td>

        </tr>

      </tbody>

    </table>

  </div>

</div>

</div>
</div>

      </section>

      <Footer />

    </main>

  );

}