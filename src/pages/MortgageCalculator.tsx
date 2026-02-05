import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navigation } from "@/components/Navigation";
import { Calculator, DollarSign, TrendingUp, Home } from "lucide-react";
import { MarketAIInsights } from "@/components/ai/MarketAIInsights";

interface CalculationResult {
  monthlyPayment: number;
  totalInterest: number;
  totalPayment: number;
  monthlyTaxes: number;
  monthlyInsurance: number;
  monthlyPMI: number;
  totalMonthlyPayment: number;
  cashFlow: number;
  roi: number;
}

const MortgageCalculator = () => {
  const [loanAmount, setLoanAmount] = useState<number>(300000);
  const [downPayment, setDownPayment] = useState<number>(60000);
  const [interestRate, setInterestRate] = useState<number>(6.5);
  const [loanTerm, setLoanTerm] = useState<number>(30);
  const [propertyTax, setPropertyTax] = useState<number>(3600);
  const [insurance, setInsurance] = useState<number>(1200);
  const [hoaFees, setHoaFees] = useState<number>(0);
  const [pmi, setPmi] = useState<number>(0);
  const [rentalIncome, setRentalIncome] = useState<number>(2500);
  const [result, setResult] = useState<CalculationResult | null>(null);

  const calculateMortgage = () => {
    const principal = loanAmount - downPayment;
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = loanTerm * 12;

    // Monthly mortgage payment (principal + interest)
    const monthlyPayment = (principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) / 
                          (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

    const totalPayment = monthlyPayment * numberOfPayments;
    const totalInterest = totalPayment - principal;

    // Monthly additional costs
    const monthlyTaxes = propertyTax / 12;
    const monthlyInsurance = insurance / 12;
    const monthlyPMI = pmi / 12;
    const monthlyHOA = hoaFees / 12;

    const totalMonthlyPayment = monthlyPayment + monthlyTaxes + monthlyInsurance + monthlyPMI + monthlyHOA;
    
    // Investment analysis
    const cashFlow = rentalIncome - totalMonthlyPayment;
    const annualCashFlow = cashFlow * 12;
    const totalInvestment = downPayment; // Simplified - could include closing costs, repairs, etc.
    const roi = totalInvestment > 0 ? (annualCashFlow / totalInvestment) * 100 : 0;

    setResult({
      monthlyPayment,
      totalInterest,
      totalPayment,
      monthlyTaxes,
      monthlyInsurance,
      monthlyPMI,
      totalMonthlyPayment,
      cashFlow,
      roi
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">Mortgage Calculator</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
              Calculate mortgage payments and analyze investment potential for real estate properties. 
              Perfect for investors, homebuyers, and real estate professionals.
            </p>
            <MarketAIInsights 
              context="mortgage_calculator" 
              contextData={{ loanAmount, downPayment, interestRate, loanTerm }}
              className="max-w-2xl mx-auto" 
            />
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Property & Loan Details
                </CardTitle>
                <CardDescription>
                  Enter your property and financing information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="loanAmount">Property Value ($)</Label>
                    <Input
                      id="loanAmount"
                      type="number"
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(Number(e.target.value))}
                      placeholder="300000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="downPayment">Down Payment ($)</Label>
                    <Input
                      id="downPayment"
                      type="number"
                      value={downPayment}
                      onChange={(e) => setDownPayment(Number(e.target.value))}
                      placeholder="60000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="interestRate">Interest Rate (%)</Label>
                    <Input
                      id="interestRate"
                      type="number"
                      step="0.1"
                      value={interestRate}
                      onChange={(e) => setInterestRate(Number(e.target.value))}
                      placeholder="6.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="loanTerm">Loan Term (years)</Label>
                    <Input
                      id="loanTerm"
                      type="number"
                      value={loanTerm}
                      onChange={(e) => setLoanTerm(Number(e.target.value))}
                      placeholder="30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="propertyTax">Annual Property Tax ($)</Label>
                    <Input
                      id="propertyTax"
                      type="number"
                      value={propertyTax}
                      onChange={(e) => setPropertyTax(Number(e.target.value))}
                      placeholder="3600"
                    />
                  </div>
                  <div>
                    <Label htmlFor="insurance">Annual Insurance ($)</Label>
                    <Input
                      id="insurance"
                      type="number"
                      value={insurance}
                      onChange={(e) => setInsurance(Number(e.target.value))}
                      placeholder="1200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="hoaFees">Annual HOA Fees ($)</Label>
                    <Input
                      id="hoaFees"
                      type="number"
                      value={hoaFees}
                      onChange={(e) => setHoaFees(Number(e.target.value))}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pmi">Annual PMI ($)</Label>
                    <Input
                      id="pmi"
                      type="number"
                      value={pmi}
                      onChange={(e) => setPmi(Number(e.target.value))}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="rentalIncome">Monthly Rental Income ($)</Label>
                  <Input
                    id="rentalIncome"
                    type="number"
                    value={rentalIncome}
                    onChange={(e) => setRentalIncome(Number(e.target.value))}
                    placeholder="2500"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Leave as 0 if this is for personal use
                  </p>
                </div>

                <Button onClick={calculateMortgage} className="w-full" size="lg">
                  Calculate Mortgage
                </Button>
              </CardContent>
            </Card>

            {/* Results */}
            {result && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Calculation Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="payment" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="payment">Payment Breakdown</TabsTrigger>
                      <TabsTrigger value="investment">Investment Analysis</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="payment" className="space-y-4 mt-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-muted p-4 rounded-lg">
                          <div className="text-sm text-muted-foreground">Principal & Interest</div>
                          <div className="text-2xl font-bold text-primary">
                            ${result.monthlyPayment.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                          </div>
                        </div>
                        <div className="bg-muted p-4 rounded-lg">
                          <div className="text-sm text-muted-foreground">Property Tax</div>
                          <div className="text-2xl font-bold">
                            ${result.monthlyTaxes.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                          </div>
                        </div>
                        <div className="bg-muted p-4 rounded-lg">
                          <div className="text-sm text-muted-foreground">Insurance</div>
                          <div className="text-2xl font-bold">
                            ${result.monthlyInsurance.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                          </div>
                        </div>
                        <div className="bg-muted p-4 rounded-lg">
                          <div className="text-sm text-muted-foreground">PMI</div>
                          <div className="text-2xl font-bold">
                            ${result.monthlyPMI.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-primary/10 p-6 rounded-lg border-2 border-primary/20">
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground">Total Monthly Payment</div>
                          <div className="text-3xl font-bold text-primary">
                            ${result.totalMonthlyPayment.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-muted-foreground">Total Interest Paid</span>
                          <span className="font-semibold">${result.totalInterest.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-muted-foreground">Total Amount Paid</span>
                          <span className="font-semibold">${result.totalPayment.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="investment" className="space-y-4 mt-6">
                      <div className="grid grid-cols-1 gap-4">
                        <div className="bg-muted p-4 rounded-lg">
                          <div className="text-sm text-muted-foreground">Monthly Cash Flow</div>
                          <div className={`text-2xl font-bold ${result.cashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ${result.cashFlow.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                          </div>
                        </div>
                        <div className="bg-muted p-4 rounded-lg">
                          <div className="text-sm text-muted-foreground">Return on Investment (ROI)</div>
                          <div className={`text-2xl font-bold ${result.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {result.roi.toFixed(2)}%
                          </div>
                        </div>
                        <div className="bg-muted p-4 rounded-lg">
                          <div className="text-sm text-muted-foreground">Down Payment</div>
                          <div className="text-2xl font-bold">
                            ${downPayment.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                          </div>
                        </div>
                      </div>

                      <div className="bg-accent/10 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          Investment Summary
                        </h4>
                        <ul className="text-sm space-y-1 text-muted-foreground">
                          <li>• Monthly rental income: ${rentalIncome.toLocaleString()}</li>
                          <li>• Monthly expenses: ${result.totalMonthlyPayment.toLocaleString()}</li>
                          <li>• Annual cash flow: ${(result.cashFlow * 12).toLocaleString()}</li>
                          <li>• Break-even point: {result.cashFlow >= 0 ? 'Positive cash flow' : 'Negative cash flow'}</li>
                        </ul>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </div>

          {/* How It Works Section */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="w-5 h-5" />
                How the Mortgage Calculator Works
              </CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Mortgage Payment Calculation</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    The calculator uses the standard mortgage formula to determine your monthly principal and interest payment. 
                    It factors in the loan amount (property value minus down payment), interest rate, and loan term.
                  </p>
                  
                  <h4 className="font-semibold mb-2">Total Monthly Costs</h4>
                  <p className="text-sm text-muted-foreground">
                    Beyond principal and interest, the calculator includes property taxes, insurance, PMI (if applicable), 
                    and HOA fees to give you the complete monthly housing cost.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Investment Analysis</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    For investment properties, the calculator compares rental income to total monthly expenses to determine 
                    cash flow and calculates ROI based on your initial investment (down payment).
                  </p>
                  
                  <h4 className="font-semibold mb-2">Key Metrics</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• <strong>Cash Flow:</strong> Monthly rental income minus all expenses</li>
                    <li>• <strong>ROI:</strong> Annual cash flow divided by initial investment</li>
                    <li>• <strong>Total Interest:</strong> Amount paid in interest over loan term</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default MortgageCalculator;