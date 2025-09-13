"use server";

import { generateInvestmentIdeas } from "@/ai/flows/generate-investment-ideas";
import type { GenerateInvestmentIdeasOutput } from "@/ai/flows/generate-investment-ideas";
import type { InvestmentCategory } from "@/lib/types";

const FALLBACK_IDEAS: Record<InvestmentCategory, GenerateInvestmentIdeasOutput> = {
  RealEstate: [
    { name: "Urban Apartment Block", costET: 2500, incomePerSecET: 1.2, description: "Invest in a modern apartment complex in a growing city.", riskLevel: "Medium" },
    { name: "Market Stall Row", costET: 600, incomePerSecET: 0.22, description: "A set of market stalls in a busy downtown area.", riskLevel: "Low" },
    { name: "Logistics Warehouse", costET: 4200, incomePerSecET: 2.6, description: "Storage hub supporting regional e-commerce growth.", riskLevel: "Medium" },
    { name: "Beachfront Villas", costET: 8000, incomePerSecET: 5.8, description: "Tourist villas with high seasonal demand.", riskLevel: "High" },
    { name: "Suburban Duplex", costET: 1400, incomePerSecET: 0.55, description: "Affordable rentals in expanding suburbs.", riskLevel: "Low" },
    { name: "City Parking Lot", costET: 2000, incomePerSecET: 1.1, description: "Paid parking in a high-traffic commercial district.", riskLevel: "Low" },
  ],
  Agriculture: [
    { name: "Cocoa Farm Plot", costET: 900, incomePerSecET: 0.35, description: "Smallholder cocoa production with stable export demand.", riskLevel: "Low" },
    { name: "Irrigated Maize Field", costET: 1200, incomePerSecET: 0.6, description: "Year-round maize supported by drip irrigation.", riskLevel: "Medium" },
    { name: "Avocado Orchard", costET: 3000, incomePerSecET: 1.5, description: "High-margin fruit with growing regional demand.", riskLevel: "Medium" },
    { name: "Poultry Houses", costET: 1800, incomePerSecET: 0.9, description: "Broiler chickens with quick turnaround cycles.", riskLevel: "Medium" },
    { name: "Beekeeping Co-op", costET: 700, incomePerSecET: 0.28, description: "Honey and wax products via a local cooperative.", riskLevel: "Low" },
    { name: "Cashew Processing", costET: 5200, incomePerSecET: 3.1, description: "Value-added nut processing for export.", riskLevel: "High" },
  ],
  Management: [
    { name: "Microloan Portfolio", costET: 1500, incomePerSecET: 0.7, description: "Diversified microloans with strong repayment history.", riskLevel: "Medium" },
    { name: "Fleet Ops Team", costET: 2600, incomePerSecET: 1.4, description: "Optimize delivery fleet utilization and costs.", riskLevel: "Medium" },
    { name: "Retail Franchise Mgmt", costET: 4800, incomePerSecET: 2.8, description: "Run multi-site retail with centralized operations.", riskLevel: "High" },
    { name: "Supply Chain Desk", costET: 2100, incomePerSecET: 1.0, description: "Demand planning and supplier coordination.", riskLevel: "Low" },
    { name: "Training Program", costET: 1100, incomePerSecET: 0.5, description: "Upskilling staff to boost productivity.", riskLevel: "Low" },
    { name: "Govt Contract Office", costET: 6000, incomePerSecET: 3.9, description: "Bid and manage public sector projects.", riskLevel: "High" },
  ],
  Tech: [
    { name: "Mobile Payments", costET: 2200, incomePerSecET: 1.3, description: "Transaction fees from mobile wallet usage.", riskLevel: "Medium" },
    { name: "Agri Data Platform", costET: 3200, incomePerSecET: 1.9, description: "Analytics for crop yields and pricing.", riskLevel: "Medium" },
    { name: "Solar IoT Sensors", costET: 1700, incomePerSecET: 0.85, description: "Remote monitoring for microgrids.", riskLevel: "Low" },
    { name: "EdTech Subscriptions", costET: 2600, incomePerSecET: 1.4, description: "Learning content for schools and adults.", riskLevel: "Medium" },
    { name: "Ride-hailing Mini", costET: 900, incomePerSecET: 0.4, description: "Commission from local ride-hailing trips.", riskLevel: "Medium" },
    { name: "Data Center Racks", costET: 6800, incomePerSecET: 4.2, description: "Colocation and cloud services.", riskLevel: "High" },
  ],
  Politics: [
    { name: "Policy Advisory", costET: 1400, incomePerSecET: 0.6, description: "Consulting for regulatory impact analysis.", riskLevel: "Low" },
    { name: "Civic Engagement App", costET: 2000, incomePerSecET: 1.0, description: "Subscriptions for governance transparency tools.", riskLevel: "Medium" },
    { name: "Public-Private Forum", costET: 3100, incomePerSecET: 1.7, description: "Sponsorships for stakeholder roundtables.", riskLevel: "Medium" },
    { name: "Election Logistics", costET: 5000, incomePerSecET: 3.2, description: "Nonpartisan logistics and training services.", riskLevel: "High" },
    { name: "Regulatory Briefings", costET: 1200, incomePerSecET: 0.55, description: "Paid briefings for businesses.", riskLevel: "Low" },
    { name: "Compliance Toolkit", costET: 2600, incomePerSecET: 1.3, description: "Template policies for SMEs.", riskLevel: "Low" },
  ],
  Health: [
    { name: "Clinic Kiosk", costET: 1000, incomePerSecET: 0.45, description: "Digital triage and appointment booking.", riskLevel: "Low" },
    { name: "Pharmacy Network", costET: 2400, incomePerSecET: 1.2, description: "Franchise model for essential medicines.", riskLevel: "Medium" },
    { name: "Telemedicine Pods", costET: 3600, incomePerSecET: 2.0, description: "Remote consults in rural areas.", riskLevel: "Medium" },
    { name: "Lab Testing Van", costET: 4100, incomePerSecET: 2.3, description: "Mobile diagnostics for communities.", riskLevel: "High" },
    { name: "Health Insurance Lite", costET: 1800, incomePerSecET: 0.9, description: "Low-cost plans for families.", riskLevel: "Medium" },
    { name: "Water Purifiers", costET: 900, incomePerSecET: 0.38, description: "Point-of-use filters for households.", riskLevel: "Low" },
  ],
  Security: [
    { name: "Neighborhood Watch", costET: 800, incomePerSecET: 0.3, description: "Community-led safety program.", riskLevel: "Low" },
    { name: "CCTV Grid", costET: 2300, incomePerSecET: 1.1, description: "Video monitoring for small business districts.", riskLevel: "Medium" },
    { name: "Guard Services", costET: 1600, incomePerSecET: 0.75, description: "Licensed patrols for compounds.", riskLevel: "Medium" },
    { name: "Alarm Response", costET: 2800, incomePerSecET: 1.5, description: "24/7 dispatch and response.", riskLevel: "High" },
    { name: "Access Control", costET: 1200, incomePerSecET: 0.52, description: "Smart locks and entry systems.", riskLevel: "Low" },
    { name: "Cyber Hygiene Kit", costET: 950, incomePerSecET: 0.41, description: "SMB-focused cyber basics bundle.", riskLevel: "Low" },
  ],
};

