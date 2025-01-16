"use client";

import React, { useEffect, useState } from "react";
import { divisions, districts, upazilas, unions } from "../app/data/bangla";
import {
  divisions_en,
  districts_en,
  upazilas_en,
  unions_en,
} from "@/app/data/english";
import { toast } from "sonner";

// Types
type Division = {
  value: number;
  title: string;
};

type District = {
  value: number;
  title: string;
};

type Upazila = {
  value: number;
  title: string;
};

type Union = {
  value: number;
  title: string;
};

interface LocationDropdownProps {
  language?: "bn" | "en";
  email: string; // User's email
}

// Utility functions
function getAllDivision(type: "bn" | "en"): Division[] {
  return type === "en" ? divisions_en : divisions;
}

function getAllDistrict(type: "bn" | "en"): Record<number, District[]> {
  return type === "en" ? districts_en : districts;
}

function getUpazilas(districtValue: number, type: "bn" | "en"): Upazila[] {
  if (!districtValue) return [];
  return type === "en"
    ? upazilas_en[districtValue] || []
    : upazilas[districtValue] || [];
}

function getUnions(upazilaValue: number, type: "bn" | "en"): Union[] {
  if (!upazilaValue) return [];
  return type === "en"
    ? unions_en[upazilaValue] || []
    : unions[upazilaValue] || [];
}

const LocationDropdown: React.FC<LocationDropdownProps> = ({
  language = "bn",
  email,
}) => {
  const [selectedDivision, setSelectedDivision] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedUpazila, setSelectedUpazila] = useState<string>("");
  const [selectedUnion, setSelectedUnion] = useState<string>("");
  const [districts, setDistricts] = useState<District[]>([]);
  const [upazilas, setUpazilas] = useState<Upazila[]>([]);
  const [unions, setUnions] = useState<Union[]>([]);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const response = await fetch(`/api/location?email=${email}`);
        if (response.ok) {
          const data = await response.json();
          const { division, district, upazila, union } = data.location;
          setSelectedDivision(division);
          setSelectedDistrict(district);
          setSelectedUpazila(upazila);
          setSelectedUnion(union);

          const divisionDistricts =
            getAllDistrict(language)[parseInt(division, 10)] || [];
          setDistricts(divisionDistricts);

          const districtUpazilas = getUpazilas(
            parseInt(district, 10),
            language
          );
          setUpazilas(districtUpazilas);

          const upazilaUnions = getUnions(parseInt(upazila, 10), language);
          setUnions(upazilaUnions);
        }
      } catch (error) {
        console.error("Error fetching location:", error);
      }
    };
    fetchLocation();
  }, [email, language]);

  const handleSave = async () => {
    try {
      const response = await fetch("/api/location", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          division: selectedDivision,
          district: selectedDistrict,
          upazila: selectedUpazila,
          union: selectedUnion,
        }),
      });

      if (response.ok) {
        toast.success("Location saved successfully!");
      } else {
        toast.error("Failed to save location.");
      }
    } catch (error) {
      console.error("Error saving location:", error);
      toast.error("Error saving location.");
    }
  };

  return (
    <div className="grid lg:flex gap-4 items-center flex-wrap">
      {/* Division Dropdown */}
      <select
        value={selectedDivision}
        className="p-2 border-2 rounded-lg grow"
        onChange={(e) => {
          const divisionValue = e.target.value;
          setSelectedDivision(divisionValue);
          const divisionDistricts =
            getAllDistrict(language)[parseInt(divisionValue, 10)] || [];
          setDistricts(divisionDistricts);
          setSelectedDistrict("");
          setUpazilas([]);
          setUnions([]);
        }}
      >
        <option value="">Select Division</option>
        {getAllDivision(language).map((division) => (
          <option key={division.value} value={division.value}>
            {division.title}
          </option>
        ))}
      </select>

      {/* District Dropdown */}
      <select
        value={selectedDistrict}
        className="p-2 border-2 rounded-lg grow"
        onChange={(e) => {
          const districtValue = e.target.value;
          setSelectedDistrict(districtValue);
          const districtUpazilas = getUpazilas(
            parseInt(districtValue, 10),
            language
          );
          setUpazilas(districtUpazilas);
          setSelectedUpazila("");
          setUnions([]);
        }}
        disabled={!districts.length}
      >
        <option value="">Select District</option>
        {districts.map((district) => (
          <option key={district.value} value={district.value}>
            {district.title}
          </option>
        ))}
      </select>

      {/* Upazila Dropdown */}
      <select
        value={selectedUpazila}
        className="p-2 border-2 rounded-lg grow"
        onChange={(e) => {
          const upazilaValue = e.target.value;
          setSelectedUpazila(upazilaValue);
          const upazilaUnions = getUnions(parseInt(upazilaValue, 10), language);
          setUnions(upazilaUnions);
        }}
        disabled={!upazilas.length}
      >
        <option value="">Select Upazila</option>
        {upazilas.map((upazila) => (
          <option key={upazila.value} value={upazila.value}>
            {upazila.title}
          </option>
        ))}
      </select>

      {/* Union Dropdown */}
      <select
        value={selectedUnion}
        className="p-2 border-2 rounded-lg grow"
        onChange={(e) => setSelectedUnion(e.target.value)}
        disabled={!unions.length}
      >
        <option value="">Select Union</option>
        {unions.map((union) => (
          <option key={union.value} value={union.value}>
            {union.title}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LocationDropdown;
