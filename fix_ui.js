const fs = require("fs");
let content = fs.readFileSync("app/admin/add-job/page.tsx", "utf-8");

const uiOld = `                {/* POSITION */}

                <div>

                  <label className="block mb-2 font-medium">
                    Position <span className="text-red-500 text-xl font-bold">*</span>
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

                </div>`;

const uiNew = `                {/* POSITIONS DYNAMIC ARRAY */}
                <div className="col-span-1 md:col-span-2">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">Positions <span className="text-red-500 text-xl font-bold">*</span></h3>
                    <button type="button" onClick={() => setPositions([...positions, {position: "", experience: "", salary: "", description: "", completed: false}])} className="bg-blue-600 text-white px-4 py-2 rounded">
                      + Add Position
                    </button>
                  </div>
                  {positions.map((pos, idx) => (
                    <div key={idx} className="border rounded-2xl p-4 mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-2 font-medium">Position Name</label>
                        <input type="text" list="positions-list" value={pos.position} onChange={(e) => { const newPos = [...positions]; newPos[idx].position = e.target.value; setPositions(newPos); }} className="w-full border rounded-2xl px-4 py-3" placeholder="Junior Architect" />
                        <datalist id="positions-list">{positionOptions.map((p) => (<option key={p} value={p} />))}</datalist>
                      </div>
                      <div>
                        <label className="block mb-2 font-medium">Experience</label>
                        <select value={pos.experience} onChange={(e) => { const newPos = [...positions]; newPos[idx].experience = e.target.value; setPositions(newPos); }} className="w-full border rounded-2xl px-4 py-3">
                          <option value="">Select Experience</option>
                          {experienceOptions.map((exp) => (<option key={exp} value={exp}>{exp}</option>))}
                        </select>
                      </div>
                      <div>
                        <label className="block mb-2 font-medium">Salary</label>
                        <input type="text" value={pos.salary} onChange={(e) => { const newPos = [...positions]; newPos[idx].salary = e.target.value; setPositions(newPos); }} className="w-full border rounded-2xl px-4 py-3" placeholder="e.g. 50000" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block mb-2 font-medium">Description</label>
                        <textarea value={pos.description} onChange={(e) => { const newPos = [...positions]; newPos[idx].description = e.target.value; setPositions(newPos); }} className="w-full border rounded-2xl px-4 py-3" rows="3" placeholder="Job description for this position"></textarea>
                      </div>
                      <div className="flex justify-between items-center md:col-span-2">
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" checked={pos.completed} onChange={(e) => { const newPos = [...positions]; newPos[idx].completed = e.target.checked; setPositions(newPos); }} className="w-5 h-5" />
                          <span>Completed</span>
                        </label>
                        {positions.length > 1 && (
                          <button type="button" onClick={() => { const newPos = positions.filter((_, i) => i !== idx); setPositions(newPos); }} className="bg-red-500 text-white px-4 py-2 rounded">
                            - Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>`;

content = content.replace(uiOld, uiNew);
fs.writeFileSync("app/admin/add-job/page.tsx", content);

