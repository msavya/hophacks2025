import React, { useState } from 'react';
import { 
  MapPin, 
  Heart, 
  Globe, 
  Users, 
  Shield, 
  BookOpen, 
  Zap, 
  Check,
  ArrowRight,
  X
} from 'lucide-react';

interface OnboardingFormProps {
  onComplete: (preferences: UserPreferences) => void;
  onSkip: () => void;
}

interface UserPreferences {
  location: string;
  interests: string[];
  reachOutLocally: boolean;
  localCity: string;
  localState: string;
  charitiesInterestedIn: string[];
  
}

function OnboardingForm({ onComplete, onSkip }: OnboardingFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [preferences, setPreferences] = useState<UserPreferences>({
    location: '',
    interests: [],
    reachOutLocally: false,
    localCity: '',
    localState: '',
    charitiesInterestedIn: []
  });

  const locations = [
    'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 
    'France', 'Japan', 'Brazil', 'India', 'South Africa', 'Other'
  ];

  const interestCategories = [
    { id: 'health', name: 'Health & Medical', icon: Heart, description: 'Medical research, healthcare access, disease prevention' },
    { id: 'education', name: 'Education', icon: BookOpen, description: 'Schools, literacy, educational opportunities' },
    { id: 'environment', name: 'Environment', icon: Globe, description: 'Climate change, conservation, sustainability' },
    { id: 'poverty', name: 'Poverty Relief', icon: Users, description: 'Hunger relief, housing, economic development' },
    { id: 'human-rights', name: 'Human Rights', icon: Shield, description: 'Social justice, equality, civil rights' },
    { id: 'disaster', name: 'Disaster Relief', icon: Zap, description: 'Emergency response, disaster recovery' }
  ];

  const donationFrequencies = [
    { id: 'weekly', name: 'Weekly', description: 'Small, frequent donations' },
    { id: 'monthly', name: 'Monthly', description: 'Regular monthly contributions' },
    { id: 'quarterly', name: 'Quarterly', description: 'Seasonal giving' },
    { id: 'yearly', name: 'Yearly', description: 'Annual charitable giving' }
  ];

  const handleInterestToggle = (interestId: string) => {
    setPreferences(prev => ({
      ...prev,
      interests: prev.interests.includes(interestId)
        ? prev.interests.filter(id => id !== interestId)
        : [...prev.interests, interestId]
    }));
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(preferences);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return preferences.location !== '';
      case 2:
        return preferences.interests.length > 0;
      case 3:
        return true; // Step 3 is always valid now
      case 4:
        // If they want to reach out locally, require city and state
        if (preferences.reachOutLocally) {
          return preferences.localCity !== '' && preferences.localState !== '';
        }
        return true; // If they don't want local outreach, step is valid
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-50 via-white to-turquoise-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-ocean-500 to-turquoise-600 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Welcome to RoundUp!</span>
            </div>
            <button
              onClick={onSkip}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Progress Bar */}
           <div className="mt-4">
             <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
               <span>Step {currentStep} of 4</span>
               <span>{Math.round((currentStep / 4) * 100)}% Complete</span>
             </div>
             <div className="w-full bg-gray-200 rounded-full h-2">
               <div 
                 className="bg-gradient-to-r from-ocean-500 to-turquoise-600 h-2 rounded-full transition-all duration-300"
                 style={{ width: `${(currentStep / 4) * 100}%` }}
               ></div>
             </div>
           </div>
        </div>

        <div className="p-8">
          {/* Step 1: Location */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-ocean-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-ocean-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Where are you located?</h2>
                <p className="text-gray-600">This helps us recommend local charities and causes in your area.</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {locations.map((location) => (
                  <button
                    key={location}
                    onClick={() => setPreferences(prev => ({ ...prev, location }))}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      preferences.location === location
                        ? 'border-ocean-500 bg-ocean-50 text-ocean-700'
                        : 'border-gray-200 hover:border-ocean-300 hover:bg-ocean-50'
                    }`}
                  >
                    {location}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Interests */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-turquoise-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-turquoise-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">What causes matter to you?</h2>
                <p className="text-gray-600">Select all that apply. We'll personalize your charity recommendations.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {interestCategories.map((category) => {
                  const Icon = category.icon;
                  const isSelected = preferences.interests.includes(category.id);
                  
                  return (
                    <button
                      key={category.id}
                      onClick={() => handleInterestToggle(category.id)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        isSelected
                          ? 'border-ocean-500 bg-ocean-50'
                          : 'border-gray-200 hover:border-ocean-300 hover:bg-ocean-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          isSelected ? 'bg-ocean-100' : 'bg-gray-100'
                        }`}>
                          <Icon className={`w-5 h-5 ${isSelected ? 'text-ocean-600' : 'text-gray-600'}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                          <p className="text-sm text-gray-600">{category.description}</p>
                        </div>
                        {isSelected && (
                          <Check className="w-5 h-5 text-ocean-600" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

           {/* Step 3: Local Outreach Option */}
           {currentStep === 3 && (
             <div className="space-y-6">
               <div className="text-center">
                 <div className="w-16 h-16 bg-lime-100 rounded-full flex items-center justify-center mx-auto mb-4">
                   <Zap className="w-8 h-8 text-lime-600" />
                 </div>
                 <h2 className="text-2xl font-bold text-gray-900 mb-2">Local Impact</h2>
                 <p className="text-gray-600">Would you like to support charities in your local area?</p>
               </div>

               <div className="space-y-6">
                 {/* Option to reach out to more local charities */}
                 <div className="p-6 bg-ocean-50 rounded-xl border border-ocean-200 flex items-center gap-4">
                   <input
                     type="checkbox"
                     id="reachOutLocally"
                     checked={preferences.reachOutLocally}
                     onChange={e => setPreferences(prev => ({ ...prev, reachOutLocally: e.target.checked }))}
                     className="w-5 h-5 accent-ocean-600"
                   />
                   <label htmlFor="reachOutLocally" className="text-gray-800 font-medium cursor-pointer">
                     I want to reach out to more charities locally to see the direct impact I'm making
                   </label>
                 </div>

                 <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                   <div className="flex items-start gap-3">
                     <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                       <Heart className="w-3 h-3 text-blue-600" />
                     </div>
                     <div>
                       <h4 className="font-semibold text-blue-900 mb-1">Why Local Matters</h4>
                       <p className="text-sm text-blue-700">
                         Supporting local charities helps you see the direct impact of your donations in your community and builds stronger connections with causes you care about.
                       </p>
                     </div>
                   </div>
                 </div>
               </div>
             </div>
            )}

           {/* Step 4: Local Location Details */}
           {currentStep === 4 && preferences.reachOutLocally && (
             <div className="space-y-6">
               <div className="text-center">
                 <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                   <MapPin className="w-8 h-8 text-blue-600" />
                 </div>
                 <h2 className="text-2xl font-bold text-gray-900 mb-2">Tell us your local area</h2>
                 <p className="text-gray-600">This helps us connect you with charities in your specific city and state.</p>
               </div>

               <div className="space-y-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                   <input
                     type="text"
                     value={preferences.localCity}
                     onChange={(e) => setPreferences(prev => ({ ...prev, localCity: e.target.value }))}
                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent transition-colors"
                     placeholder="Enter your city"
                     required
                   />
                 </div>

                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">State/Province</label>
                   <input
                     type="text"
                     value={preferences.localState}
                     onChange={(e) => setPreferences(prev => ({ ...prev, localState: e.target.value }))}
                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent transition-colors"
                     placeholder="Enter your state or province"
                     required
                   />
                 </div>

                 <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                   <div className="flex items-start gap-3">
                     <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                       <Heart className="w-3 h-3 text-blue-600" />
                     </div>
                     <div>
                       <h4 className="font-semibold text-blue-900 mb-1">Local Impact</h4>
                       <p className="text-sm text-blue-700">
                         We'll help you find charities in {preferences.localCity}, {preferences.localState} so you can see the direct impact of your donations in your community.
                       </p>
                     </div>
                   </div>
                 </div>
               </div>
             </div>
           )}

           {/* Step 4: Skip message if not reaching out locally */}
           {currentStep === 4 && !preferences.reachOutLocally && (
             <div className="space-y-6">
               <div className="text-center">
                 <div className="w-16 h-16 bg-ocean-100 rounded-full flex items-center justify-center mx-auto mb-4">
                   <Check className="w-8 h-8 text-ocean-600" />
                 </div>
                 <h2 className="text-2xl font-bold text-gray-900 mb-2">Setup Complete!</h2>
                 <p className="text-gray-600">You're all set to start making a difference with RoundUp.</p>
               </div>

               <div className="bg-ocean-50 p-6 rounded-xl border border-ocean-200">
                 <h3 className="font-semibold text-ocean-900 mb-3">What's next?</h3>
                 <ul className="space-y-2 text-sm text-ocean-700">
                   <li className="flex items-center gap-2">
                     <Check className="w-4 h-4" />
                     Start making purchases to trigger automatic donations
                   </li>
                   <li className="flex items-center gap-2">
                     <Check className="w-4 h-4" />
                     Track your impact in the dashboard
                   </li>
                   <li className="flex items-center gap-2">
                     <Check className="w-4 h-4" />
                     Unlock characters and earn badges
                   </li>
                 </ul>
               </div>
             </div>
           )}

           {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`px-6 py-2 rounded-lg transition-colors ${
                currentStep === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Back
            </button>

            <div className="flex gap-3">
              <button
                onClick={onSkip}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Skip for now
              </button>
               <button
                 onClick={handleNext}
                 disabled={!isStepValid()}
                 className={`px-6 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                   isStepValid()
                     ? 'bg-ocean-500 text-white hover:bg-ocean-600'
                     : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                 }`}
               >
                 {currentStep === 4 ? 'Complete Setup' : 'Next'}
                 {currentStep < 4 && <ArrowRight className="w-4 h-4" />}
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OnboardingForm;
