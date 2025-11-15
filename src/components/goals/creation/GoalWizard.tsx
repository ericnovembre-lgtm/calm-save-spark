import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { pageCurl } from '@/lib/motion-variants-advanced';

interface GoalWizardProps {
  onComplete: (data: any) => void;
  onCancel: () => void;
}

/**
 * Multi-step goal creation wizard with page curl transitions
 */
export const GoalWizard = ({ onComplete, onCancel }: GoalWizardProps) => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<any>({});

  const steps = [
    { id: 'type', title: 'What are you saving for?', component: StepType },
    { id: 'amount', title: 'How much do you need?', component: StepAmount },
    { id: 'timeline', title: 'When do you need it?', component: StepTimeline },
    { id: 'automation', title: 'Set up auto-save?', component: StepAutomation },
    { id: 'review', title: 'Review your goal', component: StepReview }
  ];

  const CurrentStep = steps[step].component;

  const handleNext = (data: any) => {
    setFormData({ ...formData, ...data });
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete({ ...formData, ...data });
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto h-full flex flex-col items-center justify-center p-6">
        {/* Progress indicator */}
        <div className="w-full max-w-2xl mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((s, i) => (
              <div
                key={s.id}
                className={`flex-1 h-2 rounded-full transition-colors ${
                  i <= step ? 'bg-primary' : 'bg-muted'
                }`}
                style={{ marginRight: i < steps.length - 1 ? '0.5rem' : 0 }}
              />
            ))}
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Step {step + 1} of {steps.length}
            </span>
            <span className="font-semibold text-foreground">
              {steps[step].title}
            </span>
          </div>
        </div>

        {/* Step content with page curl animation */}
        <div className="w-full max-w-2xl relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              variants={pageCurl}
              initial="enter"
              animate="animate"
              exit="exit"
              className="bg-card rounded-3xl p-8 shadow-2xl"
              style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
            >
              <CurrentStep
                data={formData}
                onNext={handleNext}
                onBack={handleBack}
                isFirst={step === 0}
                isLast={step === steps.length - 1}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Cancel button */}
        <Button
          variant="ghost"
          onClick={onCancel}
          className="mt-6"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

// Step components (simplified for now)
const StepType = ({ onNext }: any) => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-center">Choose Goal Type</h2>
    <div className="grid grid-cols-2 gap-4">
      {['Emergency Fund', 'Vacation', 'Home', 'Education'].map(type => (
        <Button
          key={type}
          variant="outline"
          size="lg"
          onClick={() => onNext({ type })}
          className="h-24 text-lg"
        >
          {type}
        </Button>
      ))}
    </div>
  </div>
);

const StepAmount = ({ onNext, onBack }: any) => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-center">Set Target Amount</h2>
    <input
      type="number"
      placeholder="Enter amount"
      className="w-full p-4 text-2xl text-center rounded-xl border-2 border-border focus:border-primary outline-none"
    />
    <div className="flex gap-4">
      <Button variant="outline" onClick={onBack} className="flex-1">
        <ChevronLeft className="mr-2" /> Back
      </Button>
      <Button onClick={() => onNext({ amount: 5000 })} className="flex-1">
        Next <ChevronRight className="ml-2" />
      </Button>
    </div>
  </div>
);

const StepTimeline = ({ onNext, onBack }: any) => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-center">Set Timeline</h2>
    <input
      type="date"
      className="w-full p-4 text-xl text-center rounded-xl border-2 border-border focus:border-primary outline-none"
    />
    <div className="flex gap-4">
      <Button variant="outline" onClick={onBack} className="flex-1">
        <ChevronLeft className="mr-2" /> Back
      </Button>
      <Button onClick={() => onNext({ deadline: '2025-12-31' })} className="flex-1">
        Next <ChevronRight className="ml-2" />
      </Button>
    </div>
  </div>
);

const StepAutomation = ({ onNext, onBack }: any) => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-center">Auto-Save Setup</h2>
    <p className="text-center text-muted-foreground">Enable automatic savings?</p>
    <div className="flex gap-4">
      <Button variant="outline" onClick={onBack} className="flex-1">
        <ChevronLeft className="mr-2" /> Back
      </Button>
      <Button onClick={() => onNext({ autoSave: true })} className="flex-1">
        Next <ChevronRight className="ml-2" />
      </Button>
    </div>
  </div>
);

const StepReview = ({ data, onNext, onBack }: any) => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-center">Review Goal</h2>
    <div className="space-y-2 text-center">
      <p><strong>Type:</strong> {data.type}</p>
      <p><strong>Amount:</strong> ${data.amount}</p>
      <p><strong>Deadline:</strong> {data.deadline}</p>
    </div>
    <div className="flex gap-4">
      <Button variant="outline" onClick={onBack} className="flex-1">
        <ChevronLeft className="mr-2" /> Back
      </Button>
      <Button onClick={() => onNext(data)} className="flex-1">
        <Check className="mr-2" /> Create Goal
      </Button>
    </div>
  </div>
);
