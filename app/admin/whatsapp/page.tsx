"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function WhatsAppRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/mails?channel=whatsapp");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-600 text-sm font-semibold">
      Redirecting to Mail &amp; WhatsApp Center...
    </div>
  );
}
