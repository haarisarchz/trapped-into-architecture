import { NextResponse } from "next/server";

function displayRole(role: string): string {
  if (!role) return "User";
  const r = role.toLowerCase().replace(/[\s_]+/g, "");
  if (r === "ceo") return "CEO";
  if (r === "superadmin") return "Super Admin";
  if (r === "jobadmin") return "Job Admin";
  if (r === "admin") return "Job Admin";
  return "User";
}

export async function POST(req: Request) {
  try {
    const { userId, oldRole, newRole } = await req.json();

    if (!userId || !newRole) {
      return NextResponse.json(
        { error: "userId and newRole are required." },
        { status: 400 }
      );
    }

    const formattedNewRole = displayRole(newRole);

    // Email dispatch disabled to conserve free tier email quotas.
    // Roles are updated directly in the database without burning email units.
    return NextResponse.json({
      success: true,
      message: `Role updated to ${formattedNewRole} successfully.`,
      emailSent: false,
    });
  } catch (err: any) {
    console.error("Notify role change route error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process role change." },
      { status: 500 }
    );
  }
}
