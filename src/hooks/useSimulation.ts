import { useState, useEffect, useRef } from 'react';
import { Home, GridState } from '../types';

const NUM_HOMES = 50;
const NUM_SOLAR = 20;
const NUM_EV = 15;

// TNB ToU Rates (Simplified)
const OFF_PEAK_PRICE = 0.22; // 10 PM - 8 AM
const MID_PEAK_PRICE = 0.33; // 8 AM - 7 PM
const CRITICAL_PEAK_PRICE = 0.50; // 7 PM - 10 PM

const generateInitialHomes = (): Home[] => {
  const homes: Home[] = [];
  let solarCount = 0;
  let evCount = 0;

  for (let i = 0; i < NUM_HOMES; i++) {
    const hasSolar = solarCount < NUM_SOLAR && Math.random() > 0.5 || (NUM_SOLAR - solarCount >= NUM_HOMES - i);
    if (hasSolar) solarCount++;

    const hasEV = evCount < NUM_EV && Math.random() > 0.5 || (NUM_EV - evCount >= NUM_HOMES - i);
    if (hasEV) evCount++;

    homes.push({
      id: `H${i.toString().padStart(2, '0')}`,
      hasSolar,
      hasEV,
      baseLoad: 0,
      solarOutput: 0,
      evChargeLevel: hasEV ? Math.random() * 50 + 50 : 0, // Start 50-100%
      evChargingRate: 0,
      netLoad: 0,
      isV2GActive: false,
    });
  }
  return homes;
};

export const useSimulation = () => {
  const [homes, setHomes] = useState<Home[]>(generateInitialHomes());
  const [gridState, setGridState] = useState<GridState>({
    time: 0,
    price: OFF_PEAK_PRICE,
    totalLoad: 0,
    totalSolar: 0,
    totalV2G: 0,
    totalSavings: 0,
    isPeak: false,
  });
  const [isRunning, setIsRunning] = useState(true);
  const [speed, setSpeed] = useState(1000); // ms per hour

  const savingsRef = useRef(0);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setGridState((prev) => {
        const nextTime = (prev.time + 1) % 24;
        
        // Determine Price
        let price = OFF_PEAK_PRICE;
        let isPeak = false;
        if (nextTime >= 19 && nextTime < 22) {
          price = CRITICAL_PEAK_PRICE;
          isPeak = true;
        } else if (nextTime >= 8 && nextTime < 19) {
          price = MID_PEAK_PRICE;
        }

        // Update Homes
        let totalLoad = 0;
        let totalSolar = 0;
        let totalV2G = 0;
        let currentSavings = 0;

        const updatedHomes = homes.map(home => {
          // Base Load (AC heavy in evening)
          let baseLoad = 0.5 + Math.random() * 0.5; // Night
          if (nextTime >= 7 && nextTime < 18) baseLoad = 1 + Math.random(); // Day
          if (nextTime >= 18 && nextTime < 23) baseLoad = 3 + Math.random() * 2; // Evening AC

          // Solar Output (Bell curve around noon)
          let solarOutput = 0;
          if (home.hasSolar && nextTime >= 7 && nextTime <= 18) {
             const peak = 12;
             const variance = 3;
             solarOutput = 4 * Math.exp(-Math.pow(nextTime - peak, 2) / (2 * Math.pow(variance, 2)));
             // Add some cloud cover randomness
             solarOutput *= (0.7 + Math.random() * 0.3);
          }

          // EV Logic
          let evChargingRate = 0;
          let isV2GActive = false;
          let evChargeLevel = home.evChargeLevel;

          if (home.hasEV) {
            if (isPeak && evChargeLevel > 30) {
              // V2G: Discharge to offset base load
              isV2GActive = true;
              evChargingRate = -Math.min(baseLoad, 5); // Max 5kW discharge
              evChargeLevel += (evChargingRate / 50) * 100; // Assuming 50kWh battery
              
              // Calculate savings: (kW discharged) * (Peak Price - Off Peak Price)
              currentSavings += Math.abs(evChargingRate) * (CRITICAL_PEAK_PRICE - OFF_PEAK_PRICE);
            } else if (!isPeak && evChargeLevel < 100 && nextTime < 7) {
              // Charge at night
              evChargingRate = 7; // 7kW charger
              evChargeLevel = Math.min(100, evChargeLevel + (evChargingRate / 50) * 100);
            } else if (home.hasSolar && solarOutput > baseLoad && evChargeLevel < 100) {
              // Charge from excess solar
              evChargingRate = Math.min(7, solarOutput - baseLoad);
              evChargeLevel = Math.min(100, evChargeLevel + (evChargingRate / 50) * 100);
            }
          }

          const netLoad = baseLoad - solarOutput + evChargingRate;

          totalLoad += baseLoad;
          totalSolar += solarOutput;
          if (isV2GActive) totalV2G += Math.abs(evChargingRate);

          return {
            ...home,
            baseLoad,
            solarOutput,
            evChargeLevel,
            evChargingRate,
            netLoad,
            isV2GActive
          };
        });

        setHomes(updatedHomes);
        savingsRef.current += currentSavings;

        return {
          time: nextTime,
          price,
          totalLoad,
          totalSolar,
          totalV2G,
          totalSavings: savingsRef.current,
          isPeak
        };
      });
    }, speed);

    return () => clearInterval(interval);
  }, [isRunning, speed, homes]);

  return { homes, gridState, isRunning, setIsRunning, speed, setSpeed };
};
