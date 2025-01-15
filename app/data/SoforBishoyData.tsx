import * as Yup from "yup";

// Initial form data with TypeScript interface
export interface FormValues {
  madrasaVisit: string;
  moktobVisit: string;
  schoolCollegeVisit: string;
  editorContent: string;
}

export const initialFormData: FormValues = {
  madrasaVisit: "",
  moktobVisit: "",
  schoolCollegeVisit: "",
  editorContent: "",
};

// Validation schema using Yup
export const validationSchema = Yup.object({
  madrasaVisit: Yup.string().required("This Field is required"),
  moktobVisit: Yup.string().required("This Field is required"),
  schoolCollegeVisit: Yup.string().required("This Field is required"),
});
