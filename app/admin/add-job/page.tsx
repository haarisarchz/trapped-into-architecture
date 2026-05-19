"use client";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { useState } from "react";

const experienceOptions = [
  "Fresher",
  "0-1 Years",
  "1-2 Years",
  "2-4 Years",
  "4-6 Years",
  "6-10 Years",
  "10+ Years",
];

const salaryOptions = [
  "Not Disclosed",
  "₹10k–25k",
  "₹25k–50k",
  "₹50k–75k",
  "₹75k–1L",
  "₹1L+",
];

const existingFirms = [
  "ABC Architects",
  "Studio Edge",
  "Design Habitat",
];

const existingCities = [
  "Chennai",
  "Bangalore",
  "Hyderabad",
  "Mumbai",
];

const existingStates = [
  "Tamil Nadu",
  "Karnataka",
  "Telangana",
  "Maharashtra",
];

const positionOptions = [
  "Junior Architect",
  "Senior Architect",
  "Interior Designer",
  "BIM Architect",
  "Landscape Architect",
  "3D Visualizer",
];

export default function AddJobPage() {

  const router = useRouter();
  const [organizationType, setOrganizationType] =
    useState("Firm");

  const [selectedExperience, setSelectedExperience] =
    useState<string[]>([]);

  const [skillInput, setSkillInput] =
    useState("");

  const [skills, setSkills] =
    useState<string[]>([]);

  const [qualificationInput, setQualificationInput] =
    useState("");

  const [qualifications, setQualifications] =
    useState<string[]>([]);

  const [applicationType, setApplicationType] =
    useState("apply");

  /* MAIN JOB STATES */

  const [firmName, setFirmName] =
    useState("");

  const [area, setArea] =
    useState("");

  const [city, setCity] =
    useState("");

  const [state, setState] =
    useState("");

  const [position, setPosition] =
    useState("");

  const [experience, setExperience] =
    useState("");

  const [salary, setSalary] =
    useState("");

  const [postedDate, setPostedDate] =
    useState("");

  const [lastDateToApply, setLastDateToApply] =
    useState("");

  const [postExpiryDate, setPostExpiryDate] =
    useState("");

  const [jobDescription, setJobDescription] =
    useState("");

  const [applyLink, setApplyLink] =
    useState("");

  const [applicationEmail, setApplicationEmail] =
    useState("");

  const [source, setSource] =
    useState("");
  const [image, setImage] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const handleImageUpload = async (
  e: React.ChangeEvent<HTMLInputElement>
) => {

  const file = e.target.files?.[0];

  if (!file) return;

  const fileName = `${Date.now()}-${file.name}`;

  const { data, error } = await supabase.storage
    .from("job-images")
    .upload(fileName, file);

  if (error) {

    console.log(error);
    return;

  }

  const {
    data: { publicUrl },
  } = supabase.storage
    .from("job-images")
    .getPublicUrl(fileName);

  setImageUrl(publicUrl);

};

/* PUBLISH FUNCTION */

const handlePublishJob = async () => {

  /* REQUIRED FIELD CHECK */

  if (
    !firmName ||
    !position ||
    !city ||
    !state ||
    !jobDescription
  ) {

    alert("Please fill all required fields");

    return;

  }

  /* APPLICATION VALIDATION */

  if (
    applicationType === "apply" &&
    !applyLink
  ) {

    alert("Please enter apply link");

    return;

  }

  if (
    applicationType === "email" &&
    !applicationEmail
  ) {

    alert("Please enter application email");

    return;

  }

  /* INSERT JOB */

  const { data, error } = await supabase
  .from("jobs")
  .insert([
    {
  firm_name: firmName,
  area: area,
  city: city,
  state: state,
  position: position,
  salary: salary,
  experience: selectedExperience,
  qualifications: qualifications,
  skills_required: skills,
  job_description: jobDescription,
  apply_link: applyLink,
  application_email: applicationEmail,
  source: source,
  image: imageUrl,
  last_date_to_apply: lastDateToApply,
  post_expiry_date: postExpiryDate,
},
  ]);

/* ERROR */

if (error) {
  console.log("SUPABASE ERROR:", error);

  alert(JSON.stringify(error));

  return;
}

/* SUCCESS */

alert("Job Published Successfully");

/* REDIRECT TO ADMIN DASHBOARD */

router.push("/admin");

  /* CLEAR FORM */

  setFirmName("");
  setArea("");
  setCity("");
  setState("");
  setPosition("");
  setSalary("");
  setSelectedExperience([]);
  setQualifications([]);
  setSkills([]);
  setJobDescription("");
  setApplyLink("");
  setApplicationEmail("");
  setSource("");
  setImage("");
  setLastDateToApply("");
  setPostExpiryDate("");

};

  return (

    <main className="min-h-screen bg-gray-100">

        <Navbar />

        <section className="w-full px-6 lg:px-12 py-10">

          {/* PAGE TITLE */}

          <div className="mb-10">

            <h1 className="text-4xl font-bold">
              Add New Job
            </h1>

            <p className="text-gray-600 mt-2">
              Publish and manage job opportunities.
            </p>

          </div>

          {/* FORM CONTAINER */}

          <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-8 space-y-7">

            {/* BASIC DETAILS */}

            <div>

              <h2 className="text-2xl font-bold mb-6">
                Basic Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                {/* ORGANIZATION TYPE */}

                <div>

                  <label className="block mb-2 font-medium">
                    Organization Type
                  </label>

                  <select
                    value={organizationType}
                    onChange={(e) =>
                      setOrganizationType(e.target.value)
                    }
                    className="w-full border rounded-2xl px-4 py-3"
                  >

                    <option>Firm</option>
                    <option>Institution</option>
                    <option>Organization</option>
                    <option>Company</option>

                  </select>

                </div>

                {/* ORGANIZATION NAME */}

                <div>

                  <label className="block mb-2 font-medium">
                    {organizationType} Name
                  </label>

                  <input
  type="text"
  placeholder="Enter name"
  value={firmName}
  onChange={(e) =>
    setFirmName(e.target.value)
  }
  className="w-full border rounded-2xl px-4 py-3"
/>

                </div>

                {/* POSITION */}

                <div>

                  <label className="block mb-2 font-medium">
                    Position *
                  </label>

                  <input
  type="text"
  list="positions"
  placeholder="Junior Architect"
  value={position}
  onChange={(e) =>
    setPosition(e.target.value)
  }
  className="w-full border rounded-2xl px-4 py-3"
/>
                  <datalist id="positions">

                    {positionOptions.map((position) => (

                      <option
                        key={position}
                        value={position}
                      />

                    ))}

                  </datalist>

                </div>

              </div>

            </div>

            {/* LOCATION */}

            <div>

              <h2 className="text-2xl font-bold mb-6">
                Location
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* NEIGHBORHOOD */}

                <div>

                  <label className="block mb-2 font-medium">
                    Neighborhood
                  </label>

                  <input
                    type="text"
                    placeholder="Adyar"
                    className="w-full border rounded-2xl px-4 py-3"
                  />

                </div>

                {/* CITY */}

                <div>

                  <label className="block mb-2 font-medium">
                    City *
                  </label>

                  <input
  type="text"
  list="cities"
  placeholder="Chennai"
  value={city}
  onChange={(e) =>
    setCity(e.target.value)
  }
  className="w-full border rounded-2xl px-4 py-3"
/>

                  <datalist id="cities">

                    {existingCities.map((city) => (

                      <option
                        key={city}
                        value={city}
                      />

                    ))}

                  </datalist>

                </div>

                {/* STATE */}

                <div>

                  <label className="block mb-2 font-medium">
                    State *
                  </label>

                  <input
  type="text"
  list="states"
  placeholder="Tamil Nadu"
  value={state}
  onChange={(e) =>
    setState(e.target.value)
  }
  className="w-full border rounded-2xl px-4 py-3"
/>

                  <datalist id="states">

                    {existingStates.map((state) => (

                      <option
                        key={state}
                        value={state}
                      />

                    ))}

                  </datalist>

                </div>

              </div>

            </div>

            {/* REQUIREMENTS */}

            <div>

              <h2 className="text-2xl font-bold mb-4">
                Requirements
              </h2>

              {/* EXPERIENCE */}

              <div className="mb-6">

                <label className="block mb-3 font-medium">
                  Experience Levels
                </label>

                <div className="flex flex-wrap lg:flex-nowrap gap-3 overflow-x-auto pb-2">

                  {experienceOptions.map((exp) => (

                    <label
                      key={exp}
                      className="flex items-center gap-2 border rounded-full px-4 py-2 whitespace-nowrap cursor-pointer"
                    >

                      <input
                        type="checkbox"
                        checked={selectedExperience.includes(exp)}
                        onChange={() => {

                          if (selectedExperience.includes(exp)) {

                            setSelectedExperience(
                              selectedExperience.filter(
                                (e) => e !== exp
                              )
                            );

                          } else {

                            setSelectedExperience([
                              ...selectedExperience,
                              exp,
                            ]);

                          }

                        }}
                      />

                      <span>{exp}</span>

                    </label>

                  ))}

                </div>

              </div>

              {/* QUALIFICATION + SALARY */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* QUALIFICATIONS */}

                <div>

                  <label className="block mb-2 font-medium">
                    Qualifications
                  </label>

                  <input
                    type="text"
                    value={qualificationInput}
                    onChange={(e) => {

                      const value = e.target.value;

                      if (value.endsWith(",")) {

                        const newQualification =
                          value.replace(",", "").trim();

                        if (
                          newQualification &&
                          !qualifications.includes(
                            newQualification
                          )
                        ) {

                          setQualifications([
                            ...qualifications,
                            newQualification,
                          ]);

                        }

                        setQualificationInput("");

                      } else {

                        setQualificationInput(value);

                      }

                    }}
                    placeholder="Type qualification and press comma"
                    className="w-full border rounded-2xl px-4 py-2.5"
                  />

                  <div className="flex flex-wrap gap-2 mt-3">

                    {qualifications.map((qualification) => (

                      <div
                        key={qualification}
                        className="bg-gray-200 px-4 py-2 rounded-full flex items-center gap-2"
                      >

                        <span>{qualification}</span>

                        <button
                          type="button"
                          onClick={() =>
                            setQualifications(
                              qualifications.filter(
                                (q) => q !== qualification
                              )
                            )
                          }
                        >
                          ✕
                        </button>

                      </div>

                    ))}

                  </div>

                </div>

                {/* SALARY */}

                <div>

                  <label className="block mb-2 font-medium">
                    Salary
                  </label>

                  <select
  value={salary}
  onChange={(e) =>
    setSalary(e.target.value)
  }
  className="w-full border rounded-2xl px-4 py-2.5"
>

                    <option>
                      Select Salary Range
                    </option>

                    {salaryOptions.map((option) => (

                      <option key={option}>
                        {option}
                      </option>

                    ))}

                  </select>

                </div>

              </div>

              {/* SKILLS */}

              <div className="mt-6">

                <label className="block mb-2 font-medium">
                  Skills Required
                </label>

                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => {

                    const value = e.target.value;

                    if (value.endsWith(",")) {

                      const newSkill =
                        value.replace(",", "").trim();

                      if (
                        newSkill &&
                        !skills.includes(newSkill)
                      ) {

                        setSkills([
                          ...skills,
                          newSkill,
                        ]);

                      }

                      setSkillInput("");

                    } else {

                      setSkillInput(value);

                    }

                  }}
                  placeholder="Type skill and press comma"
                  className="w-full border rounded-2xl px-4 py-3"
                />

                <div className="flex flex-wrap gap-2 mt-3">

                  {skills.map((skill) => (

                    <div
                      key={skill}
                      className="bg-black text-white px-4 py-2 rounded-full flex items-center gap-2"
                    >

                      <span>{skill}</span>

                      <button
                        type="button"
                        onClick={() =>
                          setSkills(
                            skills.filter(
                              (s) => s !== skill
                            )
                          )
                        }
                      >
                        ✕
                      </button>

                    </div>

                  ))}

                </div>

              </div>
            </div>

            {/* JOB DETAILS */}

            <div>

              <h2 className="text-2xl font-bold mb-6">
                Job Details
              </h2>

              {/* DESCRIPTION */}

              <div>

                <label className="block mb-2 font-medium">
                  Job Description *
                </label>

                <textarea
  rows={8}
  placeholder="Write detailed job description..."
  value={jobDescription}
  onChange={(e) =>
    setJobDescription(e.target.value)
  }
  className="w-full border rounded-2xl px-4 py-3"
