import React, { useState, useEffect } from "react";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { 
  Heart,
  TrendingUp,
  Gift,
  Award,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Plus,
  DollarSign,
  Zap,
} from "lucide-react";
import { generateContent} from "../api/add-charity";

interface DashboardProps {
  onLogout: () => void;
}

function Dashboard({ onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [localCity, setLocalCity] = useState("");
  const [localState, setLocalState] = useState("");
  const [location, setLocation] = useState(""); // for country
  const [newCharity, setNewCharity] = useState("");
  const [charitiesInterestedIn, setCharitiesInterestedIn] = useState<string[]>(
    []
  );
  const [officialCharityNames, setOfficialCharityNames] = useState<{[key: string]: string}>({});
  const [nearbyCharities, setNearbyCharities] = useState<Array<{name: string, description: string, category: string}>>([]);
  const [isLoadingNearby, setIsLoadingNearby] = useState(false);

  const [response, setResponse] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // inside your component
 const handleAddCharity = async () => {
   if (!newCharity.trim()) return;

   setIsLoading(true);

   try {
     // Step 1: Get official charity name and validation
     const validationPrompt = `For the charity "${newCharity}", please provide:
     1. Is it a real registered nonprofit? (YES/NO)
     2. If YES, what is the official registered name?
     3. If NO, suggest 3 similar legitimate nonprofits
     
     Format: "STATUS: YES/NO | OFFICIAL_NAME: [official name or suggestions] | DESCRIPTION: [brief description]"`;

     const res = await generateContent(validationPrompt);
     console.log("AI response:", res);

     const aiAnswer = res?.trim();
     const statusMatch = aiAnswer?.match(/STATUS:\s*(YES|NO)/);
     const officialMatch = aiAnswer?.match(/OFFICIAL_NAME:\s*([^|]+)/);
     const descriptionMatch = aiAnswer?.match(/DESCRIPTION:\s*([^|]+)/);
     
     const status = statusMatch?.[1];
     const officialName = officialMatch?.[1]?.trim();
     const description = descriptionMatch?.[1]?.trim();
     
     if (status === "YES" && officialName) {
       // Charity is valid - use official name
       const charityToAdd = officialName;
       
       // Save to Firestore
       const userRef = doc(db, "users", auth.currentUser!.uid);
       const updatedCharities = [...(charitiesInterestedIn || []), charityToAdd];
       await setDoc(
         userRef,
         {
           charitiesInterestedIn: updatedCharities,
         },
         { merge: true }
       );

       // Update local state
       setCharitiesInterestedIn(updatedCharities);
       setOfficialCharityNames(prev => ({
         ...prev,
         [charityToAdd]: description || "Registered nonprofit organization"
       }));

       alert(`✅ ${charityToAdd} added successfully!\n\n${description || "Registered nonprofit organization"}`);
       setNewCharity("");
     } else if (status === "NO" && officialName) {
       // Charity not recognized - show suggestions
       const suggestions = officialName;
       const userConfirmed = confirm(
         `❌ "${newCharity}" was not recognized as a registered nonprofit.\n\n` +
         `Here are some similar legitimate charities you might have meant:\n\n${suggestions}\n\n` +
         `Would you like to add "${newCharity}" anyway? (Click OK to add, Cancel to try a different name)`
       );
       
       if (userConfirmed) {
         // Save anyway if user confirms
         const userRef = doc(db, "users", auth.currentUser!.uid);
         const updatedCharities = [...(charitiesInterestedIn || []), newCharity];
         await setDoc(
           userRef,
           {
             charitiesInterestedIn: updatedCharities,
           },
           { merge: true }
         );
         
         // Update local state
         setCharitiesInterestedIn(updatedCharities);
         setOfficialCharityNames(prev => ({
           ...prev,
           [newCharity]: "Unverified organization"
         }));

         alert(`✅ ${newCharity} added (unverified). You can always edit this later.`);
         setNewCharity("");
       }
     } else {
       // Unexpected response format
       alert(`⚠️ Unable to verify "${newCharity}". The AI response was unclear. Would you like to add it anyway?`);
     }

   } catch (error) {
     console.error("Error adding charity:", error);
     alert("Something went wrong while adding charity. Please try again.");
   } finally {
     setIsLoading(false);
   }
  };

  // Function to get nearby charities based on location
  const getNearbyCharities = async () => {
    if (!localCity || !localState || !location) {
      alert("Please set your location first in the Location section above.");
      return;
    }

    setIsLoadingNearby(true);

    try {
      const locationPrompt = `Find 5-8 legitimate nonprofit organizations near ${localCity}, ${localState}, ${location}. 

      IMPORTANT: Respond with ONLY a valid JSON array. No other text, explanations, or formatting.

      Required format:
      [
        {
          "name": "Official Charity Name",
          "description": "Brief description of what they do",
          "category": "Category Name"
        },
        {
          "name": "Another Charity Name", 
          "description": "What they do",
          "category": "Their Category"
        }
      ]

      Categories should be: Health, Education, Environment, Community, Social Services, Arts, Animal Welfare, or Religious.`;

      const res = await generateContent(locationPrompt);
      console.log("Nearby charities AI response:", res);

      try {
        // Clean the response to extract JSON
        let jsonString = res || "";
        
        // Try to find JSON array in the response
        const jsonMatch = jsonString.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          jsonString = jsonMatch[0];
        }
        
        // Clean up common AI response issues
        jsonString = jsonString
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .replace(/\n/g, ' ')
          .trim();

        const parsedCharities = JSON.parse(jsonString);
        if (Array.isArray(parsedCharities) && parsedCharities.length > 0) {
          // Validate and clean the data
          const validCharities = parsedCharities
            .filter(charity => charity && typeof charity === 'object')
            .map(charity => ({
              name: charity.name || charity.Name || "Unknown Charity",
              description: charity.description || charity.Description || "Local nonprofit organization",
              category: charity.category || charity.Category || "Community"
            }))
            .slice(0, 8); // Limit to 8 charities
          
          setNearbyCharities(validCharities);
        } else {
          throw new Error("No valid charities found in response");
        }
      } catch (parseError) {
        console.log("JSON parsing failed, trying text extraction:", parseError);
        
        // If JSON parsing fails, try to extract from text format
        const lines = res?.split('\n').filter(line => 
          line.trim() && 
          !line.includes('[') && 
          !line.includes(']') && 
          !line.includes('{') && 
          !line.includes('}') &&
          !line.includes('STATUS:') &&
          !line.includes('OFFICIAL_NAME:') &&
          !line.includes('DESCRIPTION:')
        ) || [];
        
        const charities = lines.slice(0, 8).map((line, index) => {
          // Try to extract name and description if separated by dash or colon
          const parts = line.split(/[-:]/);
          const name = parts[0]?.trim() || line.trim();
          const description = parts[1]?.trim() || "Local nonprofit organization";
          
          return {
            name: name,
            description: description,
            category: "Community"
          };
        });
        
        setNearbyCharities(charities);
      }

    } catch (error) {
      console.error("Error fetching nearby charities:", error);
      alert("Failed to fetch nearby charities. Please try again.");
    } finally {
      setIsLoadingNearby(false);
    }
  };

  // Function to add a nearby charity to user's list
  const addNearbyCharity = async (charity: {name: string, description: string, category: string}) => {
    try {
      const userRef = doc(db, "users", auth.currentUser!.uid);
      const updatedCharities = [...(charitiesInterestedIn || []), charity.name];
      await setDoc(
        userRef,
        {
          charitiesInterestedIn: updatedCharities,
        },
        { merge: true }
      );

      // Update local state
      setCharitiesInterestedIn(updatedCharities);
      setOfficialCharityNames(prev => ({
        ...prev,
        [charity.name]: charity.description
      }));

      alert(`✅ ${charity.name} added to your charities!`);
    } catch (error) {
      console.error("Error adding nearby charity:", error);
      alert("Failed to add charity. Please try again.");
    }
  };

  useEffect(() => {
    if (!auth.currentUser) return;
    const fetchUserData = async () => {
      const docRef = doc(db, "users", auth.currentUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setLocalCity(data.localCity || "");
        setLocalState(data.localState || "");
        setLocation(data.location || "");
        setCharitiesInterestedIn(data.charitiesInterestedIn || []);
      }
    };
    fetchUserData();
  }, []);

  // Mock user data - in real app, this would come from Firebase
  const userStats = {
    totalDonated: 127.5,
    thisMonth: 23.4,
    charitiesSupported: 15,
    peopleHelped: 892,
    currentStreak: 12,
    charactersUnlocked: 8,
    badgesEarned: 6,
    nextMilestone: 200,
  };

  const recentDonations = [
    {
      id: 1,
      amount: 0.77,
      charity: "Red Cross",
      date: "2024-01-15",
      item: "Amazon Purchase",
    },
    {
      id: 2,
      amount: 0.43,
      charity: "UNICEF",
      date: "2024-01-14",
      item: "Coffee Shop",
    },
    {
      id: 3,
      amount: 0.89,
      charity: "Doctors Without Borders",
      date: "2024-01-13",
      item: "Grocery Store",
    },
    {
      id: 4,
      amount: 0.56,
      charity: "World Wildlife Fund",
      date: "2024-01-12",
      item: "Online Shopping",
    },
    {
      id: 5,
      amount: 0.34,
      charity: "Feeding America",
      date: "2024-01-11",
      item: "Restaurant",
    },
  ];

  const characters = [
    { name: "Fiona the Fish", icon: "/FionaTheFish.png" },
    { name: "Gerald the Squid", icon: "/GeraldTheSquid.png" },
    { name: "Oswald the Whale", icon: "/OswaldTheWhale.png" },
    { name: "Shelly the Shark", icon: "/ShellyShark.png" },
    { name: "Terrence the Turtle", icon: "/TerrenceTheTurtle.png" },
    { name: "Travis the Croc", icon: "/TravisTheCroc.png" },
  ];
  const badges = [
    { name: "First Timer", icon: "/First-timer.png", earned: true },
    { name: "Philanthropic Five", icon: "/5-year.png", earned: true },
    { name: "Consistency", icon: "/Consistency.png", earned: true },
    { name: "Changemaker", icon: "/Philanthropist.png", earned: false },
    { name: "Charity Champion", icon: "/Charity Champion.png", earned: false },
    { name: "Impact Maker", icon: "/Impact-Maker.png", earned: true },
  ];

  const tabs = [
    { id: "overview", name: "Overview", icon: BarChart3 },
    { id: "donations", name: "Donations", icon: Heart },
    { id: "characters", name: "Characters", icon: Gift },
    { id: "badges", name: "Badges", icon: Award },
    { id: "settings", name: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-50 via-white to-turquoise-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-ocean-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/favicon.ico" alt="RippleEffect" className="w-8 h-8" />
            <span className="text-xl font-bold text-gray-900">
              RippleEffect Dashboard
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-ocean-600 font-medium">Welcome back!</span>
            <button
              onClick={onLogout}
              className="text-gray-600 hover:text-ocean-600 transition-colors flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-ocean-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Donated</p>
                <p className="text-3xl font-bold text-ocean-600">
                  ${userStats.totalDonated}
                </p>
              </div>
              <div className="w-12 h-12 bg-ocean-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-ocean-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-turquoise-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-3xl font-bold text-turquoise-600">
                  ${userStats.thisMonth}
                </p>
              </div>
              <div className="w-12 h-12 bg-turquoise-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-turquoise-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-ocean-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Streak</p>
                <p className="text-3xl font-bold text-ocean-600">
                  {userStats.currentStreak} days
                </p>
              </div>
              <div className="w-12 h-12 bg-ocean-100 rounded-full flex items-center justify-center">
                <Zap className="w-6 h-6 text-ocean-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-ocean-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">People Helped</p>
                <p className="text-3xl font-bold text-ocean-600">
                  {userStats.peopleHelped}
                </p>
              </div>
              <div className="w-12 h-12 bg-ocean-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-ocean-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-ocean-100 mb-8">
          <div className="flex flex-wrap border-b border-gray-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "text-ocean-600 border-b-2 border-ocean-600 bg-ocean-50"
                      : "text-gray-600 hover:text-ocean-600 hover:bg-ocean-50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.name}
                </button>
              );
            })}
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-r from-ocean-50 to-turquoise-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Recent Impact
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">
                          Charities Supported
                        </span>
                        <span className="font-semibold text-ocean-600">
                          {userStats.charitiesSupported}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">
                          Characters Unlocked
                        </span>
                        <span className="font-semibold text-ocean-600">
                          {userStats.charactersUnlocked}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Badges Earned</span>
                        <span className="font-semibold text-ocean-600">
                          {userStats.badgesEarned}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-ocean-50 to-turquoise-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Next Milestone
                    </h3>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-ocean-600 mb-2">
                        ${userStats.nextMilestone}
                      </div>
                      <p className="text-gray-600 mb-4">
                        Until next character unlock
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-ocean-500 to-turquoise-600 h-2 rounded-full"
                          style={{
                            width: `${
                              (userStats.totalDonated /
                                userStats.nextMilestone) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        $
                        {(
                          userStats.nextMilestone - userStats.totalDonated
                        ).toFixed(2)}{" "}
                        to go
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Recent Donations
                  </h3>
                  <div className="space-y-3">
                    {recentDonations.slice(0, 5).map((donation) => (
                      <div
                        key={donation.id}
                        className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-ocean-100 rounded-full flex items-center justify-center">
                            <Heart className="w-4 h-4 text-ocean-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {donation.charity}
                            </p>
                            <p className="text-sm text-gray-500">
                              {donation.item}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-ocean-600">
                            +${donation.amount}
                          </p>
                          <p className="text-sm text-gray-500">
                            {donation.date}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Donations Tab */}
            {activeTab === "donations" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-gray-900">
                    All Donations
                  </h3>
                  <button className="bg-ocean-500 text-white px-4 py-2 rounded-lg hover:bg-ocean-600 transition-colors flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Donation
                  </button>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Charity
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Source
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {recentDonations.map((donation) => (
                          <tr key={donation.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-ocean-100 rounded-full flex items-center justify-center mr-3">
                                  <Heart className="w-4 h-4 text-ocean-600" />
                                </div>
                                <span className="font-medium text-gray-900">
                                  {donation.charity}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-ocean-600 font-semibold">
                              +${donation.amount}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                              {donation.date}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                              {donation.item}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Characters Tab */}
            {activeTab === "characters" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Character Collection
                  </h3>
                  <div className="text-sm text-gray-500">
                    {userStats.charactersUnlocked}/{characters.length} unlocked
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {characters.map((character, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-xl text-center transition-all ${
                        index < userStats.charactersUnlocked
                          ? "bg-gradient-to-r from-ocean-100 to-turquoise-100 border-2 border-ocean-200"
                          : "bg-gray-100 border-2 border-gray-200 opacity-50"
                      }`}
                    >
                      <img
                        src={character.icon}
                        alt={character.name}
                        className="w-20 h-20 mx-auto mb-2"
                      />
                      <div className="text-xs text-gray-600 font-medium mb-1">
                        {character.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {index < userStats.charactersUnlocked
                          ? "Unlocked"
                          : "Locked"}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-gradient-to-r from-ocean-100 to-turquoise-100 p-6 rounded-xl border-2 border-dashed border-ocean-300">
                  <div className="text-center">
                    <Gift className="w-12 h-12 mx-auto text-ocean-600 mb-3" />
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Next Character Unlock
                    </h4>
                    <p className="text-gray-600 mb-3">
                      Reach ${userStats.nextMilestone} in total donations
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div
                        className="bg-gradient-to-r from-ocean-500 to-turquoise-600 h-2 rounded-full"
                        style={{
                          width: `${
                            (userStats.totalDonated / userStats.nextMilestone) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-500">
                      $
                      {(
                        userStats.nextMilestone - userStats.totalDonated
                      ).toFixed(2)}{" "}
                      to go
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Badges Tab */}
            {activeTab === "badges" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Achievement Badges
                  </h3>
                  <div className="text-sm text-gray-500">
                    {userStats.badgesEarned}/{badges.length} earned
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {badges.map((badge, index) => (
                    <div
                      key={index}
                      className={`p-6 rounded-xl text-center transition-all ${
                        badge.earned
                          ? "bg-gradient-to-r from-ocean-100 to-turquoise-100 border-2 border-ocean-200"
                          : "bg-gray-100 border-2 border-gray-200 opacity-60"
                      }`}
                    >
                      <img
                        src={badge.icon}
                        alt={badge.name}
                        className="w-20 h-20 mx-auto mb-3"
                      />
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {badge.name}
                      </h4>
                      <div
                        className={`text-xs px-2 py-1 rounded-full ${
                          badge.earned
                            ? "bg-ocean-200 text-ocean-800"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {badge.earned ? "Earned" : "Locked"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Account Settings
                </h3>

                {/* Location Section */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">
                    Location
                  </h4>

                  {/* City */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      value={localCity}
                      onChange={(e) => setLocalCity(e.target.value)}
                      placeholder="Enter your city"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
                    />
                  </div>

                  {/* State */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      value={localState}
                      onChange={(e) => setLocalState(e.target.value)}
                      placeholder="Enter your state"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
                    />
                  </div>

                  {/* Country */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Enter your country"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
                    />
                  </div>

                  {/* Save Button */}
                  <button
                    onClick={async () => {
                      if (!auth.currentUser) return;
                      try {
                        await setDoc(
                          doc(db, "users", auth.currentUser.uid),
                          { localCity, localState, location },
                          { merge: true }
                        );
                        alert("Location updated!");
                      } catch (error) {
                        console.error("Error updating location:", error);
                      }
                    }}
                    className="bg-ocean-500 text-white px-6 py-2 rounded-lg hover:bg-ocean-600 transition-colors"
                  >
                    Save Location
                  </button>
                </div>

                {/* Charities Section */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">
                    Charities Interested In
                  </h4>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Add Charity
                    </label>
                    <input
                      type="text"
                      value={newCharity}
                      onChange={(e) => setNewCharity(e.target.value)}
                      placeholder="Type charity name"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
                    />
                  </div>

                   <button
                     onClick={handleAddCharity}
                     disabled={isLoading}
                     className={`px-6 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                       isLoading 
                         ? 'bg-gray-400 cursor-not-allowed' 
                         : 'bg-turquoise-500 hover:bg-turquoise-600'
                     } text-white`}
                   >
                     {isLoading ? (
                       <>
                         <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                         Verifying...
                       </>
                     ) : (
                       'Add Charity'
                     )}
                   </button>

                  {/* Display list of charities */}
                  <div className="mt-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-3">
                      Your Charities ({charitiesInterestedIn.length})
                    </h5>
                    {charitiesInterestedIn.length === 0 ? (
                      <p className="text-gray-500 text-sm italic">No charities added yet</p>
                    ) : (
                      <div className="space-y-2">
                        {charitiesInterestedIn.map((charity, idx) => (
                          <div key={idx} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h6 className="font-medium text-gray-900 text-sm">
                                  {charity}
                                </h6>
                                {officialCharityNames[charity] && (
                                  <p className="text-xs text-gray-600 mt-1">
                                    {officialCharityNames[charity]}
                                  </p>
                                )}
                              </div>
                              <button
                                onClick={async () => {
                                  if (confirm(`Remove "${charity}" from your charities?`)) {
                                    const updatedCharities = charitiesInterestedIn.filter((_, i) => i !== idx);
                                    setCharitiesInterestedIn(updatedCharities);
                                    
                                    // Update Firebase
                                    if (auth.currentUser) {
                                      const userRef = doc(db, "users", auth.currentUser.uid);
                                      await setDoc(
                                        userRef,
                                        { charitiesInterestedIn: updatedCharities },
                                        { merge: true }
                                      );
                                    }
                                  }
                                }}
                                className="text-red-500 hover:text-red-700 text-xs ml-2"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Nearby Charities Section */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-gray-800">
                      Nearby Charities
                    </h4>
                    <button
                      onClick={getNearbyCharities}
                      disabled={isLoadingNearby || !localCity || !localState || !location}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                        isLoadingNearby || !localCity || !localState || !location
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }`}
                    >
                      {isLoadingNearby ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Finding...
                        </>
                      ) : (
                        'Find Nearby Charities'
                      )}
                    </button>
                  </div>

                  {!localCity || !localState || !location ? (
                    <p className="text-gray-500 text-sm">
                      Please set your location above to find nearby charities.
                    </p>
                  ) : nearbyCharities.length === 0 ? (
                    <p className="text-gray-500 text-sm">
                      Click "Find Nearby Charities" to discover local nonprofits in {localCity}, {localState}.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">
                        Found {nearbyCharities.length} charities near {localCity}, {localState}:
                      </p>
                      <div className="grid gap-3">
                        {nearbyCharities.map((charity, idx) => (
                          <div key={idx} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h6 className="font-medium text-gray-900 text-sm">
                                    {charity.name}
                                  </h6>
                                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                    {charity.category}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-600 mb-2">
                                  {charity.description}
                                </p>
                              </div>
                              <button
                                onClick={() => addNearbyCharity(charity)}
                                className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1 rounded-lg transition-colors ml-3"
                              >
                                Add
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
