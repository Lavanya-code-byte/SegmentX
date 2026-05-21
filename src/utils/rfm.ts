// src/utils/rfm.ts

export interface Customer {
  id: string;
  name: string;
  lastPurchaseDate: string;
  totalOrders: number;
  totalSpent: number;
  // Computed RFM values
  rScore?: number;
  fScore?: number;
  mScore?: number;
  segment?: string;
}

const FIRST_NAMES = ["Alex", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Sam", "Jamie", "Drew", "Avery", "Mia", "Liam", "Noah", "Olivia", "Emma"];
const LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez"];

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateMockData(count: number = 100): Customer[] {
  const data: Customer[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const daysAgo = randomInt(1, 365);
    const lastPurchase = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    
    // Create some correlation: frequent buyers spend more
    const totalOrders = randomInt(1, 50);
    const avgOrderValue = randomInt(20, 200);
    const totalSpent = totalOrders * avgOrderValue;

    data.push({
      id: `CUST-${(i + 1).toString().padStart(4, '0')}`,
      name: `${FIRST_NAMES[randomInt(0, FIRST_NAMES.length - 1)]} ${LAST_NAMES[randomInt(0, LAST_NAMES.length - 1)]}`,
      lastPurchaseDate: lastPurchase.toISOString().split('T')[0],
      totalOrders,
      totalSpent
    });
  }
  return data;
}

export function calculateRFM(customers: Customer[]): Customer[] {
  if (customers.length === 0) return [];

  const now = new Date();

  // 1. Calculate Recency (days since last purchase)
  const customersWithRecency = customers.map(c => {
    const lastPurchase = new Date(c.lastPurchaseDate);
    const diffTime = Math.abs(now.getTime() - lastPurchase.getTime());
    const recencyDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return { ...c, recencyDays };
  });

  // Helper to calculate quintiles (1-5 score)
  const getQuintiles = (arr: number[]) => {
    const sorted = [...arr].sort((a, b) => a - b);
    return [
      sorted[Math.floor(sorted.length * 0.2)],
      sorted[Math.floor(sorted.length * 0.4)],
      sorted[Math.floor(sorted.length * 0.6)],
      sorted[Math.floor(sorted.length * 0.8)]
    ];
  };

  const recencyValues = customersWithRecency.map(c => c.recencyDays);
  const frequencyValues = customersWithRecency.map(c => c.totalOrders);
  const monetaryValues = customersWithRecency.map(c => c.totalSpent);

  const rQuints = getQuintiles(recencyValues);
  const fQuints = getQuintiles(frequencyValues);
  const mQuints = getQuintiles(monetaryValues);

  return customersWithRecency.map(c => {
    // R Score (1-5, 5 is best/most recent)
    let rScore = 1;
    if (c.recencyDays <= rQuints[0]) rScore = 5;
    else if (c.recencyDays <= rQuints[1]) rScore = 4;
    else if (c.recencyDays <= rQuints[2]) rScore = 3;
    else if (c.recencyDays <= rQuints[3]) rScore = 2;

    // F Score (1-5, 5 is best/most frequent)
    let fScore = 1;
    if (c.totalOrders >= fQuints[3]) fScore = 5;
    else if (c.totalOrders >= fQuints[2]) fScore = 4;
    else if (c.totalOrders >= fQuints[1]) fScore = 3;
    else if (c.totalOrders >= fQuints[0]) fScore = 2;

    // M Score (1-5, 5 is best/highest spend)
    let mScore = 1;
    if (c.totalSpent >= mQuints[3]) mScore = 5;
    else if (c.totalSpent >= mQuints[2]) mScore = 4;
    else if (c.totalSpent >= mQuints[1]) mScore = 3;
    else if (c.totalSpent >= mQuints[0]) mScore = 2;

    // Segmentation Logic
    let segment = "Hibernating";

    if (rScore >= 4 && fScore >= 4 && mScore >= 4) {
      segment = "Champions";
    } else if (rScore >= 3 && fScore >= 3) {
      segment = "Loyal Customers";
    } else if (rScore <= 2 && fScore >= 3 && mScore >= 3) {
      segment = "At Risk";
    }

    return { ...c, rScore, fScore, mScore, segment };
  });
}
