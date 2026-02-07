import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Home, DollarSign, Key, Building2, MapPin, Wallet, ChevronRight, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Question {
  id: string;
  question: string;
  options: {
    label: string;
    value: string;
    icon: React.ReactNode;
    description: string;
  }[];
}

const questions: Question[] = [
  {
    id: 'intent',
    question: 'What brings you to KeyNestHub today?',
    options: [
      {
        label: 'Buy a Property',
        value: 'buy',
        icon: <Home className="h-6 w-6" />,
        description: 'Find your dream home or investment property'
      },
      {
        label: 'Sell a Property',
        value: 'sell',
        icon: <DollarSign className="h-6 w-6" />,
        description: 'List and sell your property'
      },
      {
        label: 'Rent a Property',
        value: 'rent',
        icon: <Key className="h-6 w-6" />,
        description: 'Find apartments, houses, or office spaces to rent'
      },
      {
        label: 'Just Exploring',
        value: 'explore',
        icon: <Building2 className="h-6 w-6" />,
        description: 'Browse the market and learn more'
      }
    ]
  },
  {
    id: 'location',
    question: 'Which region are you interested in?',
    options: [
      {
        label: 'Nairobi',
        value: 'nairobi',
        icon: <MapPin className="h-6 w-6" />,
        description: 'Kenya\'s capital and largest city'
      },
      {
        label: 'Mombasa',
        value: 'mombasa',
        icon: <MapPin className="h-6 w-6" />,
        description: 'Coastal city with beach properties'
      },
      {
        label: 'Kisumu & Western',
        value: 'western',
        icon: <MapPin className="h-6 w-6" />,
        description: 'Lakeside and western regions'
      },
      {
        label: 'All Regions',
        value: 'all',
        icon: <MapPin className="h-6 w-6" />,
        description: 'Show me properties everywhere'
      }
    ]
  },
  {
    id: 'budget',
    question: 'What\'s your budget range?',
    options: [
      {
        label: 'Under KES 5M',
        value: 'under5m',
        icon: <Wallet className="h-6 w-6" />,
        description: 'Entry-level properties'
      },
      {
        label: 'KES 5M - 15M',
        value: '5m-15m',
        icon: <Wallet className="h-6 w-6" />,
        description: 'Mid-range properties'
      },
      {
        label: 'KES 15M - 50M',
        value: '15m-50m',
        icon: <Wallet className="h-6 w-6" />,
        description: 'Premium properties'
      },
      {
        label: 'Above KES 50M',
        value: 'above50m',
        icon: <Wallet className="h-6 w-6" />,
        description: 'Luxury properties'
      }
    ]
  }
];

const STORAGE_KEY = 'keynesthub_triage_completed';
const PREFERENCES_KEY = 'keynesthub_user_preferences';

export const IntentTriageModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has already completed triage
    const hasCompleted = localStorage.getItem(STORAGE_KEY);
    if (!hasCompleted) {
      // Small delay to let the page load first
      const timer = setTimeout(() => setIsOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSelect = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    // Save preferences
    localStorage.setItem(STORAGE_KEY, 'true');
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(answers));
    setIsOpen(false);

    // Navigate based on intent
    const intent = answers.intent;
    switch (intent) {
      case 'buy':
        navigate('/buy/residential');
        break;
      case 'sell':
        navigate('/sell/list-property');
        break;
      case 'rent':
        navigate('/rent/apartments');
        break;
      default:
        // Stay on homepage for explorers
        break;
    }
  };

  const handleSkip = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsOpen(false);
  };

  const currentQuestion = questions[currentStep];
  const isCurrentAnswered = !!answers[currentQuestion?.id];
  const progress = ((currentStep + 1) / questions.length) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-muted">
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="p-6">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl">
              {currentQuestion?.question}
            </DialogTitle>
            <DialogDescription>
              Step {currentStep + 1} of {questions.length} — Help us personalize your experience
            </DialogDescription>
          </DialogHeader>

          {/* Options */}
          <div className="grid gap-3 mb-6">
            {currentQuestion?.options.map((option) => (
              <Card
                key={option.value}
                className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                  answers[currentQuestion.id] === option.value
                    ? 'ring-2 ring-primary bg-primary/5'
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => handleSelect(currentQuestion.id, option.value)}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${
                    answers[currentQuestion.id] === option.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {option.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{option.label}</h4>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                  {answers[currentQuestion.id] === option.value && (
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div>
              {currentStep > 0 ? (
                <Button variant="ghost" onClick={handleBack}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              ) : (
                <Button variant="ghost" onClick={handleSkip}>
                  Skip for now
                </Button>
              )}
            </div>
            <Button 
              onClick={handleNext}
              disabled={!isCurrentAnswered}
            >
              {currentStep === questions.length - 1 ? 'Get Started' : 'Continue'}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
