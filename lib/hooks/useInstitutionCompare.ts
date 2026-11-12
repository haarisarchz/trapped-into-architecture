"use client";

import { useState, useEffect, useCallback } from "react";

export interface ComparedCollege {
  id: string;
  slug: string;
  coa_code?: string;
  name: string;
  city?: string;
  state?: string;
  institution_type?: string;
  affiliated_university?: string;
}

const STORAGE_KEY = "ti2a_compared_institutions";
const MAX_COMPARE_LIMIT = 4;
const COMPARE_EVENT = "ti2a_compare_updated";

export function getStoredComparedColleges(): ComparedCollege[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.slice(0, MAX_COMPARE_LIMIT);
    }
  } catch (e) {
    console.error("Error reading stored compared institutions:", e);
  }
  return [];
}

export function saveStoredComparedColleges(colleges: ComparedCollege[]) {
  if (typeof window === "undefined") return;
  try {
    const trimmed = colleges.slice(0, MAX_COMPARE_LIMIT);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    window.dispatchEvent(new CustomEvent(COMPARE_EVENT, { detail: trimmed }));
  } catch (e) {
    console.error("Error writing stored compared institutions:", e);
  }
}

export function useInstitutionCompare() {
  const [comparedColleges, setComparedColleges] = useState<ComparedCollege[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Sync state from localStorage on mount and across window events
  useEffect(() => {
    setComparedColleges(getStoredComparedColleges());
    setIsLoaded(true);

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setComparedColleges(getStoredComparedColleges());
      }
    };

    const handleCustomChange = (e: CustomEvent<ComparedCollege[]>) => {
      if (Array.isArray(e.detail)) {
        setComparedColleges(e.detail);
      } else {
        setComparedColleges(getStoredComparedColleges());
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(COMPARE_EVENT as any, handleCustomChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(COMPARE_EVENT as any, handleCustomChange);
    };
  }, []);

  const addCollege = useCallback((inst: any): boolean => {
    if (!inst?.id) return false;
    const current = getStoredComparedColleges();
    if (current.some((c) => c.id === inst.id)) {
      return true; // Already added
    }
    if (current.length >= MAX_COMPARE_LIMIT) {
      return false; // Limit reached
    }
    const newEntry: ComparedCollege = {
      id: inst.id,
      slug: inst.slug || inst.id,
      coa_code: inst.coa_code,
      name: inst.institution_name || inst.name || "Institution",
      city: inst.city || inst.district,
      state: inst.state,
      institution_type: inst.institution_type,
      affiliated_university: inst.affiliated_university,
    };
    const nextList = [...current, newEntry];
    saveStoredComparedColleges(nextList);
    setComparedColleges(nextList);
    return true;
  }, []);

  const removeCollege = useCallback((id: string) => {
    const current = getStoredComparedColleges();
    const nextList = current.filter((c) => c.id !== id);
    saveStoredComparedColleges(nextList);
    setComparedColleges(nextList);
  }, []);

  const toggleCollege = useCallback((inst: any) => {
    if (!inst?.id) return false;
    const current = getStoredComparedColleges();
    const exists = current.some((c) => c.id === inst.id);
    if (exists) {
      removeCollege(inst.id);
      return false;
    } else {
      return addCollege(inst);
    }
  }, [addCollege, removeCollege]);

  const clearAll = useCallback(() => {
    saveStoredComparedColleges([]);
    setComparedColleges([]);
  }, []);

  const isSelected = useCallback(
    (id: string) => comparedColleges.some((c) => c.id === id),
    [comparedColleges]
  );

  return {
    comparedColleges,
    isLoaded,
    maxLimit: MAX_COMPARE_LIMIT,
    isFull: comparedColleges.length >= MAX_COMPARE_LIMIT,
    count: comparedColleges.length,
    addCollege,
    removeCollege,
    toggleCollege,
    clearAll,
    isSelected,
  };
}
