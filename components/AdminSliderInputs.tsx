import React, { useState, useEffect } from 'react';
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

export function AdminExperienceSlider({ experience, onChangeExp, isInternship }: { experience: string[], onChangeExp: (arr: string[]) => void, isInternship: boolean }) {
  const [expRange, setExpRange] = useState<number[]>([0, 5]);

  useEffect(() => {
    if (experience && experience.length > 0) {
      const expStr = experience.join(" ").toLowerCase();
      if (expStr.includes("fresher")) {
        setExpRange([0, 0]);
      } else {
        const nums = expStr.match(/\d+/g);
        if (nums && nums.length >= 2) {
          setExpRange([parseInt(nums[0]), parseInt(nums[1])]);
        } else if (nums && nums.length === 1) {
          if (expStr.includes("+")) setExpRange([parseInt(nums[0]), 15]);
          else setExpRange([parseInt(nums[0]), parseInt(nums[0])]);
        }
      }
    } else {
       setExpRange([0, 5]);
    }
  }, [experience]);

  const pushExp = (range: number[]) => {
    if (range[0] === 0 && range[1] === 0) {
      onChangeExp(["Fresher"]);
    } else if (range[1] === 15) {
      onChangeExp([`${range[0]}+ Years`]);
    } else {
      onChangeExp([`${range[0]}-${range[1]} Years`]);
    }
  };

  if (isInternship) {
      return (
          <div className="h-full flex flex-col justify-center text-center text-gray-500 py-4 border rounded-xl bg-gray-50">
            <span className="text-xl mb-2">??</span>
            <p className="text-sm font-medium">Experience not required for internships</p>
          </div>
      );
  }

  return (
    <div className="w-full">
        <label className="block mb-4 text-sm font-bold uppercase tracking-wider text-gray-700">Required Experience <span className="text-red-500">*</span></label>
        <div className="px-3 mb-6">
            <Slider 
                range 
                min={0} 
                max={15} 
                value={expRange} 
                onChange={(val) => {
                  setExpRange(val as number[]);
                  pushExp(val as number[]);
                }} 
                trackStyle={[{ backgroundColor: '#3b82f6' }]}
                handleStyle={[{ borderColor: '#9ca3af', backgroundColor: 'white' }, { borderColor: '#9ca3af', backgroundColor: 'white' }]}
            />
        </div>
        <div className="flex items-center justify-between gap-4">
            <select 
                className="flex-1 bg-white border border-gray-300 rounded-lg shadow-sm px-3 py-2 text-sm outline-none focus:border-blue-500"
                value={expRange[0]}
                onChange={(e) => {
                  const v = parseInt(e.target.value);
                  setExpRange([v, Math.max(v, expRange[1])]);
                  pushExp([v, Math.max(v, expRange[1])]);
                }}
            >
                <option value={0}>Fresher</option>
                {[1,2,3,4,5,7,10].map(v => <option key={v} value={v}>{v} Year{v>1?'s':''}</option>)}
            </select>
            <span className="text-sm font-semibold text-gray-400">to</span>
            <select 
                className="flex-1 bg-white border border-gray-300 rounded-lg shadow-sm px-3 py-2 text-sm outline-none focus:border-blue-500"
                value={expRange[1]}
                onChange={(e) => {
                  const v = parseInt(e.target.value);
                  setExpRange([Math.min(expRange[0], v), v]);
                  pushExp([Math.min(expRange[0], v), v]);
                }}
            >
                <option value={0}>Fresher</option>
                {[1,2,3,4,5,7,10].map(v => <option key={v} value={v}>{v} Year{v>1?'s':''}</option>)}
                <option value={15}>15+ Years</option>
            </select>
        </div>
    </div>
  );
}

