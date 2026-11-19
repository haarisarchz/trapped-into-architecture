"use client";
import { useState } from "react";

export default function TestLinkedInButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testConnection = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/publish/test-linkedin");
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setResult({ success: false, error: err.message || "Network error" });
    }
    setLoading(false);
  };

  return (
    <div>
      <button
        onClick={testConnection}
        disabled={loading}
        className="bg-[#0077b5] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#005582] transition disabled:opacity-50 flex items-center gap-2"
      >
        {loading ? "Testing..." : "Test LinkedIn Connection"}
      </button>

      {result && (
        <div
          className={`mt-3 p-3 rounded-lg text-sm ${
            result.success
              ? "bg-green-100 text-green-800 border border-green-200"
              : "bg-red-100 text-red-800 border border-red-200"
          }`}
        >
          {result.success ? (
            <div>
              <strong>Success!</strong> {result.message}
              <div className="text-xs mt-1 text-green-700">
                Entity: {result.name} ({result.urn})
              </div>
            </div>
          ) : (
            <div>
              <strong>Failed:</strong> {result.error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
