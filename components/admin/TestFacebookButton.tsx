"use client";
import { useState } from "react";

export default function TestFacebookButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testConnection = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/publish/test-facebook");
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setResult({ success: false, error: err.message });
    }
    setLoading(false);
  };

  return (
    <div>
      <button 
        onClick={testConnection}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50"
      >
        {loading ? "Testing..." : "Test Facebook Connection"}
      </button>
      
      {result && (
        <div className={`mt-3 p-3 rounded-lg text-sm ${result.success ? "bg-green-100 text-green-800 border border-green-200" : "bg-red-100 text-red-800 border border-red-200"}`}>
          {result.success ? (
            <div><strong>Success!</strong> Connected to page: {result.name}</div>
          ) : (
            <div><strong>Failed:</strong> {result.error}</div>
          )}
        </div>
      )}
    </div>
  );
}
