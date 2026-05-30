"use client";

import { useEffect, useState } from "react";
import {
  useRouter,
  useParams
} from "next/navigation";

import {
  Bookmark,
  BookmarkCheck,
} from "lucide-react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";

export default function ProfilePage() {

  const router = useRouter();
const params = useParams();
const [activeTab, setActiveTab] =
  useState("personal");
const username =
  params.username;
  const [user, setUser] = useState<any>(null);
  const [savedJobs, setSavedJobs] =
  useState<string[]>([]);
  const [savedJobsData, setSavedJobsData] =
  useState<any[]>([]);

  const [bio, setBio] = useState("");

  const [profileImage, setProfileImage] =
    useState("");
    const [isEditing, setIsEditing] =
  useState(false);
const [editedUser, setEditedUser] =
  useState<any>(null);
 useEffect(() => {

  const users =
    JSON.parse(
      localStorage.getItem("users") || "[]"
    );

  const foundUser =
    users.find(
      (u: any) =>
        u.username.toLowerCase() ===
        String(username).toLowerCase()
    );

  if (!foundUser) {

    router.push("/");
    return;

  }

  setUser(foundUser);
  setEditedUser(foundUser);
  setSavedJobs(
  foundUser.savedJobs || []
);

if (
  foundUser.savedJobs &&
  foundUser.savedJobs.length > 0
) {
  fetchSavedJobs(foundUser.savedJobs);
}

  setBio(foundUser.bio || "");

  setProfileImage(
    foundUser.profileImage || ""
  );

}, [username]);

const fetchSavedJobs = async (
  ids: string[]
) => {

  const { data, error } =
    await supabase
      .from("jobs")
      .select("*")
      .in("id", ids);

  if (error) {

  console.log(error);

} else {

  setSavedJobsData(

    (data || []).map((job) => ({

      ...job,

      isSaved: true,

    }))

  );

}

};

  /* IMAGE UPLOAD */

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {

    const file = e.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {

      const image =
        reader.result as string;

      setProfileImage(image);

      const updatedUser = {
        ...user,
        profileImage: image,
      };

      setUser(updatedUser);

      /* UPDATE USERS ARRAY */

const users =
  JSON.parse(
    localStorage.getItem("users") || "[]"
  );

const updatedUsers =
  users.map((u: any) => {

    if (
      u.username === user.username
    ) {

      return updatedUser;

    }

    return u;

  });

localStorage.setItem(
  "users",
  JSON.stringify(updatedUsers)
);

localStorage.setItem(
  "currentUser",
  JSON.stringify(updatedUser)
);

    };

    reader.readAsDataURL(file);

  };

 const saveBio = () => {

  const updatedUser = {
    ...user,
    bio,
  };

  setUser(updatedUser);

  /* UPDATE USERS ARRAY */

  const users =
    JSON.parse(
      localStorage.getItem("users") || "[]"
    );

  const updatedUsers =
    users.map((u: any) => {

      if (
        u.username === user.username
      ) {

        return updatedUser;

      }

      return u;

    });

  localStorage.setItem(
    "users",
    JSON.stringify(updatedUsers)
  );

  localStorage.setItem(
    "currentUser",
    JSON.stringify(updatedUser)
  );

  alert("Profile updated");

};

  /* LOGOUT */

  const handleLogout = () => {

    localStorage.removeItem(
      "currentUser"
    );

    router.push("/");

  };

  if (!user) return null;

  return (

    <main className="min-h-screen bg-gray-100 flex flex-col">

      {/* NAVBAR */}

      <Navbar />

      {/* PAGE CONTENT */}

      <section className="flex-1 py-10 px-6">

        <div className="max-w-5xl mx-auto">

          {/* PAGE TITLE */}

          <div className="mb-8">

            <h1 className="text-4xl font-bold">
              My Profile
            </h1>

            <p className="text-gray-500 mt-2">
              Manage your account details
            </p>

          </div>

          {/* PROFILE CARD */}

          <div className="bg-white rounded-3xl shadow-lg p-8">

            {/* TOP SECTION */}

            <div className="flex flex-col md:flex-row gap-8 items-start">

              {/* PROFILE IMAGE */}

              <div className="flex flex-col items-center">

                <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-gray-200 bg-gray-100">

                  {profileImage ? (

                    <img
                      src={profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />

                  ) : (

                    <div className="w-full h-full flex items-center justify-center text-5xl text-gray-400">

                      👤

                    </div>

                  )}

                </div>

                {/* UPLOAD */}

                <label className="mt-5 cursor-pointer bg-black text-white px-5 py-3 rounded-2xl hover:bg-gray-800 transition">

                  Upload Photo

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />

                </label>

              </div>

              {/* USER BASIC DETAILS */}

              <div className="flex-1">

  <h1 className="text-4xl font-bold">

    {user.fullName}

  </h1>

  <p className="text-xl text-gray-500 mt-2">

    @{user.username}

  </p>

  {/* BIO */}

  <div className="mt-8">

    <p className="text-gray-700 leading-relaxed">

      {bio
        ? bio
        : "No bio added yet."}

    </p>

  </div>

</div>
</div>
          
           {/* TABS */}

<div className="mt-14">

  <div className="flex gap-4 mb-8 flex-wrap">

    <button
      onClick={() =>
        setActiveTab("personal")
      }
      className={`px-6 py-3 rounded-2xl font-semibold transition
      ${
        activeTab === "personal"
          ? "bg-black text-white"
          : "bg-gray-200 text-black"
      }`}
    >
      Personal Information
    </button>

    <button
      onClick={() =>
        setActiveTab("saved")
      }
      className={`px-6 py-3 rounded-2xl font-semibold transition
      ${
        activeTab === "saved"
          ? "bg-black text-white"
          : "bg-gray-200 text-black"
      }`}
    >
      Saved Jobs
    </button>

    <button
      onClick={() =>
        setActiveTab("applied")
      }
      className={`px-6 py-3 rounded-2xl font-semibold transition
      ${
        activeTab === "applied"
          ? "bg-black text-white"
          : "bg-gray-200 text-black"
      }`}
    >
      Applied Jobs
    </button>

  </div>

  {/* PERSONAL */}

{activeTab === "personal" && (

  <div className="border rounded-3xl p-8 bg-gray-50">

    <div className="flex items-center justify-between mb-8">

      <h2 className="text-2xl font-bold">
        Personal Information
      </h2>

      <button
        onClick={() => {

          if (isEditing) {

            /* SAVE */

            const users =
              JSON.parse(
                localStorage.getItem("users") || "[]"
              );

            const updatedUsers =
              users.map((u: any) => {

                if (
                  u.username === user.username
                ) {

                  return editedUser;

                }

                return u;

              });

            localStorage.setItem(
              "users",
              JSON.stringify(updatedUsers)
            );

            localStorage.setItem(
              "currentUser",
              JSON.stringify(editedUser)
            );

            setUser(editedUser);

            alert("Profile updated");

          }

          setIsEditing(!isEditing);

        }}
        className="bg-black text-white px-5 py-2 rounded-xl"
      >
        {isEditing ? "Save" : "Edit"}
      </button>

    </div>

    <div className="grid md:grid-cols-2 gap-8">

      {/* FULL NAME */}

      <div>

        <p className="text-sm text-gray-500 mb-2">
          Full Name
        </p>

        {isEditing ? (

          <input
            type="text"
            value={editedUser?.fullName || ""}
            onChange={(e) =>
              setEditedUser({
                ...editedUser,
                fullName: e.target.value,
              })
            }
            className="w-full border rounded-xl px-4 py-3"
          />

        ) : (

          <p className="text-lg font-medium">
            {user.fullName}
          </p>

        )}

      </div>

      {/* DISPLAY NAME */}

      <div>

        <p className="text-sm text-gray-500 mb-2">
          Display Name
        </p>

        {isEditing ? (

          <input
            type="text"
            value={editedUser?.displayName || ""}
            onChange={(e) =>
              setEditedUser({
                ...editedUser,
                displayName: e.target.value,
              })
            }
            className="w-full border rounded-xl px-4 py-3"
          />

        ) : (

          <p className="text-lg font-medium">
            {user.displayName || "Not added"}
          </p>

        )}

      </div>

      {/* USERNAME */}

      <div>

        <p className="text-sm text-gray-500 mb-2">
          Username
        </p>

        {isEditing ? (

          <input
            type="text"
            value={editedUser?.username || ""}
            onChange={(e) =>
              setEditedUser({
                ...editedUser,
                username: e.target.value,
              })
            }
            className="w-full border rounded-xl px-4 py-3"
          />

        ) : (

          <p className="text-lg font-medium">
            @{user.username}
          </p>

        )}

      </div>

      {/* EMAIL */}

      <div>

        <p className="text-sm text-gray-500 mb-2">
          Email
        </p>

        {isEditing ? (

          <input
            type="email"
            value={editedUser?.email || ""}
            onChange={(e) =>
              setEditedUser({
                ...editedUser,
                email: e.target.value,
              })
            }
            className="w-full border rounded-xl px-4 py-3"
          />

        ) : (

          <p className="text-lg font-medium">
            {user.email || "Not added"}
          </p>

        )}

      </div>

      {/* PHONE */}

      <div>

        <p className="text-sm text-gray-500 mb-2">
          Phone Number
        </p>

        {isEditing ? (

          <input
            type="text"
            value={editedUser?.phone || ""}
            onChange={(e) =>
              setEditedUser({
                ...editedUser,
                phone: e.target.value,
              })
            }
            className="w-full border rounded-xl px-4 py-3"
          />

        ) : (

          <p className="text-lg font-medium">
            {user.phone || "Not added"}
          </p>

        )}

      </div>

      {/* DOB */}

      <div>

        <p className="text-sm text-gray-500 mb-2">
          Date of Birth
        </p>

        {isEditing ? (

          <input
            type="date"
            value={editedUser?.dob || ""}
            onChange={(e) =>
              setEditedUser({
                ...editedUser,
                dob: e.target.value,
              })
            }
            className="w-full border rounded-xl px-4 py-3"
          />

        ) : (

          <p className="text-lg font-medium">
            {user.dob || "Not added"}
          </p>

        )}

      </div>

      {/* PROFESSION */}

      <div>

        <p className="text-sm text-gray-500 mb-2">
          Profession
        </p>

        {isEditing ? (

          <input
            type="text"
            value={editedUser?.profession || ""}
            onChange={(e) =>
              setEditedUser({
                ...editedUser,
                profession: e.target.value,
              })
            }
            className="w-full border rounded-xl px-4 py-3"
          />

        ) : (

          <p className="text-lg font-medium">
            {user.profession || "Not added"}
          </p>

        )}

      </div>

      {/* EDUCATION */}

      <div>

        <p className="text-sm text-gray-500 mb-2">
          Educational Qualification
        </p>

        {isEditing ? (

          <input
            type="text"
            value={editedUser?.education || ""}
            onChange={(e) =>
              setEditedUser({
                ...editedUser,
                education: e.target.value,
              })
            }
            className="w-full border rounded-xl px-4 py-3"
          />

        ) : (

          <p className="text-lg font-medium">
            {user.education || "Not added"}
          </p>

        )}

      </div>

    </div>

  </div>

)}

  {/* SAVED JOBS */}

  {activeTab === "saved" && (

  <div className="border rounded-3xl p-8 bg-gray-50">

    <h2 className="text-2xl font-bold mb-6">
      Saved Jobs
    </h2>

    {savedJobs.length === 0 ? (

      <p className="text-gray-500">
        No saved jobs yet
      </p>

    ) : (

      <div className="space-y-3">

  {savedJobsData.map((job) => {

    const isExpired =
      job.post_expiry_date &&
      new Date(job.post_expiry_date) < new Date();

      const toggleSavedJob = (jobId: string) => {

  const currentUser =
    JSON.parse(
      localStorage.getItem("currentUser") || "null"
    );

  if (!currentUser) return;

  const job =
    savedJobsData.find(
      (j) => j.id === jobId
    );

  if (!job) return;

  let updatedSavedJobs;

  if (job.isSaved) {

    updatedSavedJobs =
      currentUser.savedJobs.filter(
        (id: string) => id !== jobId
      );

  } else {

    updatedSavedJobs = [
      ...(currentUser.savedJobs || []),
      jobId,
    ];

  }

  currentUser.savedJobs =
    updatedSavedJobs;

  localStorage.setItem(
    "currentUser",
    JSON.stringify(currentUser)
  );

  const users =
    JSON.parse(
      localStorage.getItem("users") || "[]"
    );

  const updatedUsers =
    users.map((u: any) =>
      u.username === currentUser.username
        ? currentUser
        : u
    );

  localStorage.setItem(
    "users",
    JSON.stringify(updatedUsers)
  );

  setSavedJobsData(
    savedJobsData.map((j) =>
      j.id === jobId
        ? {
            ...j,
            isSaved: !j.isSaved,
          }
        : j
    )
  );

};

    return (

      <div
        key={job.id}
        onClick={() =>
          router.push(`/jobs/${job.id}`)
        }
        className="
          bg-white
          rounded-xl
          shadow-sm
          hover:shadow-md
          transition
          border
          border-gray-200
          px-4
          py-3
          flex
          items-center
          gap-3
          cursor-pointer
        "
      >

        {/* IMAGE */}

        <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">

          {job.image ? (

            <img
              src={job.image}
              alt={job.position}
              className="w-full h-full object-cover"
            />

          ) : (

            <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
              No Image
            </div>

          )}

        </div>

        {/* CONTENT */}

        <div className="flex-1">

          <p className="text-sm text-gray-800">

            <span className="font-semibold">
              {job.firm_name}
            </span>

            {" is hiring "}

            <span className="font-medium">
              {job.position}
            </span>

            {" at "}

            <span className="text-gray-600">
              {job.city}, {job.state}
            </span>

          </p>

        </div>

        {/* STATUS */}

        <div className="flex items-center gap-3">

  <button
    onClick={(e) => {

      e.stopPropagation();

      toggleSavedJob(job.id);

    }}
    className={`p-2 rounded-full transition ${
      job.isSaved
        ? "bg-black text-white"
        : "bg-gray-100 text-gray-500"
    }`}
  >

    {job.isSaved ? (

      <BookmarkCheck size={16} />

    ) : (

      <Bookmark size={16} />

    )}

  </button>

  {isExpired ? (

    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">
      Expired
    </span>

  ) : (

    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
      Active
    </span>

  )}

</div>
</div>


    );

  })}

</div>

    )}

  </div>

)}

  {/* APPLIED JOBS */}

  {activeTab === "applied" && (

    <div className="border rounded-3xl p-8 bg-gray-50 text-gray-500">

      No applications yet

    </div>

  )}

</div>
            {/* LOGOUT */}

            <div className="mt-12">

              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-2xl transition"
              >
                Logout
              </button>

            </div>

          </div>

        </div>

  

      </section>

      {/* FOOTER */}

      <Footer />

    </main>

  );

}