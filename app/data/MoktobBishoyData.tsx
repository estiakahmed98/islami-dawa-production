export const initialFormData = {
  notunMoktobChalu: 0,
  totalMoktob: 0,
  totalStudent: 0,
  obhibhabokConference: 0,
  moktoThekeMadrasaAdmission: 0,
  notunBoyoskoShikkha: 0,
  totalBoyoskoShikkha: 0,
  boyoskoShikkhaOnshogrohon: 0,
  newMuslimeDinerFikir: 0,
};

import * as Yup from "yup";

export const validationSchema = Yup.object({
  notunMoktobChalu: Yup.number().min(0).required(),
  totalMoktob: Yup.number().min(0).required(),
  totalStudent: Yup.number().min(0).required(),
  obhibhabokConference: Yup.number().min(0).required(),
  moktoThekeMadrasaAdmission: Yup.number().min(0).required(),
  notunBoyoskoShikkha: Yup.number().min(0).required(),
  totalBoyoskoShikkha: Yup.number().min(0).required(),
  boyoskoShikkhaOnshogrohon: Yup.number().min(0).required(),
  newMuslimeDinerFikir: Yup.number().min(0).required(),
});
