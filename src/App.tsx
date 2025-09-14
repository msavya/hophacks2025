import React, { useState } from "react";
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
  Lock,
} from "lucide-react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import Dashboard from "./Dashboard";
import OnboardingForm from "./OnboardingForm";

function App() {
  const [activeFeature, setActiveFeature] = useState(0);
  const [showLogin, setShowLogin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userPreferences, setUserPreferences] = useState<any>(null);

  const features = [
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Automatic Round-Up",
      description:
        "Every purchase automatically rounds up to the nearest dollar, with the difference going to charity",
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Impact Dashboard",
      description:
        "Track your total donations, see which causes you've supported, and visualize your impact over time",
    },
    {
      icon: <Gift className="w-8 h-8" />,
      title: "Collect Characters",
      description: "Unlock cute characters and open surprise blind boxes",
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Earn Badges",
      description: "Collect achievement badges for different donation amounts",
    },
  ];

  const stats = [
    { number: "$2.4M", label: "Donated by Users" },
    { number: "180K", label: "Lives Impacted" },
    { number: "50K+", label: "Active Donors" },
    { number: "25", label: "Partner Charities" },
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isSignUp) {
      // Sign up new user
      createUserWithEmailAndPassword(auth, email, password)
        .then(() => {
          setIsLoggedIn(true);
          setShowLogin(false);
          setShowOnboarding(true); // Show onboarding for new users
          setEmail("");
          setPassword("");
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
          setEmail("");
          setPassword("");
        })
        .catch((error) => {
          setError(error.message);
        });
    }
  };

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        setIsLoggedIn(false);
        setShowOnboarding(false);
        setUserPreferences(null);
      })
      .catch((error) => {
        setError(error.message);
      });
  };

  const handleOnboardingComplete = async (preferences: any) => {
    setUserPreferences(preferences);
    setShowOnboarding(false);

    try {
      if (auth.currentUser) {
        await setDoc(doc(db, "users", auth.currentUser.uid), {
          ...preferences,
          uid: auth.currentUser.uid,
          email: auth.currentUser.email,
        });
        console.log("User preferences saved to Firestore");
      }
    } catch (error) {
      console.error("Error saving user preferences:", error);
    }
  };

  const handleOnboardingSkip = async () => {
    setShowOnboarding(false);
    // Set default preferences
    const defaultPreferences = {
      location: "United States",
      interests: ["health", "education"],
      reachOutLocally: false,
      localCity: "",
      localState: "",
      charitiesInterestedIn: [],
    };

    setUserPreferences(defaultPreferences);

    try {
      if (auth.currentUser) {
        await setDoc(doc(db, "users", auth.currentUser.uid), {
          ...defaultPreferences,
          uid: auth.currentUser.uid,
          email: auth.currentUser.email,
        });
        console.log("Default user preferences saved to Firestore");
      }
    } catch (error) {
      console.error("Error saving default user preferences:", error);
    }
  };

  // Show Onboarding if user just signed up
  if (isLoggedIn && showOnboarding) {
    return (
      <OnboardingForm
        onComplete={handleOnboardingComplete}
        onSkip={handleOnboardingSkip}
      />
    );
  }

  // Show Dashboard if user is logged in
  if (isLoggedIn) {
    return <Dashboard onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen ocean-bg">
      {/* Animated Bubbles */}
      <div className="bubble"></div>
      <div className="bubble"></div>
      <div className="bubble"></div>
      <div className="bubble"></div>
      <div className="bubble"></div>
      <div className="bubble"></div>
      <div className="bubble"></div>
      <div className="bubble"></div>
      <div className="bubble"></div>

      {/* Swimming Characters */}
      <div className="swimming-character fish1">
        <img src="/FionaTheFish.png" alt="Fiona" className="character-img" />
      </div>
      <div className="swimming-character fish2">
        <img src="/GeraldTheSquid.png" alt="Gerald" className="character-img" />
      </div>
      <div className="swimming-character fish3">
        <img src="/OswaldTheWhale.png" alt="Oswald" className="character-img" />
      </div>
      <div className="swimming-character fish4">
        <img src="/ShellyShark.png" alt="Shelly" className="character-img" />
      </div>
      <div className="swimming-character fish5">
        <img
          src="/TerrenceTheTurtle.png"
          alt="Terrence"
          className="character-img"
        />
      </div>
      <div className="swimming-character fish6">
        <img src="/TravisTheCroc.png" alt="Travis" className="character-img" />
      </div>
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/favicon.ico" alt="RippleEffect" className="w-8 h-8" />
            <span className="text-xl font-bold text-gray-900">
              RippleEffect
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-gray-600 hover:text-ocean-600 transition-colors"
            >
              Features
            </a>
            <a
              href="#characters"
              className="text-gray-600 hover:text-ocean-600 transition-colors"
            >
              Characters
            </a>
            <button
              onClick={() => setShowLogin(true)}
              className="bg-gradient-to-r from-blue-800 to-blue-600 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all duration-300 flex items-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              Login
            </button>
            <button className="bg-gradient-to-r from-blue-800 to-blue-600 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all duration-300 flex items-center gap-2">
              <Chrome className="w-4 h-4" />
              Add to Chrome
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
              Turn Your
              <span className="bg-gradient-to-r from-blue-800 to-blue-800 bg-clip-text text-transparent">
                {" "}
                Spare Change
              </span>
              <br />
              Into Real Change
            </h1>
            <p className="text-xl text-white/90 mb-8 leading-relaxed drop-shadow-md">
              Automatically round up your online purchases and donate the
              difference to charity. Collect adorable characters, earn badges,
              and see your impact grow—one cent at a time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-blue-800 to-blue-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3">
                <Chrome className="w-5 h-5" />
                Add to Chrome - It's Free
              </button>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="relative max-w-4xl mx-auto z-10">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-ocean-500 rounded-full"></div>
                </div>
                <div className="text-sm text-gray-500">amazon.com</div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="font-semibold">Order Total: $47.23</span>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">
                      Rounded to: $48.00
                    </div>
                    <div className="text-ocean-500 font-semibold">
                      +$0.77 donated ❤️
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-ocean-50 to-turquoise-50 p-4 rounded-lg border border-ocean-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r from-yellow-400 to-orange-500">
                        <img
                          src="/OswaldTheWhale.png" // replace with correct PNG path
                          alt="Oswald the Whale"
                          className="w-8 h-8 object-contain"
                        />
                      </div>

                      <div>
                        <div className="font-semibold text-gray-900">
                          New Character Unlocked!
                        </div>
                        <div className="text-sm text-gray-600">
                          Oswald the Whale joined your collection
                        </div>
                      </div>
                    </div>
                    <Sparkles className="w-6 h-6 text-ocean-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-20 bg-gradient-to-r from-ocean-50 to-turquoise-50"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple, automatic, and rewarding. Start making a difference with
              every purchase.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 ${
                    activeFeature === index
                      ? "bg-white shadow-xl border-2 border-ocean-200"
                      : "bg-white/50 hover:bg-white/70"
                  }`}
                  onClick={() => setActiveFeature(index)}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-xl ${
                        activeFeature === index
                          ? "bg-gradient-to-r from-ocean-500 to-turquoise-600 text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl shadow-2xl p-8">
              {activeFeature === 0 && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-gray-900">
                    Seamless Integration
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-ocean-50 rounded-lg">
                      <Check className="w-5 h-5 text-ocean-600" />
                      <span>Works on several shopping sites</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-ocean-50 rounded-lg">
                      <Check className="w-5 h-5 text-ocean-600" />
                      <span>No extra clicks required</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-ocean-50 rounded-lg">
                      <Check className="w-5 h-5 text-ocean-600" />
                      <span>Secure payment processing</span>
                    </div>
                  </div>
                </div>
              )}

              {activeFeature === 1 && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-gray-900">
                    Track Your Impact
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-ocean-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-ocean-600">
                        $127.50
                      </div>
                      <div className="text-sm text-gray-600">
                        Total Donated This Year
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-ocean-50 p-3 rounded-lg text-center">
                        <div className="text-lg font-bold text-ocean-600">
                          15
                        </div>
                        <div className="text-xs text-gray-600">
                          Charities Supported
                        </div>
                      </div>
                      <div className="bg-turquoise-50 p-3 rounded-lg text-center">
                        <div className="text-lg font-bold text-turquoise-600">
                          892
                        </div>
                        <div className="text-xs text-gray-600">
                          People Helped
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeFeature === 2 && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-gray-900">
                    Character Collection
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { name: "Charity Cat", src: "/GeraldTheSquid.png" },
                      { name: "Generous Dog", src: "/OswaldTheWhale.png" },
                      { name: "Helpful Bunny", src: "/ShellyShark.png" },
                      { name: "Friendly Fox", src: "/FionaTheFish.png" },
                      { name: "Kind Koala", src: "/TerrenceTheTurtle.png" },
                      { name: "Playful Panda", src: "/TravisTheCroc.png" },
                    ].map((char, index) => (
                      <div
                        key={index}
                        className="bg-gradient-to-r from-ocean-100 to-turquoise-100 p-4 rounded-xl text-center"
                      >
                        <img
                          src={char.src}
                          alt={char.name}
                          className="w-12 h-12 mx-auto mb-2 object-contain"
                        />
                        <div className="text-xs text-gray-600">Unlocked</div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-gradient-to-r from-ocean-100 to-turquoise-100 p-4 rounded-lg border-2 border-dashed border-ocean-300">
                    <div className="text-center text-gray-500">
                      <Gift className="w-8 h-8 mx-auto mb-2" />
                      <div className="text-sm">Next blind box at $200</div>
                    </div>
                  </div>
                </div>
              )}

              {activeFeature === 3 && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-gray-900">
                    Achievement Badges
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      {
                        name: "First Timer",
                        src: "/First-timer.png",
                        description: "Made first donation",
                        bg: "from-ocean-100 to-turquoise-100",
                      },
                      {
                        name: "Philanthropic 5",
                        src: "/5-year.png",
                        description: "Donated 5 times",
                        bg: "from-turquoise-100 to-ocean-100",
                      },
                      {
                        name: "Consistency",
                        src: "/Consistency.png",
                        description: "Donated 10 times",
                        bg: "from-ocean-100 to-turquoise-100",
                      },
                      {
                        name: "Changemaker",
                        src: "/Philanthropist.png",
                        description: "Donated 20 times",
                        bg: "bg-gray-100 opacity-60",
                      },
                    ].map((badge, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-xl text-center ${
                          badge.bg.startsWith("bg-")
                            ? badge.bg
                            : `bg-gradient-to-r ${badge.bg}`
                        }`}
                      >
                        <img
                          src={badge.src}
                          alt={badge.name}
                          className="w-12 h-12 mx-auto mb-2 object-contain"
                        />
                        <div className="font-semibold text-sm">
                          {badge.name}
                        </div>
                        <div className="text-xs text-gray-600">
                          {badge.description}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Cute Character Display Section with Larger Cards in Two Rows */}
      <section
        id="characters"
        className="py-16 bg-gradient-to-r from-ocean-50 to-turquoise-50"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Meet Your Adorable Helpers
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Collect cute characters as you donate! Each character represents a
              small step toward big change.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12">
            {[
              {
                name: "Fiona the Fish",
                src: "/FionaTheFish.png",
                bg: "bg-blue-100",
                description:
                  "A fish who named herself queen of the ocean, even scavenging up a crown from the bottoms of the coral reefs she swims through. She helps lead other fish to find food in the reefs. ",
              },
              {
                name: "Gerald the Squid",
                src: "/GeraldTheSquid.png",
                bg: "bg-purple-100",
                description:
                  "A nifty little squid who loves listening to jazz and vibing in his clean ocean home. He loves cleaning up the ocean when he has a chance.",
              },
              {
                name: "Oswald the Whale",
                src: "/OswaldTheWhale.png",
                bg: "bg-ocean-100",
                description:
                  "A sophisticated whale that drinks tea with Fiona the Fish whenever he has the chance. He loves making tea for all his fish friends and is never unwilling to help. ",
              },
              {
                name: "Shelly the Shark",
                src: "/ShellyShark.png",
                bg: "bg-gray-200",
                description:
                  "The sweetest shark of the seas, she loves collecting drifting flowers off the surface of the water and making flower crowns for all her sea buddies. ",
              },
              {
                name: "Terrence the Turtle",
                src: "/TerrenceTheTurtle.png",
                bg: "bg-green-100",
                description:
                  "Terrence is always willing to give his friends a ride, with Sheldon the Starfish always chilling on his back. ",
              },
              {
                name: "Travis the Croc",
                src: "/TravisTheCroc.png",
                bg: "bg-teal-100",
                description:
                  "Travis the Croc is considered the coolest animal, both above and below water. He is always there to stand up for his friends and fight against predators. ",
              },
            ].map((char, index) => (
              <div
                key={index}
                className="flex flex-col items-center p-8 rounded-3xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
              >
                <div
                  className={`w-28 h-28 flex items-center justify-center mb-6 rounded-full ${char.bg}`}
                >
                  <img
                    src={char.src}
                    alt={char.name}
                    className="w-20 h-20 object-contain"
                  />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 text-center">
                  {char.name}
                </h3>
                <p className="text-gray-700 text-center mt-2 text-sm md:text-base">
                  {char.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-ocean-500 to-turquoise-600">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Start Making a Difference Today
          </h2>
          <button className="bg-white text-gray-900 px-10 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 mx-auto">
            <Chrome className="w-5 h-5" />
            Add to Chrome - It's Free
            <Download className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-gray-400">
            &copy; 2025 RippleEffect. All rights reserved.
          </p>
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
              <div className="w-16 h-16 bg-gradient-to-r from-ocean-500 to-turquoise-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {isSignUp ? "Create Account" : "Welcome Back"}
              </h2>
              <p className="text-gray-600">
                {isSignUp
                  ? "Sign up for your RippleEffect account"
                  : "Sign in to your RippleEffect account"}
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
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent transition-colors"
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
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent transition-colors"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-ocean-500 to-turquoise-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
              >
                {isSignUp ? "Create Account" : "Sign In"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {isSignUp
                  ? "Already have an account? "
                  : "Don't have an account? "}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError("");
                    setEmail("");
                    setPassword("");
                  }}
                  className="text-ocean-600 hover:text-ocean-700 font-medium"
                >
                  {isSignUp ? "Sign in here" : "Sign up here"}
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
