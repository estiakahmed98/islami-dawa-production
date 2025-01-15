import * as Yup from "yup";

// Type for form data
interface FormData {
  jamatBerHoise: number | string;
  jamatSathi: string;
  editorContent: string;
}

// Initial form data
export const initialFormData: FormData = {
  jamatBerHoise: "",
  jamatSathi: "",
  editorContent: "",
};

// Validation schema using Yup
export const validationSchema = Yup.object().shape({
  jamatBerHoise: Yup.number()
    .typeError("Jamat Field must be a number")
    .required("Jamat Field is required"),
  jamatSathi: Yup.string().required("Jamat Sathi Field is required"),
});
