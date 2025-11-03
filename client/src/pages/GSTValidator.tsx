import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Shield, CheckCircle2, XCircle, Calculator, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

export default function GSTValidator() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [gstin, setGstin] = useState("");
  const [hsn, setHsn] = useState("");
  const [amount, setAmount] = useState("");
  const [gstRate, setGstRate] = useState("18");
  const [gstType, setGstType] = useState<'IGST' | 'CGST_SGST'>('IGST');

  const validateGSTINMutation = useMutation({
    mutationFn: async (gstinValue: string) => {
      return apiRequest('POST', '/api/validate/gstin', { gstin: gstinValue });
    },
  });

  const validateHSNMutation = useMutation({
    mutationFn: async (hsnValue: string) => {
      return apiRequest('POST', '/api/validate/hsn', { hsn: hsnValue });
    },
  });

  const calculateGSTMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/calculate-gst', {
        amount: parseFloat(amount),
        gstRate: parseFloat(gstRate),
        type: gstType,
      });
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="h-16 border-b flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold" data-testid="text-validator-title">GST Validator</h1>
              <p className="text-xs text-muted-foreground">Validate GSTIN, HSN codes, and calculate GST</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-8 space-y-8">
        {/* GSTIN Validation */}
        <Card>
          <CardHeader>
            <CardTitle>GSTIN Validation</CardTitle>
            <CardDescription>
              Validate Goods and Services Tax Identification Number format
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>GSTIN</Label>
              <div className="flex gap-2">
                <Input
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value.toUpperCase())}
                  placeholder="29ABCDE1234F1Z5"
                  className="font-mono"
                  data-testid="input-gstin"
                />
                <Button
                  onClick={() => validateGSTINMutation.mutate(gstin)}
                  disabled={!gstin || validateGSTINMutation.isPending}
                  data-testid="button-validate-gstin"
                >
                  Validate
                </Button>
              </div>
            </div>

            {validateGSTINMutation.data && (
              <div className={`flex items-center gap-2 p-3 rounded-lg ${
                validateGSTINMutation.data.valid 
                  ? 'bg-green-500/10 text-green-600' 
                  : 'bg-red-500/10 text-red-600'
              }`}>
                {validateGSTINMutation.data.valid ? (
                  <>
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-medium">Valid GSTIN format</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5" />
                    <span className="font-medium">Invalid GSTIN format</span>
                  </>
                )}
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Format: 2 digits (state code) + 10 alphanumeric + 1 letter + 1 digit + 1 letter + 1 alphanumeric
            </p>
          </CardContent>
        </Card>

        {/* HSN Validation */}
        <Card>
          <CardHeader>
            <CardTitle>HSN Code Validation</CardTitle>
            <CardDescription>
              Validate Harmonized System of Nomenclature codes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>HSN Code</Label>
              <div className="flex gap-2">
                <Input
                  value={hsn}
                  onChange={(e) => setHsn(e.target.value)}
                  placeholder="8471 or 847130 or 84713020"
                  className="font-mono"
                  data-testid="input-hsn"
                />
                <Button
                  onClick={() => validateHSNMutation.mutate(hsn)}
                  disabled={!hsn || validateHSNMutation.isPending}
                  data-testid="button-validate-hsn"
                >
                  Validate
                </Button>
              </div>
            </div>

            {validateHSNMutation.data && (
              <div className={`flex items-center gap-2 p-3 rounded-lg ${
                validateHSNMutation.data.valid 
                  ? 'bg-green-500/10 text-green-600' 
                  : 'bg-red-500/10 text-red-600'
              }`}>
                {validateHSNMutation.data.valid ? (
                  <>
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-medium">Valid HSN code format</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5" />
                    <span className="font-medium">Invalid HSN code format</span>
                  </>
                )}
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              HSN codes can be 4, 6, or 8 digits
            </p>
          </CardContent>
        </Card>

        {/* GST Calculator */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              GST Calculator
            </CardTitle>
            <CardDescription>
              Calculate IGST or CGST+SGST for transactions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Taxable Amount (₹)</Label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="10000"
                  data-testid="input-amount"
                />
              </div>
              <div>
                <Label>GST Rate (%)</Label>
                <Select value={gstRate} onValueChange={setGstRate}>
                  <SelectTrigger data-testid="select-gst-rate">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5%</SelectItem>
                    <SelectItem value="12">12%</SelectItem>
                    <SelectItem value="18">18%</SelectItem>
                    <SelectItem value="28">28%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>GST Type</Label>
              <Select value={gstType} onValueChange={(v: any) => setGstType(v)}>
                <SelectTrigger data-testid="select-gst-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IGST">IGST (Interstate)</SelectItem>
                  <SelectItem value="CGST_SGST">CGST + SGST (Intrastate)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={() => calculateGSTMutation.mutate()}
              disabled={!amount || calculateGSTMutation.isPending}
              className="w-full"
              data-testid="button-calculate"
            >
              Calculate GST
            </Button>

            {calculateGSTMutation.data && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-6 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Taxable Amount:</span>
                    <span className="font-semibold">₹{amount}</span>
                  </div>
                  {calculateGSTMutation.data.igst !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">IGST ({gstRate}%):</span>
                      <span className="font-semibold">₹{calculateGSTMutation.data.igst.toFixed(2)}</span>
                    </div>
                  )}
                  {calculateGSTMutation.data.cgst !== undefined && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">CGST ({parseFloat(gstRate) / 2}%):</span>
                        <span className="font-semibold">₹{calculateGSTMutation.data.cgst.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">SGST ({parseFloat(gstRate) / 2}%):</span>
                        <span className="font-semibold">₹{calculateGSTMutation.data.sgst.toFixed(2)}</span>
                      </div>
                    </>
                  )}
                  <div className="border-t pt-3 flex justify-between text-lg">
                    <span className="font-semibold">Total Amount:</span>
                    <span className="font-bold text-primary">₹{calculateGSTMutation.data.total.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
