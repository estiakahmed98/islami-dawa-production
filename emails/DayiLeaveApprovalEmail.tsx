import { Html } from "@react-email/components";
import { useTranslations } from "next-intl";

interface ApprovalEmailProps {
  name: string;
  leaveType: string;
  leaveDates: string;
  footerText?: string;
}

export default function LeaveApprovalEmail({
  name,
  leaveType,
  leaveDates,
  footerText,
}: ApprovalEmailProps) {
  const t = useTranslations("header");
  return (
    <Html>
      <div
        style={{
          fontFamily: "Arial, sans-serif",
          backgroundColor: "#f3f4f6",
          padding: "20px",
          textAlign: "center",
        }}
      >
        {/* Main Container */}
        <div
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            backgroundColor: "#ffffff",
            borderRadius: "8px",
            overflow: "hidden",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          {/* Header */}
          <div
            style={{
              backgroundColor: "#047857",
              color: "#ffffff",
              padding: "20px",
              textAlign: "center",
            }}
          >
            <h1>{t("instituteName")}</h1>
            <h1 style={{ color: "#ffffff", fontSize: "24px", fontWeight: "bold", margin: 0 }}>
              {t("leaveSubjectApproved")}
            </h1>
          </div>

          {/* Content */}
          <div style={{ padding: "20px", textAlign: "left" }}>
            <p
              style={{
                fontSize: "16px",
                lineHeight: "1.5",
                color: "#333333",
                marginBottom: "20px",
              }}
            >
              <strong>{name}</strong>, {t("leaveSubjectApproved")}
            </p>

            {/* Leave Details */}
            <div
              style={{
                backgroundColor: "#f9f9f9",
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                padding: "15px",
                marginBottom: "15px",
              }}
            >
              <p
                style={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "#333333",
                  marginBottom: "10px",
                }}
              >
                Leave Type:
              </p>
              <p style={{ fontSize: "16px", color: "#555555", marginBottom: 0 }}>
                {leaveType}
              </p>
            </div>

            <div
              style={{
                backgroundColor: "#f9f9f9",
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                padding: "15px",
                marginBottom: "15px",
              }}
            >
              <p
                style={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "#333333",
                  marginBottom: "10px",
                }}
              >
                Leave Dates:
              </p>
              <p style={{ fontSize: "16px", color: "#555555", marginBottom: 0 }}>
                {leaveDates}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              backgroundColor: "#1f2937",
              color: "#ffffff",
              padding: "20px",
              textAlign: "center",
              fontSize: "14px",
              lineHeight: "1.5",
            }}
          >
            <p style={{ margin: 0 }}>
              {footerText || "Thank you for your time and dedication."}
            </p>
            <div style={{ marginTop: "10px" }}>
              <a
                href="#"
                style={{
                  color: "#ffffff",
                  textDecoration: "none",
                  marginRight: "10px",
                }}
              >
                Google Play
              </a>
              |
              <a
                href="#"
                style={{
                  color: "#ffffff",
                  textDecoration: "none",
                  marginLeft: "10px",
                }}
              >
                App Store
              </a>
            </div>
          </div>
        </div>
      </div>
    </Html>
  );
}
