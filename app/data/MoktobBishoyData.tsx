import * as Yup from "yup";

// Define the type for form data
export interface FormData {
  MoktobChalu: number | string;
  MoktobAdmit: string;
  NewMoktob: string;
  Sikkha: string;
  TotalStudent: string;
  TotalSikkha: string;
  GurdianMeeting: string;
  TotalAgeSikkha: string;
  MadrasahAdmit: string;
  NewMuslim: string;
  editorContent: string;
}

// Initial form data
export const initialFormData: FormData = {
  MoktobChalu: "",
  MoktobAdmit: "",
  NewMoktob: "",
  Sikkha: "",
  TotalStudent: "",
  TotalSikkha: "",
  GurdianMeeting: "",
  TotalAgeSikkha: "",
  MadrasahAdmit: "",
  NewMuslim: "",
  editorContent: "",
};

// Validation schema using Yup
export const validationSchema = Yup.object().shape({
  MoktobChalu: Yup.number()
    .typeError("This field must be a number")
    .required("This field is required"),
  MoktobAdmit: Yup.string().required("This field is required"),
  NewMoktob: Yup.string().required("This field is required"),
  Sikkha: Yup.string().required("This field is required"),
  TotalStudent: Yup.string().required("This field is required"),
  TotalSikkha: Yup.string().required("This field is required"),
  GurdianMeeting: Yup.string().required("This field is required"),
  TotalAgeSikkha: Yup.string().required("This field is required"),
  MadrasahAdmit: Yup.string().required("This field is required"),
  NewMuslim: Yup.string().required("This field is required"),
});
