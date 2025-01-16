import * as Yup from "yup";

// Define the shape of the initial form data
export interface DayeeBishoyFormValues {
  sohojogiDayeToiri: number | "";
  editorContent: string;
}

// Initial form data
export const initialFormData: DayeeBishoyFormValues = {
  sohojogiDayeToiri: "",
  editorContent: "",
};

// Validation schema using Yup
export const validationSchema = Yup.object().shape({
  sohojogiDayeToiri: Yup.number()
    .typeError("Sohojogi Dayee Field must be a number")
    .required("Sohojogi Dayee Field is required"),
});