function getFallbackIdeas(category: InvestmentCategory, num: number): GenerateInvestmentIdeasOutput {
  const items = FALLBACK_IDEAS[category] || [];
  if (items.length >= num) return items.slice(0, num);
  const result = [...items];
  // If fewer than requested, synthesize additional variants
  for (let i = items.length; i < num; i++) {
    const base = items[i % Math.max(items.length, 1)] || { name: `${category} Venture`, costET: 1200, incomePerSecET: 0.6 } as any;
    result.push({
      name: `${base.name} ${i + 1}`,
      costET: Math.round(base.costET * (1 + (i - items.length + 1) * 0.2)),
      incomePerSecET: +(base.incomePerSecET * (1 + (i - items.length + 1) * 0.2)).toFixed(2),
      description: base.description,
      riskLevel: base.riskLevel || "Medium",
    });
  }
  return result;
}

export async function getInvestmentIdeas(category: InvestmentCategory): Promise<GenerateInvestmentIdeasOutput> {
  try {
    const ideas = await generateInvestmentIdeas({
      category: category,
      numIdeas: 6,
    });
    if (!ideas || ideas.length === 0) {
      return getFallbackIdeas(category, 6);
    }
    return ideas;
  } catch (error) {
    console.error("Error generating investment ideas:", error);
    // Use deterministic fallback ideas so the page still renders
    return getFallbackIdeas(category, 6);
  }
}
