import { useSnackbar } from "notistack";
import { useEffect } from "react";

const collectErrorMessages = (errors: any): string[] => {
  if (errors == null) return [];
  if (typeof errors === "string") return [errors];
  if (typeof errors.message === "string") return [errors.message];
  if (typeof errors === "object" && !Array.isArray(errors)) {
    return Object.values(errors).flatMap(collectErrorMessages);
  }
  return [];
};

const getFirstErrorKey = (errors: any): string | null => {
  if (errors == null || typeof errors !== "object" || Array.isArray(errors))
    return null;
  const keys = Object.keys(errors);
  if (keys.length === 0) return null;
  const first = errors[keys[0]];
  if (typeof first === "string") return keys[0];
  if (typeof first?.message === "string") return keys[0];
  const nested = getFirstErrorKey(first);
  return nested ? `${keys[0]}.${nested}` : keys[0];
};

const FormErrorNotification = ({ formik }: { formik: any }) => {
  const { isValid, isSubmitting, errors } = formik;
  const { enqueueSnackbar } = useSnackbar();

  const focusOnFirstFieldOnError = (errors: any) => {
    const firstKey = getFirstErrorKey(errors);
    if (firstKey) {
      const firstErrorField = document.querySelector(`[name="${firstKey}"]`);
      if (firstErrorField) {
        (firstErrorField as HTMLElement).scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  };

  useEffect(() => {
    if (!isValid && isSubmitting) {
      focusOnFirstFieldOnError(errors);
      const messages = collectErrorMessages(errors);
      if (messages.length > 0) {
        const errorText =
          messages.length === 1 ? messages[0] : messages.join("\n");
        enqueueSnackbar(errorText, {
          variant: "error",
          style: { whiteSpace: "pre-line" },
        });
      }
    }
  }, [isSubmitting, isValid, errors]);

  return null;
};

export default FormErrorNotification;
