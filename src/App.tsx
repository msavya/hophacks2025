import React, { useState } from 'react';
import { 
  Chrome, 
  Heart, 
  TrendingUp, 
  Gift, 
  Award, 
  Users, 
  Shield, 
  Star,
  Download,
  Play,
  Check,
  Sparkles,
  Target,
  BarChart3,
  LogIn,
  X,
  Mail,
  Lock
} from 'lucide-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import Dashboard from "./Dashboard";
import OnboardingForm from "./OnboardingForm";

function App() {
  const [activeFeature, setActiveFeature] = useState(0);
  const [showLogin, setShowLogin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userPreferences, setUserPreferences] = useState<any>(null);

  const features = [
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Automatic Round-Up",
      description: "Every purchase automatically rounds up to the nearest dollar, with the difference going to charity"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Impact Dashboard",
      description: "Track your total donations, see which causes you've supported, and visualize your impact over time"
    },
    {
      icon: <Gift className="w-8 h-8" />,
      title: "Collect Characters",
      description: "Unlock cute characters and open surprise blind boxes when you reach donation milestones"
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Earn Badges",
      description: "Collect achievement badges for different donation amounts and consistency streaks"
    }
  ];

  const stats = [
    { number: "$2.4M", label: "Donated by Users" },
    { number: "180K", label: "Lives Impacted" },
    { number: "50K+", label: "Active Donors" },
    { number: "25", label: "Partner Charities" }
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (isSignUp) {
      // Sign up new user
      createUserWithEmailAndPassword(auth, email, password)
        .then(() => {
          setIsLoggedIn(true);
          setShowLogin(false);
          setShowOnboarding(true); // Show onboarding for new users
          setEmail('');
          setPassword('');
        })
        .catch((error) => {
          setError(error.message);
        });
    } else {
      // Sign in existing user
      signInWithEmailAndPassword(auth, email, password)
        .then(() => {
          setIsLoggedIn(true);
          setShowLogin(false);
          setEmail('');
          setPassword('');
        })
        .catch((error) => {
          setError(error.message);
        });
    }
  };

  const handleLogout = () => {
    signOut(auth).then(() => {
      setIsLoggedIn(false);
      setShowOnboarding(false);
      setUserPreferences(null);
    }).catch((error) => {
      setError(error.message);
    });
  };

  const handleOnboardingComplete = async (preferences: any) => {
    setUserPreferences(preferences);
    setShowOnboarding(false);
    
    try {
      if (auth.currentUser) {
        await setDoc(doc(db, 'users', auth.currentUser.uid), {
          ...preferences,
          uid: auth.currentUser.uid,
          email: auth.currentUser.email
        });
        console.log('User preferences saved to Firestore');
      }
    } catch (error) {
      console.error('Error saving user preferences:', error);
    }
  };

  const handleOnboardingSkip = async () => {
    setShowOnboarding(false);
    // Set default preferences
    const defaultPreferences = {
      location: 'United States',
      interests: ['health', 'education'],
      reachOutLocally: false,
      localCity: '',
      localState: '',
      charitiesInterestedIn: []
    };
    
    setUserPreferences(defaultPreferences);
    
    try {
      if (auth.currentUser) {
        await setDoc(doc(db, 'users', auth.currentUser.uid), {
          ...defaultPreferences,
          uid: auth.currentUser.uid,
          email: auth.currentUser.email
        });
        console.log('Default user preferences saved to Firestore');
      }
    } catch (error) {
      console.error('Error saving default user preferences:', error);
    }
  };

  // Show Onboarding if user just signed up
  if (isLoggedIn && showOnboarding) {
    return <OnboardingForm onComplete={handleOnboardingComplete} onSkip={handleOnboardingSkip} />;
  }

  // Show Dashboard if user is logged in
  if (isLoggedIn) {
    return <Dashboard onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-green-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">RoundUp</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-600 hover:text-green-600 transition-colors">Features</a>
            <a href="#impact" className="text-gray-600 hover:text-green-600 transition-colors">Impact</a>
            <a href="#characters" className="text-gray-600 hover:text-green-600 transition-colors">Characters</a>
            <button 
              onClick={() => setShowLogin(true)}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all duration-300 flex items-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              Login
            </button>
            <button className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all duration-300 flex items-center gap-2">
              <Chrome className="w-4 h-4" />
              Add to Chrome
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Turn Your
              <span className="bg-gradient-to-r from-green-500 to-green-500 bg-clip-text text-transparent"> Spare Change</span>
              <br />Into Real Change
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Automatically round up your online purchases and donate the difference to charity. 
              Collect adorable characters, earn badges, and see your impact grow—one cent at a time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-green-500 to-green-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3">
                <Chrome className="w-5 h-5" />
                Add to Chrome - It's Free
              </button>
              <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-full text-lg font-semibold hover:border-gray-400 transition-colors flex items-center justify-center gap-3">
                <Play className="w-5 h-5" />
                Watch Demo
              </button>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="relative max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="text-sm text-gray-500">amazon.com</div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="font-semibold">Order Total: $47.23</span>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Rounded to: $48.00</div>
                    <div className="text-green-500 font-semibold">+$0.77 donated ❤️</div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white">
                        🐱
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">New Character Unlocked!</div>
                        <div className="text-sm text-gray-600">Charity Cat joined your collection</div>
                      </div>
                    </div>
                    <Sparkles className="w-6 h-6 text-blue-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-r from-green-50 to-green-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple, automatic, and rewarding. Start making a difference with every purchase.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 ${
                    activeFeature === index 
                      ? 'bg-white shadow-xl border-2 border-blue-200' 
                      : 'bg-white/50 hover:bg-white/70'
                  }`}
                  onClick={() => setActiveFeature(index)}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${
                      activeFeature === index 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                      <p className="text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl shadow-2xl p-8">
              {activeFeature === 0 && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-gray-900">Seamless Integration</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <Check className="w-5 h-5 text-blue-600" />
                      <span>Works on 1000+ shopping sites</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <Check className="w-5 h-5 text-blue-600" />
                      <span>No extra clicks required</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <Check className="w-5 h-5 text-blue-600" />
                      <span>Secure payment processing</span>
                    </div>
                  </div>
                </div>
              )}
              
              {activeFeature === 1 && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-gray-900">Track Your Impact</h3>
                  <div className="space-y-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">$127.50</div>
                      <div className="text-sm text-gray-600">Total Donated This Year</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-3 rounded-lg text-center">
                        <div className="text-lg font-bold text-blue-600">15</div>
                        <div className="text-xs text-gray-600">Charities Supported</div>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-lg text-center">
                        <div className="text-lg font-bold text-purple-600">892</div>
                        <div className="text-xs text-gray-600">People Helped</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeFeature === 2 && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-gray-900">Character Collection</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {['🐱', '🐶', '🐰', '🦊', '🐨', '🐼'].map((emoji, index) => (
                      <div key={index} className="bg-gradient-to-r from-blue-100 to-purple-100 p-4 rounded-xl text-center">
                        <div className="text-2xl mb-2">{emoji}</div>
                        <div className="text-xs text-gray-600">Unlocked</div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-4 rounded-lg border-2 border-dashed border-blue-300">
                    <div className="text-center text-gray-500">
                      <Gift className="w-8 h-8 mx-auto mb-2" />
                      <div className="text-sm">Next blind box at $200</div>
                    </div>
                  </div>
                </div>
              )}

              {activeFeature === 3 && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-gray-900">Achievement Badges</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-4 rounded-xl text-center">
                      <Award className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                      <div className="font-semibold text-sm">First Timer</div>
                      <div className="text-xs text-gray-600">Made first donation</div>
                    </div>
                    <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-xl text-center">
                      <Star className="w-8 h-8 mx-auto text-purple-600 mb-2" />
                      <div className="font-semibold text-sm">Century Club</div>
                      <div className="text-xs text-gray-600">Donated $100+</div>
                    </div>
                    <div className="bg-gradient-to-r from-indigo-100 to-blue-100 p-4 rounded-xl text-center">
                      <Target className="w-8 h-8 mx-auto text-indigo-600 mb-2" />
                      <div className="font-semibold text-sm">Consistency King</div>
                      <div className="text-xs text-gray-600">30 day streak</div>
                    </div>
                    <div className="bg-gray-100 p-4 rounded-xl text-center opacity-60">
                      <Heart className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                      <div className="font-semibold text-sm">Philanthropist</div>
                      <div className="text-xs text-gray-600">Donate $1000+</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trusted & Secure
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Your privacy and security are our top priorities. We never store your payment information.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Bank-Level Security</h3>
              <p className="text-gray-600">256-bit SSL encryption protects all your data</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Verified Charities</h3>
              <p className="text-gray-600">All partner organizations are vetted and certified</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">100% Transparent</h3>
              <p className="text-gray-600">Track exactly where your donations go</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-500 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Start Making a Difference Today
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of users who are changing the world, one purchase at a time. 
            It's free, fun, and incredibly rewarding.
          </p>
          <button className="bg-white text-gray-900 px-10 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 mx-auto">
            <Chrome className="w-5 h-5" />
            Add to Chrome - It's Free
            <Download className="w-5 h-5" />
          </button>
          <p className="text-blue-200 text-sm mt-4">
            No credit card required • Install in 30 seconds • Works everywhere
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5" />
                </div>
                <span className="text-lg font-bold">RoundUp</span>
              </div>
              <p className="text-gray-400">
                Turning spare change into real change, one purchase at a time.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">How it Works</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Charities</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 RoundUp. All rights reserved. Made with ❤️ for a better world.</p>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
            <button
              onClick={() => setShowLogin(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p className="text-gray-600">
                {isSignUp ? 'Sign up for your RoundUp account' : 'Sign in to your RoundUp account'}
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
              >
                {isSignUp ? 'Create Account' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                <button 
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError('');
                    setEmail('');
                    setPassword('');
                  }}
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  {isSignUp ? 'Sign in here' : 'Sign up here'}
                </button>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;