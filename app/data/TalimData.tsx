import * as Yup from "yup";

// Initial form data with TypeScript type annotation
export const initialFormData: {
  mohilaTalim: string;
  mohilaOnshogrohon: string;
  editorContent: string;
} = {
  mohilaTalim: "",
  mohilaOnshogrohon: "",
  editorContent: "",
};

// Validation schema using Yup with TypeScript support
export const validationSchema = Yup.object().shape({
  mohilaTalim: Yup.string().required("This field is required"),
  mohilaOnshogrohon: Yup.string().required("This field is required"),
});
