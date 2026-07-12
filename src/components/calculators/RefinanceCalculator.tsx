import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RefreshCw, TrendingDown } from "lucide-react";

const monthlyPmt = (principal: number, ratePct: number, years: number) => {
  const r = ratePct / 100 / 12;
  const n = years * 12;
  if (r === 0) return principal / n;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
};

export function RefinanceCalculator() {
  const [balance, setBalance] = useState<number>(3_000_000);
  const [currentRate, setCurrentRate] = useState<number>(14);
  const [currentTermRemaining, setCurrentTermRemaining] = useState<number>(15);
  const [newRate, setNewRate] = useState<number>(11);
  const [newTerm, setNewTerm] = useState<number>(15);
  const [closingCosts, setClosingCosts] = useState<number>(80_000);
  const [result, setResult] = useState<{
    oldPayment: number;
    newPayment: number;
    monthlySavings: number;
    lifetimeSavings: number;
    breakEvenMonths: number;
  } | null>(null);

  const calculate = () => {
    const oldPayment = monthlyPmt(balance, currentRate, currentTermRemaining);
    const newPayment = monthlyPmt(balance + closingCosts, newRate, newTerm);
    const monthlySavings = oldPayment - newPayment;
    const oldTotal = oldPayment * currentTermRemaining * 12;
    const newTotal = newPayment * newTerm * 12;
    const lifetimeSavings = oldTotal - newTotal - closingCosts;
    const breakEvenMonths = monthlySavings > 0 ? closingCosts / monthlySavings : Infinity;
    setResult({ oldPayment, newPayment, monthlySavings, lifetimeSavings, breakEvenMonths });
  };

  const fmt = (n: number) => `Ksh ${Math.round(n).toLocaleString()}`;

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5" /> Refinance Details
          </CardTitle>
          <CardDescription>Should you refinance your mortgage?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Current loan balance (Ksh)</Label>
            <Input type="number" value={balance} onChange={(e) => setBalance(Number(e.target.value))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Current rate (%)</Label>
              <Input type="number" step="0.1" value={currentRate} onChange={(e) => setCurrentRate(Number(e.target.value))} />
            </div>
            <div>
              <Label>Years remaining</Label>
              <Input type="number" value={currentTermRemaining} onChange={(e) => setCurrentTermRemaining(Number(e.target.value))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>New rate (%)</Label>
              <Input type="number" step="0.1" value={newRate} onChange={(e) => setNewRate(Number(e.target.value))} />
            </div>
            <div>
              <Label>New term (years)</Label>
              <Input type="number" value={newTerm} onChange={(e) => setNewTerm(Number(e.target.value))} />
            </div>
          </div>
          <div>
            <Label>Closing costs (Ksh)</Label>
            <Input type="number" value={closingCosts} onChange={(e) => setClosingCosts(Number(e.target.value))} />
          </div>
          <Button onClick={calculate} className="w-full" size="lg">Calculate Refinance</Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5" /> Refinance Impact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Current payment</p>
                <p className="text-xl font-bold">{fmt(result.oldPayment)}</p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">New payment</p>
                <p className="text-xl font-bold">{fmt(result.newPayment)}</p>
              </div>
            </div>
            <div className="bg-primary/10 p-6 rounded-lg border-2 border-primary/20 text-center">
              <p className="text-sm text-muted-foreground">Monthly savings</p>
              <p className={`text-3xl font-bold ${result.monthlySavings >= 0 ? "text-green-600" : "text-red-600"}`}>
                {fmt(result.monthlySavings)}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Break-even</p>
                <p className="text-xl font-bold">
                  {isFinite(result.breakEvenMonths)
                    ? `${Math.ceil(result.breakEvenMonths)} mo`
                    : "Never"}
                </p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Lifetime savings</p>
                <p className={`text-xl font-bold ${result.lifetimeSavings >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {fmt(result.lifetimeSavings)}
                </p>
              </div>
            </div>
            <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
              {result.monthlySavings > 0 && isFinite(result.breakEvenMonths)
                ? `You'll recover closing costs in ~${Math.ceil(result.breakEvenMonths)} months, then save every month.`
                : "Refinancing at these terms may not save you money. Consider a lower rate or longer term."}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}