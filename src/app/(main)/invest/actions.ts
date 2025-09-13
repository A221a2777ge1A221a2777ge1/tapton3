"use server";

import { generateInvestmentIdeas } from "@/ai/flows/generate-investment-ideas";
import type { GenerateInvestmentIdeasOutput } from "@/ai/flows/generate-investment-ideas";
import type { InvestmentCategory } from "@/lib/types";

export async function getInvestmentIdeas(category: InvestmentCategory): Promise<GenerateInvestmentIdeasOutput> {
  try {
    const ideas = await generateInvestmentIdeas({
      category: category,
      numIdeas: 6,
    });
    return ideas;
  } catch (error) {
    console.error("Error generating investment ideas:", error);
    // Return a fallback or empty array in case of error
    return [];
  }
}
