export interface Home {
  id: string;
  hasSolar: boolean;
  hasEV: boolean;
  baseLoad: number; // kW
  solarOutput: number; // kW
  evChargeLevel: number; // %
  evChargingRate: number; // kW (positive = charging, negative = discharging)
  netLoad: number; // kW (positive = drawing from grid, negative = exporting)
  isV2GActive: boolean;
  isAnomaly: boolean;
  aiV2GLogic: string;
}

export interface GridState {
  time: number; // 0-23
  price: number; // RM/kWh
  totalLoad: number; // kW
  totalSolar: number; // kW
  totalV2G: number; // kW
  totalSavings: number; // RM
  isPeak: boolean;
}
