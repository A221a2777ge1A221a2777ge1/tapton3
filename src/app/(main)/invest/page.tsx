"use client";

import React, { useState, useEffect, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Investment, InvestmentCategory } from '@/lib/types';
import { formatET } from '@/lib/formatters';
import { useGameState } from '@/hooks/use-game-state';
import { getInvestmentIdeas } from './actions';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { HandCoins, Info } from 'lucide-react';

const categories: InvestmentCategory[] = [
  'RealEstate',
  'Agriculture',
  'Management',
  'Tech',
  'Politics',
  'Health',
  'Security',
];

export default function InvestPage() {
  const [ideas, setIdeas] = useState<Record<string, Investment[]>>({});
  const [isPending, startTransition] = useTransition();

  const fetchIdeas = (category: InvestmentCategory) => {
    if (ideas[category]) return;

    startTransition(async () => {
      const result = await getInvestmentIdeas(category);
      setIdeas(prev => ({ ...prev, [category]: result.map(r => ({ ...r, id: `${category}-${r.name}`, category, ownedQty: 0})) }));
    });
  };

  useEffect(() => {
    fetchIdeas(categories[0]);
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Investments</h1>
      <p className="text-muted-foreground mb-6">Buy investments to increase your passive income.</p>

      <Tabs defaultValue={categories[0]} className="w-full" onValueChange={(v) => fetchIdeas(v as InvestmentCategory)}>
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-4 md:grid-cols-7 h-auto">
          {categories.map(cat => (
            <TabsTrigger key={cat} value={cat}>{cat}</TabsTrigger>
          ))}
        </TabsList>
        {categories.map(cat => (
          <TabsContent key={cat} value={cat}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {isPending && !ideas[cat]
                ? Array.from({ length: 4 }).map((_, i) => <InvestmentSkeleton key={i} />)
                : ideas[cat]?.map(idea => <InvestmentCard key={idea.id} idea={idea} />)
              }
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

const InvestmentCard = ({ idea: initialIdea }: { idea: Investment }) => {
    const { balance, purchaseInvestment, investments } = useGameState();
    const existingInvestment = investments.find(i => i.id === initialIdea.id);
    const idea = existingInvestment || initialIdea;
    const canAfford = balance >= idea.costET;

    const handlePurchase = () => {
        const success = purchaseInvestment(idea);
        if (success) {
            toast({
                title: 'Purchase Successful!',
                description: `You've invested in ${idea.name}.`,
            });
        } else {
            toast({
                title: 'Insufficient Funds',
                description: `You need ${formatET(idea.costET)} to buy ${idea.name}.`,
                variant: 'destructive',
            });
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">{idea.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {idea.description && (
                  <div className="text-sm text-muted-foreground flex items-start gap-2">
                    <Info className="h-4 w-4 mt-0.5" />
                    <span>{idea.description}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Cost</span>
                    <span className="font-bold text-primary">{formatET(idea.costET)}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Income</span>
                    <span className="font-bold text-green-400">+{formatET(idea.incomePerSecET)}/s</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Income/hr</span>
                      <span className="font-medium">{formatET(idea.incomePerSecET * 3600)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Income/day</span>
                      <span className="font-medium">{formatET(idea.incomePerSecET * 86400)}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Payback</span>
                    <span className="font-medium">
                      {idea.incomePerSecET > 0 ? `${Math.ceil(idea.costET / idea.incomePerSecET / 3600)}h` : '—'}
                    </span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Owned</span>
                    <span className="font-bold">{idea.ownedQty}</span>
                </div>
                {idea.riskLevel && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Risk</span>
                    <span className="font-medium">{idea.riskLevel}</span>
                  </div>
                )}
            </CardContent>
            <CardFooter>
                <Button className="w-full" onClick={handlePurchase} disabled={!canAfford}>
                    <HandCoins className="mr-2 h-4 w-4" /> Buy
                </Button>
            </CardFooter>
        </Card>
    );
};

const InvestmentSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-3/4" />
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
      </div>
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
      </div>
       <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
      </div>
    </CardContent>
    <CardFooter>
      <Skeleton className="h-10 w-full" />
    </CardFooter>
  </Card>
);
