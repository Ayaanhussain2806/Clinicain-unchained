import { Router, type IRouter } from "express";

const router: IRouter = Router();

const INDIAN_PLATE_REGEX = /^[A-Z]{2}[\s-]?\d{1,2}[\s-]?[A-Z]{1,2}[\s-]?\d{1,4}$/i;

function validateIndianPlate(plate: string): boolean {
  return INDIAN_PLATE_REGEX.test(plate.replace(/\s/g, ""));
}

function formatPlate(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

router.get("/vehicle/check/:regNo", async (req, res): Promise<void> => {
  const rawReg = req.params.regNo?.trim();

  if (!rawReg) {
    res.status(400).json({ error: "Registration number is required" });
    return;
  }

  const regNo = formatPlate(rawReg);

  if (!validateIndianPlate(regNo)) {
    res.status(422).json({
      valid: false,
      error: "Invalid vehicle registration number format",
      hint: "Expected format: DL 01 AB 1234",
    });
    return;
  }

  const apiKey = process.env.VEHICLE_API_KEY;
  const apiHost = process.env.VEHICLE_API_HOST ?? "rto-vehicle-information-india.p.rapidapi.com";

  if (!apiKey) {
    res.json({
      valid: true,
      regNo,
      source: "format-check",
      message: "Registration number format is valid (real-time lookup not configured)",
    });
    return;
  }

  try {
    const url = `https://${apiHost}/getVehicleInfo?reg_no=${encodeURIComponent(regNo)}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": apiHost,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      res.status(response.status).json({
        valid: false,
        error: "Vehicle lookup failed",
        detail: errText,
      });
      return;
    }

    const data = await response.json() as Record<string, unknown>;

    const ownerName: string =
      (data.owner_name as string) ??
      (data.ownerName as string) ??
      (data.rc_owner_name as string) ??
      "";

    const vehicleModel: string =
      (data.rc_vehicle_model as string) ??
      (data.vehicle_model as string) ??
      (data.model as string) ??
      "";

    const fuelType: string =
      (data.rc_fuel_desc as string) ??
      (data.fuel_type as string) ??
      "";

    const vehicleClass: string =
      (data.rc_vch_cd_desc as string) ??
      (data.vehicle_class as string) ??
      "";

    const registrationDate: string =
      (data.rc_regn_dt as string) ??
      (data.registration_date as string) ??
      "";

    const fitnessUpto: string =
      (data.rc_fit_upto as string) ??
      (data.fitness_upto as string) ??
      "";

    res.json({
      valid: true,
      regNo,
      source: "live",
      ownerName,
      vehicleModel,
      fuelType,
      vehicleClass,
      registrationDate,
      fitnessUpto,
      raw: data,
    });
  } catch (err: any) {
    res.status(502).json({
      valid: false,
      error: "Vehicle lookup service unavailable",
      detail: err?.message,
    });
  }
});

export default router;