/>

              </div>

            </div>

            {/* APPLICATION */}

            <div>

              <h2 className="text-2xl font-bold mb-4">
                Application Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              
                {/* SOURCE LINK */}

                <div>

                  <label className="block mb-2 font-medium">
                    Source Link
                  </label>

                  <input
  type="text"
  placeholder="https://..."
  value={source}
  onChange={(e) =>
    setSource(e.target.value)
  }
  className="w-full border rounded-2xl px-4 py-2.5"
/>

                </div>

                {/* EXPIRY DATE */}

                <div>

                  <label className="block mb-2 font-medium">
                    Expiry Date
                  </label>

                  <input
  type="date"
  value={postExpiryDate}
  onChange={(e) =>
    setPostExpiryDate(e.target.value)
  }
  className="w-full border rounded-2xl px-4 py-2.5"
/>

                </div>

              </div>

            </div>

            {/* MEDIA */}

            <div>

              <h2 className="text-2xl font-bold mb-6">
                Media
              </h2>

              {/* IMAGE URL */}

              <div>

                <label className="block mb-2 font-medium">
  Upload Job Image
</label>

<input
  type="file"
  accept="image/*"
  onChange={handleImageUpload}
  className="w-full border rounded-2xl px-4 py-3"
/>

              </div>

            </div>
            {/* APPLICATION BUTTON TYPE */}

            <div>

              <h2 className="text-2xl font-bold mb-6">
                Application Method
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                {/* APPLICATION TYPE */}

                <div>

                  <label className="block mb-2 font-medium">
                    Button Type
                  </label>

                  <select
                    value={applicationType}
                    onChange={(e) =>
                      setApplicationType(e.target.value)
                    }
                    className="w-full border rounded-2xl px-4 py-3"
                  >

                    <option value="apply">
                      Apply Now
                    </option>

                    <option value="email">
                      Email Now
                    </option>

                  </select>

                </div>

                {/* APPLY LINK */}

{applicationType === "apply" && (

  <div className="md:col-span-2">

    <label className="block mb-2 font-medium">
      Apply Link
    </label>

    <input
      type="text"
      placeholder="https://..."
      value={applyLink}
      onChange={(e) =>
        setApplyLink(e.target.value)
      }
      className="w-full border rounded-2xl px-4 py-3"
    />

  </div>

)}

{/* EMAIL */}

{applicationType === "email" && (

  <div className="md:col-span-2">

    <label className="block mb-2 font-medium">
      Application Email
    </label>

    <input
      type="email"
      placeholder="careers@firm.com"
      value={applicationEmail}
      onChange={(e) =>
        setApplicationEmail(e.target.value)
      }
      className="w-full border rounded-2xl px-4 py-3"
    />

  </div>

)}

              </div>

            </div>
            {/* SUBMIT BUTTON */}

           <button
  type="button"
  onClick={handlePublishJob}
  className="bg-black text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-gray-800 transition"
>
  Publish Job
</button>

          </div>

        </section>

        <Footer />

      </main>

    );

  }