export function AdminSalarySlider({ salary, onChangeSal }: { salary: string, onChangeSal: (s: string) => void }) {
  const [salRange, setSalRange] = useState<number[]>([0, 50]);
  const [salUnit, setSalUnit] = useState<string>("LPA");
  const [isNotDisclosed, setIsNotDisclosed] = useState(false);
  const [isIndustryStandard, setIsIndustryStandard] = useState(false);

  useEffect(() => {
    const salStr = (salary || "").toLowerCase();
    if (salStr.includes("not disclosed")) {
      setIsNotDisclosed(true);
      setIsIndustryStandard(false);
    } else if (salStr.includes("industry standard") || salStr.includes("negotiable") || salStr.includes("as per")) {
      setIsIndustryStandard(true);
      setIsNotDisclosed(false);
    } else {
      setIsNotDisclosed(false);
      setIsIndustryStandard(false);
      let multiplier = 1;
      let curUnit = "LPA";
      if (salStr.includes("lpa") || salStr.includes("lakhs") || salStr.includes("lakh")) {
        multiplier = 100000;
        curUnit = "LPA";
      } else if (salStr.includes("k") || salStr.includes("month")) {
        multiplier = 1000;
        curUnit = "Per Month";
      }
      
      const nums = salStr.match(/\d+(\.\d+)?/g);
      if (nums && nums.length >= 2) {
        const min = parseFloat(nums[0]) * multiplier;
        const max = parseFloat(nums[1]) * multiplier;
        setSalUnit(curUnit);
        setSalRange(curUnit === "LPA" ? [min/100000, max/100000] : [min, max]);
      } else if (nums && nums.length === 1) {
        const val = parseFloat(nums[0]) * multiplier;
        setSalUnit(curUnit);
        setSalRange(curUnit === "LPA" ? [val/100000, val/100000] : [val, val]);
      }
    }
  }, [salary]);

  const pushSal = (range: number[], unit: string, notDisclosed: boolean, industryStd: boolean) => {
    if (notDisclosed) {
      onChangeSal("Not Disclosed");
    } else if (industryStd) {
      onChangeSal("As per Industry Standards");
    } else {
      if (unit === "LPA") {
        onChangeSal(`${range[0]} LPA - ${range[1]} LPA`);
      } else {
        onChangeSal(`${range[0]/1000}k - ${range[1]/1000}k Per Month`);
      }
    }
  };

  return (
    <div className="w-full">
        <label className="block mb-4 text-sm font-bold uppercase tracking-wider text-gray-700">Salary Range <span className="text-red-500">*</span></label>
        
        <div className="flex gap-4 mb-6">
            <label className="flex items-center gap-2 text-sm cursor-pointer font-medium">
                <input 
                    type="checkbox" 
                    checked={isNotDisclosed}
                    onChange={(e) => {
                      setIsNotDisclosed(e.target.checked);
                      if (e.target.checked) setIsIndustryStandard(false);
                      pushSal(salRange, salUnit, e.target.checked, false);
                    }}
                    className="w-4 h-4 rounded text-blue-600" 
                />
                Not Disclosed
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer font-medium">
                <input 
                    type="checkbox" 
                    checked={isIndustryStandard}
                    onChange={(e) => {
                      setIsIndustryStandard(e.target.checked);
                      if (e.target.checked) setIsNotDisclosed(false);
                      pushSal(salRange, salUnit, false, e.target.checked);
                    }}
                    className="w-4 h-4 rounded text-blue-600" 
                />
                As Per Industry Standards
            </label>
        </div>

        <div className={`transition-opacity duration-300 ${(isNotDisclosed || isIndustryStandard) ? 'opacity-30 pointer-events-none grayscale' : 'opacity-100'}`}>
            <div className="px-3 mb-6">
                <Slider 
                    range 
                    min={0} 
                    max={salUnit === "LPA" ? 50 : 200000} 
                    step={salUnit === "LPA" ? 1 : 5000}
                    value={salRange} 
                    onChange={(val) => {
                      setSalRange(val as number[]);
                      pushSal(val as number[], salUnit, isNotDisclosed, isIndustryStandard);
                    }} 
                    trackStyle={[{ backgroundColor: '#3b82f6' }]}
                    handleStyle={[{ borderColor: '#9ca3af', backgroundColor: 'white' }, { borderColor: '#9ca3af', backgroundColor: 'white' }]}
                />
            </div>
            
            <div className="flex items-center gap-4">
                <select 
                    className="flex-1 bg-white border border-gray-300 rounded-lg shadow-sm px-3 py-2 text-sm outline-none focus:border-blue-500"
                    value={salRange[0]}
                    onChange={(e) => {
                      const v = parseInt(e.target.value);
                      setSalRange([v, Math.max(v, salRange[1])]);
                      pushSal([v, Math.max(v, salRange[1])], salUnit, isNotDisclosed, isIndustryStandard);
                    }}
                >
                    <option value={0}>Min</option>
                    {[1,2,3,4,5,10,15,20,30,40].map(v => <option key={v} value={salUnit === "LPA" ? v : v*10000}>{salUnit === "LPA" ? v + " LPA" : (v*10) + "k"}</option>)}
                </select>
                <span className="text-sm font-semibold text-gray-400">to</span>
                <select 
                    className="flex-1 bg-white border border-gray-300 rounded-lg shadow-sm px-3 py-2 text-sm outline-none focus:border-blue-500"
                    value={salRange[1]}
                    onChange={(e) => {
                      const v = parseInt(e.target.value);
                      setSalRange([Math.min(salRange[0], v), v]);
                      pushSal([Math.min(salRange[0], v), v], salUnit, isNotDisclosed, isIndustryStandard);
                    }}
                >
                    {[1,2,3,4,5,10,15,20,30,40].map(v => <option key={v} value={salUnit === "LPA" ? v : v*10000}>{salUnit === "LPA" ? v + " LPA" : (v*10) + "k"}</option>)}
                    <option value={salUnit === "LPA" ? 50 : 200000}>{salUnit === "LPA" ? "50 LPA+" : "2L+"}</option>
                </select>

                <select 
                    className="flex-1 bg-white border border-gray-300 rounded-lg shadow-sm px-3 py-2 text-sm outline-none focus:border-blue-500"
                    value={salUnit}
                    onChange={(e) => {
                        const u = e.target.value;
                        setSalUnit(u);
                        const r = u === "LPA" ? [0, 50] : [0, 200000];
                        setSalRange(r);
                        pushSal(r, u, isNotDisclosed, isIndustryStandard);
                    }}
                >
                    <option value="Per Month">Per Month</option>
                    <option value="LPA">Per Annum (LPA)</option>
                </select>
            </div>
        </div>
    </div>
  );
}
