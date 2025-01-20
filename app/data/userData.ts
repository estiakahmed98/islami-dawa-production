export type User = {
  id: string;
  name: string;
  role: string;
  division: string;
  district: string;
  upazila: string;
  union: string;
  area: string;
  phone: string;
  email: string;
  password: string;
};

export const userData: Record<string, User> = {
  "akashrahman@gmail.com": {
    id: "1737007894334",
    name: "Akash Islam",
    role: "daye",
    division: "55",
    district: "49",
    upazila: "448",
    union: "4118",
    area: "Mirpur",
    phone: "0123456789",
    email: "akashrahman@gmail.com",
    password: "12345",
  },
  "akashrahman123@gmail.com": {
    id: "1737007917845",
    name: "Akash Islam",
    role: "daye",
    division: "55",
    district: "49",
    upazila: "448",
    union: "4118",
    area: "Mirpur",
    phone: "0123456789",
    email: "akashrahman123@gmail.com",
    password: "12345",
  },
  "mamun123@gmail.com": {
    id: "1737008420598",
    name: "Mamu or uddin",
    role: "divisionadmin",
    division: "20",
    district: "22",
    upazila: "84",
    union: "857",
    area: "Mirpur",
    phone: "0123456789",
    email: "mamun123@gmail.com",
    password: "12345",
  },
};
