import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Scale, CheckCircle2, AlertTriangle } from "lucide-react";

export function DTICalculator() {
  const [monthlyIncome, setMonthlyIncome] = useState<number>(150_000);
  const [housing, setHousing] = useState<number>(40_000);
  const [carLoan, setCarLoan] = useState<number>(15_000);
  const [creditCards, setCreditCards] = useState<number>(5_000);
  const [studentLoans, setStudentLoans] = useState<number>(0);
  const [otherDebts, setOtherDebts] = useState<number>(0);
  const [result, setResult] = useState<{
    frontEnd: number;
    backEnd: number;
    totalDebts: number;
    verdict: "excellent" | "good" | "acceptable" | "high" | "very_high";
  } | null>(null);

  const calculate = () => {
    if (monthlyIncome <= 0) return;
    const totalDebts = housing + carLoan + creditCards + studentLoans + otherDebts;
    const frontEnd = (housing / monthlyIncome) * 100;
    const backEnd = (totalDebts / monthlyIncome) * 100;
    let verdict: "excellent" | "good" | "acceptable" | "high" | "very_high";
    if (backEnd <= 20) verdict = "excellent";
    else if (backEnd <= 36) verdict = "good";
    else if (backEnd <= 43) verdict = "acceptable";
    else if (backEnd <= 50) verdict = "high";
    else verdict = "very_high";
    setResult({ frontEnd, backEnd, totalDebts, verdict });
  };

  const fmt = (n: number) => `Ksh ${Math.round(n).toLocaleString()}`;

  const verdictConfig = {
    excellent: { label: "Excellent", color: "text-green-600", bg: "bg-green-500/10 border-green-500/30", icon: CheckCircle2, note: "You have plenty of room for a mortgage." },
    good: { label: "Good", color: "text-emerald-600", bg: "bg-emerald-500/10 border-emerald-500/30", icon: CheckCircle2, note: "Lenders will view this favourably." },
    acceptable: { label: "Acceptable", color: "text-amber-600", bg: "bg-amber-500/10 border-amber-500/30", icon: AlertTriangle, note: "You may still qualify but with less favourable terms." },
    high: { label: "High", color: "text-orange-600", bg: "bg-orange-500/10 border-orange-500/30", icon: AlertTriangle, note: "Approval will be difficult. Consider reducing debts." },
    very_high: { label: "Very high", color: "text-red-600", bg: "bg-red-500/10 border-red-500/30", icon: AlertTriangle, note: "Most lenders will decline. Focus on debt reduction first." },
  } as const;

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="w-5 h-5" /> Debt-to-Income Ratio
          </CardTitle>
          <CardDescription>Assess your borrowing capacity</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Gross monthly income (Ksh)</Label>
            <Input type="number" value={monthlyIncome} onChange={(e) => setMonthlyIncome(Number(e.target.value))} />
          </div>
          <div>
            <Label>Housing (rent/mortgage) (Ksh)</Label>
            <Input type="number" value={housing} onChange={(e) => setHousing(Number(e.target.value))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Car loan (Ksh)</Label>
              <Input type="number" value={carLoan} onChange={(e) => setCarLoan(Number(e.target.value))} />
            </div>
            <div>
              <Label>Credit cards (Ksh)</Label>
              <Input type="number" value={creditCards} onChange={(e) => setCreditCards(Number(e.target.value))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Student loans (Ksh)</Label>
              <Input type="number" value={studentLoans} onChange={(e) => setStudentLoans(Number(e.target.value))} />
            </div>
            <div>
              <Label>Other debts (Ksh)</Label>
              <Input type="number" value={otherDebts} onChange={(e) => setOtherDebts(Number(e.target.value))} />
            </div>
          </div>
          <Button onClick={calculate} className="w-full" size="lg">Calculate DTI</Button>
        </CardContent>
      </Card>

      {result && (() => {
        const cfg = verdictConfig[result.verdict];
        const Icon = cfg.icon;
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon className={`w-5 h-5 ${cfg.color}`} /> Your DTI Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={`p-6 rounded-lg border-2 text-center ${cfg.bg}`}>
                <p className="text-sm text-muted-foreground">Back-end DTI (total debt)</p>
                <p className={`text-4xl font-bold ${cfg.color}`}>{result.backEnd.toFixed(1)}%</p>
                <p className={`text-sm font-semibold ${cfg.color} mt-1`}>{cfg.label}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Front-end DTI</p>
                  <p className="text-xl font-bold">{result.frontEnd.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground mt-1">Housing only</p>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total monthly debt</p>
                  <p className="text-xl font-bold">{fmt(result.totalDebts)}</p>
                </div>
              </div>
              <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                {cfg.note}
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• Under 36%: Ideal for mortgage approval</p>
                <p>• 36–43%: Acceptable range for most lenders</p>
                <p>• Above 43%: Approval becomes difficult</p>
              </div>
            </CardContent>
          </Card>
        );
      })()}
    </div>
  );
}