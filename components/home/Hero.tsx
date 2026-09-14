"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, MapPin } from "lucide-react";

export default function Hero() {
  const router = useRouter();
  const [role, setRole] = useState("");
  const [location, setLocation] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (role) params.set("search", role);
    if (location) params.set("city", location);
    router.push(`/jobs?${params.toString()}`);
  };

  const draw = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (i: number) => {
      const delay = 0.5 + i * 0.5;
      return {
        pathLength: 1,
        opacity: 1,
        transition: {
          pathLength: { delay, type: "spring", duration: 2, bounce: 0 },
          opacity: { delay, duration: 0.1 }
        }
      };
    }
  };

  return (
    <section className="relative w-full min-h-[85vh] bg-black text-white flex flex-col justify-center items-center px-6 overflow-hidden">
      {/* Animated Blueprint Background */}
      <div className="absolute inset-0 z-0 flex items-center justify-center opacity-30 pointer-events-none">
        <motion.svg
          width="800"
          height="600"
          viewBox="0 0 800 600"
          initial="hidden"
          animate="visible"
          className="stroke-gray-600 stroke-[1.5px] fill-transparent"
        >
          {/* Isometric Building 1 */}
          <motion.path d="M 300 350 L 300 500 L 400 550 L 400 400 Z" variants={draw} custom={0} />
          <motion.path d="M 400 400 L 400 550 L 500 500 L 500 350 Z" variants={draw} custom={1} />
          <motion.path d="M 300 350 L 400 300 L 500 350 L 400 400 Z" variants={draw} custom={2} />

          {/* Isometric Building 2 (Taller, behind) */}
          <motion.path d="M 450 250 L 450 450 L 550 500 L 550 300 Z" variants={draw} custom={3} />
          <motion.path d="M 550 300 L 550 500 L 650 450 L 650 250 Z" variants={draw} custom={4} />
          <motion.path d="M 450 250 L 550 200 L 650 250 L 550 300 Z" variants={draw} custom={5} />

          {/* Isometric Building 3 (Smaller, front) */}
          <motion.path d="M 200 450 L 200 550 L 280 590 L 280 490 Z" variants={draw} custom={1} />
          <motion.path d="M 280 490 L 280 590 L 360 550 L 360 450 Z" variants={draw} custom={2} />
          <motion.path d="M 200 450 L 280 410 L 360 450 L 280 490 Z" variants={draw} custom={3} />

          {/* Grid lines / Horizon */}
          <motion.line x1="0" y1="550" x2="800" y2="550" variants={draw} custom={4} style={{ strokeDasharray: "4,4" }} className="stroke-gray-700" />
          <motion.line x1="0" y1="500" x2="800" y2="500" variants={draw} custom={5} style={{ strokeDasharray: "4,4" }} className="stroke-gray-700" />
        </motion.svg>
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto text-center mt-16">
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-5xl md:text-7xl font-bold mb-6 tracking-tight"
        >
          Design Your Career.<br/>Build the Future.
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto font-light"
        >
          Discover top architecture firms, exclusive internships, and leading roles across the globe.
        </motion.p>

        <motion.form 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          onSubmit={handleSearch}
          className="bg-white p-2 rounded-2xl flex flex-col md:flex-row gap-2 shadow-2xl mx-auto max-w-3xl"
        >
          <div className="flex-1 flex items-center bg-gray-50 hover:bg-gray-100 transition rounded-xl px-4 py-3">
            <Search className="text-gray-400 w-5 h-5 mr-3 shrink-0" />
            <input 
              type="text" 
              placeholder="Role (e.g. Architect, Intern)..." 
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-transparent text-black outline-none text-lg"
            />
          </div>
          <div className="w-px bg-gray-200 hidden md:block my-2"></div>
          <div className="flex-1 flex items-center bg-gray-50 hover:bg-gray-100 transition rounded-xl px-4 py-3">
            <MapPin className="text-gray-400 w-5 h-5 mr-3 shrink-0" />
            <input 
              type="text" 
              placeholder="City or location..." 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-transparent text-black outline-none text-lg"
            />
          </div>
          <button 
            type="submit" 
            className="bg-black text-white px-8 py-4 md:py-3 rounded-xl font-semibold text-lg hover:bg-gray-800 transition shadow-lg"
          >
            Search
          </button>
        </motion.form>
      </div>
    </section>
  );
}
