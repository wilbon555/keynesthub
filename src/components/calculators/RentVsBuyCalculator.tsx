import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Home, Building2 } from "lucide-react";

const monthlyPmt = (principal: number, ratePct: number, years: number) => {
  const r = ratePct / 100 / 12;
  const n = years * 12;
  if (r === 0) return principal / n;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
};

export function RentVsBuyCalculator() {
  const [homePrice, setHomePrice] = useState<number>(8_000_000);
  const [downPayment, setDownPayment] = useState<number>(1_600_000);
  const [interestRate, setInterestRate] = useState<number>(13);
  const [loanTerm, setLoanTerm] = useState<number>(20);
  const [appreciation, setAppreciation] = useState<number>(5);
  const [ownershipCostsPct, setOwnershipCostsPct] = useState<number>(1.5); // % of home value annually
  const [monthlyRent, setMonthlyRent] = useState<number>(45_000);
  const [rentIncrease, setRentIncrease] = useState<number>(6);
  const [years, setYears] = useState<number>(7);
  const [result, setResult] = useState<{
    totalBuyingCost: number;
    totalRentingCost: number;
    homeEquity: number;
    netBuyCost: number;
    winner: "buy" | "rent";
    difference: number;
  } | null>(null);

  const calculate = () => {
    const loan = homePrice - downPayment;
    const mortgage = monthlyPmt(loan, interestRate, loanTerm);
    const annualOwnership = homePrice * (ownershipCostsPct / 100);
    const totalBuyingCost =
      downPayment + mortgage * 12 * years + annualOwnership * years;

    // Home appreciation
    const futureHomeValue = homePrice * Math.pow(1 + appreciation / 100, years);
    // Remaining loan balance approximation
    const r = interestRate / 100 / 12;
    const n = loanTerm * 12;
    const paidMonths = years * 12;
    const balance =
      r === 0
        ? loan - mortgage * paidMonths
        : loan * Math.pow(1 + r, paidMonths) -
          mortgage * ((Math.pow(1 + r, paidMonths) - 1) / r);
    const homeEquity = futureHomeValue - Math.max(0, balance);
    const netBuyCost = totalBuyingCost - homeEquity;

    // Renting
    let totalRentingCost = 0;
    let currentRent = monthlyRent;
    for (let y = 0; y < years; y++) {
      totalRentingCost += currentRent * 12;
      currentRent *= 1 + rentIncrease / 100;
    }

    const winner = netBuyCost < totalRentingCost ? "buy" : "rent";
    const difference = Math.abs(netBuyCost - totalRentingCost);

    setResult({ totalBuyingCost, totalRentingCost, homeEquity, netBuyCost, winner, difference });
  };

  const fmt = (n: number) => `Ksh ${Math.round(n).toLocaleString()}`;

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="w-5 h-5" /> Rent vs Buy Inputs
          </CardTitle>
          <CardDescription>Compare over your planned horizon</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Home price (Ksh)</Label>
              <Input type="number" value={homePrice} onChange={(e) => setHomePrice(Number(e.target.value))} />
            </div>
            <div>
              <Label>Down payment (Ksh)</Label>
              <Input type="number" value={downPayment} onChange={(e) => setDownPayment(Number(e.target.value))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Interest rate (%)</Label>
              <Input type="number" step="0.1" value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))} />
            </div>
            <div>
              <Label>Loan term (years)</Label>
              <Input type="number" value={loanTerm} onChange={(e) => setLoanTerm(Number(e.target.value))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Annual appreciation (%)</Label>
              <Input type="number" step="0.1" value={appreciation} onChange={(e) => setAppreciation(Number(e.target.value))} />
            </div>
            <div>
              <Label>Ownership costs (%/yr)</Label>
              <Input type="number" step="0.1" value={ownershipCostsPct} onChange={(e) => setOwnershipCostsPct(Number(e.target.value))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Monthly rent (Ksh)</Label>
              <Input type="number" value={monthlyRent} onChange={(e) => setMonthlyRent(Number(e.target.value))} />
            </div>
            <div>
              <Label>Annual rent increase (%)</Label>
              <Input type="number" step="0.1" value={rentIncrease} onChange={(e) => setRentIncrease(Number(e.target.value))} />
            </div>
          </div>
          <div>
            <Label>Years to compare</Label>
            <Input type="number" value={years} onChange={(e) => setYears(Number(e.target.value))} />
          </div>
          <Button onClick={calculate} className="w-full" size="lg">Compare Rent vs Buy</Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" /> Verdict After {years} Years
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className={`p-6 rounded-lg border-2 text-center ${
                result.winner === "buy"
                  ? "bg-green-500/10 border-green-500/30"
                  : "bg-blue-500/10 border-blue-500/30"
              }`}
            >
              <p className="text-sm text-muted-foreground">Better option</p>
              <p className="text-3xl font-bold capitalize">
                {result.winner === "buy" ? "Buy" : "Rent"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Save {fmt(result.difference)} over {years} years
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Total cost of buying</p>
                <p className="text-lg font-bold">{fmt(result.totalBuyingCost)}</p>
                <p className="text-xs text-muted-foreground mt-1">Net: {fmt(result.netBuyCost)}</p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Total cost of renting</p>
                <p className="text-lg font-bold">{fmt(result.totalRentingCost)}</p>
              </div>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Estimated home equity built</p>
              <p className="text-xl font-bold text-primary">{fmt(result.homeEquity)}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}