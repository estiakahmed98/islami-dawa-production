"use client";

import React, { useState } from "react";
import { divisions, districts, upazilas, unions } from "@/app/data/bangla";
import {
  divisions_en,
  districts_en,
  upazilas_en,
  unions_en,
} from "@/app/data/english";

// Define the type for each location level
interface Location {
  value: string;
  title: string;
}

// Utility functions with TypeScript annotations
function getAllDivision(type: string): Location[] {
  return type === "en" ? divisions_en : divisions;
}

function getAllDistrict(type: string): { [key: string]: Location[] } {
  return type === "en" ? districts_en : districts;
}

function getUpazilas(districtValue: string, type: string): Location[] {
  if (!districtValue) return [];
  return type === "en"
    ? upazilas_en[districtValue] || []
    : upazilas[districtValue] || [];
}

function getUnions(upazilaValue: string, type: string): Location[] {
  if (!upazilaValue) return [];
  return type === "en"
    ? unions_en[upazilaValue] || []
    : unions[upazilaValue] || [];
}

// Props for the component
interface LocationDropdownProps {
  language?: "bn" | "en"; // Defaults to Bangla ("bn")
}

// Dropdown Component
const LocationDropdown: React.FC<LocationDropdownProps> = ({
  language = "bn",
}) => {
  const [selectedDivision, setSelectedDivision] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedUpazila, setSelectedUpazila] = useState<string>("");
  const [districts, setDistricts] = useState<Location[]>([]);
  const [upazilas, setUpazilas] = useState<Location[]>([]);
  const [unions, setUnions] = useState<Location[]>([]);
  const [finalDivision, setFinalDivision] = useState<string>("");

  const handleDivisionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const divisionValue = e.target.value;
    const formattedValue = divisionValue.split("_");
    setSelectedDivision(formattedValue[0]);

    const divisionName = getAllDivision(language).find(
      (division) => division.value === formattedValue[0]
    );

    setFinalDivision(divisionName?.title || "");

    const divisionDistricts = getAllDistrict(language)[formattedValue[0]];
    setDistricts(divisionDistricts || []);
    setSelectedDistrict("");
    setUpazilas([]);
    setUnions([]);
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const districtValue = e.target.value;
    const formattedValue = districtValue.split("_");
    setSelectedDistrict(formattedValue[0]);

    const districtUpazilas = getUpazilas(formattedValue[0], language);
    setUpazilas(districtUpazilas || []);
    setSelectedUpazila("");
    setUnions([]);
  };

  const handleUpazilaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const upazilaValue = e.target.value;
    const formattedValue = upazilaValue.split("_");
    setSelectedUpazila(formattedValue[0]);

    const upazilaUnions = getUnions(formattedValue[0], language);
    setUnions(upazilaUnions || []);
  };

  return (
    <div className="space-y-4">
      {/* Division Dropdown */}
      <div>
        <label
          htmlFor="division"
          className="block text-sm font-medium text-gray-700"
        >
          Division
        </label>
        <select
          id="division"
          name="division"
          onChange={handleDivisionChange}
          required
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="" disabled>
            Select Division
          </option>
          {getAllDivision(language).map((division, index) => (
            <option key={index} value={`${division.value}_${division.title}`}>
              {division.title}
            </option>
          ))}
        </select>
      </div>

      {/* District Dropdown */}
      <div>
        <label
          htmlFor="district"
          className="block text-sm font-medium text-gray-700"
        >
          District
        </label>
        <select
          id="district"
          name="district"
          onChange={handleDistrictChange}
          required
          disabled={!districts.length}
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="" disabled>
            Select District
          </option>
          {districts.map((district, index) => (
            <option key={index} value={`${district.value}_${district.title}`}>
              {district.title}
            </option>
          ))}
        </select>
      </div>

      {/* Upazila Dropdown */}
      <div>
        <label
          htmlFor="upazila"
          className="block text-sm font-medium text-gray-700"
        >
          Upazila
        </label>
        <select
          id="upazila"
          name="upazila"
          onChange={handleUpazilaChange}
          required
          disabled={!Array.isArray(upazilas) || upazilas.length === 0}
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="" disabled>
            Select Upazila
          </option>
          {Array.isArray(upazilas) &&
            upazilas.map((upazila, index) => (
              <option key={index} value={`${upazila.value}_${upazila.title}`}>
                {upazila.title}
              </option>
            ))}
        </select>
      </div>

      {/* Union Dropdown */}
      <div>
        <label
          htmlFor="union"
          className="block text-sm font-medium text-gray-700"
        >
          Union
        </label>
        <select
          id="tunion"
          name="tunion"
          required
          disabled={!unions.length}
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="" disabled>
            Select Union
          </option>
          {unions.map((tunion, index) => (
            <option key={index} value={`${tunion.value}_${tunion.title}`}>
              {tunion.title}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default LocationDropdown;
