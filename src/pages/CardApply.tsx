import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Shield, CheckCircle, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useConnectedAccounts } from '@/hooks/useConnectedAccounts';
import { AppLayout } from '@/components/layout/AppLayout';

type CardType = 'secured' | 'credit';
type Step = 'select_type' | 'setup_collateral' | 'confirm';

export default function CardApplyPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('select_type');
  const [selectedType, setSelectedType] = useState<CardType>('secured');
  const [creditLimit, setCreditLimit] = useState(500);
  const [sourceAccountId, setSourceAccountId] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Fetch real user accounts for collateral
  const { accounts: savingsAccounts, isLoading: accountsLoading } = useConnectedAccounts({
    accountType: 'savings',
    minBalance: 100, // Minimum $100 balance required
  });

  const handleTypeSelection = (type: CardType) => {
    setSelectedType(type);
    if (type === 'secured') {
      setStep('setup_collateral');
    } else {
      setStep('confirm');
    }
  };

  const handleSubmitApplication = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create card account
      const { data: account, error: accountError } = await supabase
        .from('card_accounts')
        .insert({
          user_id: user.id,
          account_type: selectedType,
          credit_limit_cents: creditLimit * 100,
          available_cents: creditLimit * 100,
          status: 'pending',
        })
        .select()
        .single();

      if (accountError) throw accountError;

      // If secured, create collateral
      if (selectedType === 'secured' && sourceAccountId) {
        const { error: collateralError } = await supabase
          .from('card_collateral')
          .insert({
            account_id: account.id,
            user_id: user.id,
            source_account_id: sourceAccountId,
            collateral_cents: Math.max(10000, creditLimit * 100),
            status: 'active',
          });

        if (collateralError) throw collateralError;
      }

      // Create default controls
      await supabase
        .from('card_controls')
        .insert({
          account_id: account.id,
          user_id: user.id,
          daily_spend_limit_cents: 100000,
          single_transaction_limit_cents: 50000,
          international_enabled: false,
          online_enabled: true,
        });

      toast.success('Card application submitted successfully!');
      navigate('/card');
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  const cardTypes = [
    {
      type: 'secured' as CardType,
      title: 'Secured Charge Card',
      description: 'Build credit with your own collateral',
      features: [
        'No interest charges - pay in full each month',
        'Credit limit backed by your savings',
        'Build credit history',
        'No annual fee'
      ],
      recommended: true,
      disabled: false,
    },
    {
      type: 'credit' as CardType,
      title: 'Unsecured Credit Card',
      description: 'Traditional revolving credit (Coming Soon)',
      features: [
        'Revolving credit line',
        'Competitive APR rates',
        'Higher credit limits',
        'Flexible payments'
      ],
      recommended: false,
      disabled: true,
    },
  ];

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <CreditCard className="w-6 h-6 text-primary" />
              <div>
                <CardTitle>Apply for $ave+ Credit Card</CardTitle>
                <CardDescription>Choose the card that's right for you</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Progress Steps */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              {['Select Card', 'Setup', 'Confirm'].map((label, idx) => {
                const stepValue: Step = ['select_type', 'setup_collateral', 'confirm'][idx] as Step;
                const isActive = step === stepValue;
                const isPast = ['select_type', 'setup_collateral', 'confirm'].indexOf(step) > idx;
                
                return (
                  <div key={label} className="flex items-center gap-2 flex-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isActive ? 'bg-primary text-primary-foreground' : 
                      isPast ? 'bg-green-500 text-white' : 
                      'bg-muted text-muted-foreground'
                    }`}>
                      {isPast ? <CheckCircle className="w-5 h-5" /> : idx + 1}
                    </div>
                    <span className={`text-sm font-medium ${isActive || isPast ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {label}
                    </span>
                    {idx < 2 && <div className={`flex-1 h-1 mx-4 ${isPast ? 'bg-green-500' : 'bg-muted'}`} />}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        {step === 'select_type' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {cardTypes.map((cardType) => (
              <Card
                key={cardType.type}
                className={`cursor-pointer transition-all ${
                  selectedType === cardType.type ? 'ring-2 ring-primary' : ''
                } ${cardType.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}`}
                onClick={() => !cardType.disabled && handleTypeSelection(cardType.type)}
              >
                <CardHeader>
                  {cardType.recommended && (
                    <div className="bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full inline-block mb-2 w-fit">
                      Recommended
                    </div>
                  )}
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      {cardType.type === 'secured' ? (
                        <Shield className="w-6 h-6 text-primary" />
                      ) : (
                        <CreditCard className="w-6 h-6 text-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{cardType.title}</CardTitle>
                      <CardDescription>{cardType.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {cardType.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  {cardType.disabled && (
                    <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200 text-sm">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>Coming soon</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </motion.div>
        )}

        {step === 'setup_collateral' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Setup Collateral</CardTitle>
                <CardDescription>
                  Secured cards require collateral from your savings to back your credit limit
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="credit-limit">Requested Credit Limit</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">$</span>
                    <Input
                      id="credit-limit"
                      type="number"
                      value={creditLimit}
                      onChange={(e) => setCreditLimit(Number(e.target.value))}
                      min={100}
                      max={10000}
                      step={50}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Collateral required: ${Math.max(100, creditLimit).toFixed(2)}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="source-account">Source Account (Optional)</Label>
                  <Select value={sourceAccountId} onValueChange={setSourceAccountId}>
                    <SelectTrigger id="source-account" disabled={accountsLoading}>
                      <SelectValue placeholder={
                        accountsLoading 
                          ? "Loading accounts..." 
                          : savingsAccounts.length === 0 
                          ? "No eligible accounts available"
                          : "Select savings account..."
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {savingsAccounts.length === 0 ? (
                        <SelectItem value="" disabled>
                          No savings accounts with sufficient balance
                        </SelectItem>
                      ) : (
                        savingsAccounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.institution_name} - {account.account_type}
                            {(account.current_balance !== null || account.balance !== null) && 
                              ` ($${(account.current_balance || account.balance || 0).toFixed(2)})`
                            }
                            {account.account_mask && ` (...${account.account_mask})`}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {savingsAccounts.length === 0 && !accountsLoading && (
                    <p className="text-sm text-muted-foreground">
                      Connect a savings account with at least $100 to use as collateral
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep('select_type')}
                    className="flex-1"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep('confirm')}
                    className="flex-1"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 'confirm' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Review & Confirm</CardTitle>
                <CardDescription>Review your application details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Card Type:</span>
                    <span className="font-medium capitalize">{selectedType} Card</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Credit Limit:</span>
                    <span className="font-medium">${creditLimit.toFixed(2)}</span>
                  </div>
                  {selectedType === 'secured' && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Collateral:</span>
                      <span className="font-medium">${Math.max(100, creditLimit).toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    By submitting this application, you agree to the $ave+ credit card terms and conditions.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep(selectedType === 'secured' ? 'setup_collateral' : 'select_type')}
                    className="flex-1"
                    disabled={loading}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={handleSubmitApplication}
                    className="flex-1"
                    disabled={loading}
                  >
                    {loading ? 'Submitting...' : 'Submit Application'}
                    <CheckCircle className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}
