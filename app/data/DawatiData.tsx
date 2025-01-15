import * as Yup from "yup";

// Define the type for form values
export interface DawatiFormData {
  nonMuslimDawat: string;
  murtadDawat: string;
  alemderSatheyMojlish: string;
  publicSatheyMojlish: string;
  nonMuslimSaptahikGasht: string;
  editorContent: string;
}

// Initial form data
export const initialFormData: DawatiFormData = {
  nonMuslimDawat: "",
  murtadDawat: "",
  alemderSatheyMojlish: "",
  publicSatheyMojlish: "",
  nonMuslimSaptahikGasht: "",
  editorContent: "",
};

// Validation schema using Yup
export const validationSchema = Yup.object().shape({
  nonMuslimDawat: Yup.string().required("Dawat Mojlish Field is required"),
  murtadDawat: Yup.string().required("Dawat Gurutto Field is required"),
  alemderSatheyMojlish: Yup.string().required(
    "Dawat Prosikkhon Field is required"
  ),
  publicSatheyMojlish: Yup.string().required(
    "Dawat Kormosala Field is required"
  ),
  nonMuslimSaptahikGasht: Yup.string().required(
    "Jumar Mojlish Field is required"
  ),
});
