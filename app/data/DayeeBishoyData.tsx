// app/data/DayeeBishoyData.ts
import * as Yup from "yup";

export interface DayeeBishoyFormValues {
  sohojogiDayeToiri: number;
}

export const initialFormData: DayeeBishoyFormValues = {
  sohojogiDayeToiri: 0,
};

export const validationSchema = Yup.object({
  sohojogiDayeToiri: Yup.number()
    .min(0, "Value cannot be negative")
    .integer("Must be a whole number")
    .required("This field is required"),
});