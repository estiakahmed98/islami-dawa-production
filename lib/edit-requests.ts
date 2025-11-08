// This file contains functions for managing edit requests

export interface EditRequestLocation {
  division: string;
  district: string;
  upazila: string;
  union: string;
}

export interface EditRequest {
  id?: string;
  email: string;
  name: string;
  phone: string;
  date: string;
  reason: string;
  location: EditRequestLocation;
  role: string;
  status: "pending" | "approved" | "rejected" | "completed";
  editedOnce?: boolean;
  createdAt: string;
}

// In a real application, these would interact with a database
// For this example, we'll use localStorage to simulate persistence

// Create a new edit request
export async function createEditRequest(
  request: EditRequest
): Promise<EditRequest> {
  try {
    // In a real app, this would be a database call
    const requests = getStoredRequests();
    const newRequest = {
      ...request,
      id: generateId(),
    };

    requests.push(newRequest);
    storeRequests(requests);

    return newRequest;
  } catch (error) {
    console.error("Error creating edit request:", error);
    throw new Error("Failed to create edit request");
  }
}

// Get all edit requests
export async function getAllEditRequests(): Promise<EditRequest[]> {
  return getStoredRequests();
}

// Get edit requests by email
export async function getEditRequestsByEmail(
  email: string
): Promise<EditRequest[]> {
  const requests = getStoredRequests();
  return requests.filter((req) => req.email === email);
}

// Update edit request status
export async function updateEditRequestStatus(
  id: string,
  status: "pending" | "approved" | "rejected" | "completed"
): Promise<EditRequest | null> {
  const requests = getStoredRequests();
  const index = requests.findIndex((req) => req.id === id);

  if (index === -1) return null;

  requests[index].status = status;
  storeRequests(requests);

  return requests[index];
}

// Search edit requests
export async function searchEditRequests(
  query: string
): Promise<EditRequest[]> {
  const requests = getStoredRequests();
  const lowerQuery = query.toLowerCase();

  return requests.filter(
    (req) =>
      req.name.toLowerCase().includes(lowerQuery) ||
      req.email.toLowerCase().includes(lowerQuery) ||
      req.phone.includes(lowerQuery)
  );
}

// Helper functions
function getStoredRequests(): EditRequest[] {
  if (typeof window === "undefined") return [];

  const stored = localStorage.getItem("editRequests");
  return stored ? JSON.parse(stored) : [];
}

function storeRequests(requests: EditRequest[]): void {
  if (typeof window === "undefined") return;

  localStorage.setItem("editRequests", JSON.stringify(requests));
}

function generateId(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}
