import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Wallet, TrendingUp } from "lucide-react";

export function AffordabilityCalculator() {
  const [monthlyIncome, setMonthlyIncome] = useState<number>(150000);
  const [monthlyDebts, setMonthlyDebts] = useState<number>(20000);
  const [downPayment, setDownPayment] = useState<number>(500000);
  const [interestRate, setInterestRate] = useState<number>(13);
  const [loanTerm, setLoanTerm] = useState<number>(20);
  const [dtiTarget, setDtiTarget] = useState<number>(36);
  const [result, setResult] = useState<{
    maxMonthlyPayment: number;
    maxLoan: number;
    maxHomePrice: number;
  } | null>(null);

  const calculate = () => {
    const maxTotalMonthly = (monthlyIncome * dtiTarget) / 100;
    const maxMonthlyPayment = Math.max(0, maxTotalMonthly - monthlyDebts);
    const monthlyRate = interestRate / 100 / 12;
    const n = loanTerm * 12;
    const maxLoan =
      monthlyRate === 0
        ? maxMonthlyPayment * n
        : (maxMonthlyPayment * (Math.pow(1 + monthlyRate, n) - 1)) /
          (monthlyRate * Math.pow(1 + monthlyRate, n));
    setResult({
      maxMonthlyPayment,
      maxLoan,
      maxHomePrice: maxLoan + downPayment,
    });
  };

  const fmt = (n: number) => `Ksh ${Math.round(n).toLocaleString()}`;

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" /> Your Finances
          </CardTitle>
          <CardDescription>How much home can you afford?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Gross monthly income (Ksh)</Label>
            <Input type="number" value={monthlyIncome} onChange={(e) => setMonthlyIncome(Number(e.target.value))} />
          </div>
          <div>
            <Label>Existing monthly debt payments (Ksh)</Label>
            <Input type="number" value={monthlyDebts} onChange={(e) => setMonthlyDebts(Number(e.target.value))} />
          </div>
          <div>
            <Label>Down payment available (Ksh)</Label>
            <Input type="number" value={downPayment} onChange={(e) => setDownPayment(Number(e.target.value))} />
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
          <div>
            <Label>Target DTI ratio (%)</Label>
            <Input type="number" value={dtiTarget} onChange={(e) => setDtiTarget(Number(e.target.value))} />
            <p className="text-xs text-muted-foreground mt-1">Lenders typically prefer 36% or below.</p>
          </div>
          <Button onClick={calculate} className="w-full" size="lg">Calculate Affordability</Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" /> You Can Afford
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-primary/10 p-6 rounded-lg border-2 border-primary/20 text-center">
              <p className="text-sm text-muted-foreground">Maximum home price</p>
              <p className="text-3xl font-bold text-primary">{fmt(result.maxHomePrice)}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Max monthly payment</p>
                <p className="text-xl font-bold">{fmt(result.maxMonthlyPayment)}</p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Max loan amount</p>
                <p className="text-xl font-bold">{fmt(result.maxLoan)}</p>
              </div>
            </div>
            <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
              Based on a {dtiTarget}% DTI, this is the safe upper bound. Property taxes,
              insurance and HOA fees may reduce this figure.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}