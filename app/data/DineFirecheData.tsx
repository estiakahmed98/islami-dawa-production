import * as Yup from "yup";

// Initial form data with TypeScript interface
export interface FormValues {
  omuslimKalemaPoreche: string;
  murtadDineFireasa: string;
  editorContent: string;
}

export const initialFormData: FormValues = {
  omuslimKalemaPoreche: "",
  murtadDineFireasa: "",
  editorContent: "",
};

// Validation schema using Yup
export const validationSchema = Yup.object({
  omuslimKalemaPoreche: Yup.string().required("This Field is required"),
  murtadDineFireasa: Yup.string().required("This Field is required"),
});
