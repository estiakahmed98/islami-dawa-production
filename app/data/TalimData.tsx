import * as Yup from "yup";

// Initial form data with TypeScript type annotation
export const initialFormData: {
  mohilaTalim: string;
  TalimOngshoGrohon: string;
  editorContent: string;
} = {
  mohilaTalim: "",
  TalimOngshoGrohon: "",
  editorContent: "",
};

// Validation schema using Yup with TypeScript support
export const validationSchema = Yup.object().shape({
  mohilaTalim: Yup.string().required("This field is required"),
  TalimOngshoGrohon: Yup.string().required("This field is required"),
});
