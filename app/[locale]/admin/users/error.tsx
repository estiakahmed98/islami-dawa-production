"use client";

import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useTranslations } from "next-intl";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("Common");
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="grid h-full place-items-center">
      <div className="space-y-4 text-center">
        <h2 className="text-lg font-medium">{t("error")}</h2>
        <Button
          onClick={
            // Attempt to recover by trying to re-render the segment
            () => reset()
          }
          variant="outline"
        >
          {t("tryAgain")}
        </Button>
      </div>
    </div>
  );
}
