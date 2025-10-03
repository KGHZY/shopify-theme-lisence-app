import { json } from "@remix-run/node";
import { generatePulseLicenseKey, generateMultiplePulseLicenseKeys } from "../utils/pulseLicense";

export async function action({ request }) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const formData = await request.formData();
    const count = parseInt(formData.get("count")) || 1;

    if (count > 100) {
      return json({
        success: false,
        error: "Cannot generate more than 100 licenses at once"
      }, { status: 400 });
    }

    if (count < 1) {
      return json({
        success: false,
        error: "Count must be at least 1"
      }, { status: 400 });
    }

    // Generate PULSE license keys
    const licenseKeys = generateMultiplePulseLicenseKeys(count);

    return json({
      success: true,
      message: `Generated ${count} PULSE license key${count > 1 ? 's' : ''}`,
      licenseKeys: licenseKeys.map((key, index) => ({
        id: index + 1,
        licenseKey: key,
        format: "PULSE-XXXX-XXXX-SSSS"
      })),
      format: "PULSE-XXXX-XXXX-SSSS",
      description: "PULSE format with random part and HMAC signature"
    });

  } catch (error) {
    console.error("PULSE license generation error:", error);
    return json(
      { 
        success: false, 
        error: "Internal server error" 
      },
      { status: 500 }
    );
  }
}

export async function loader({ request }) {
  // Generate a single PULSE license key for testing
  const licenseKey = generatePulseLicenseKey();
  
  return json({
    success: true,
    licenseKey,
    format: "PULSE-XXXX-XXXX-SSSS",
    description: "PULSE format with random part and HMAC signature",
    example: licenseKey
  });
}
