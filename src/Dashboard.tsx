import React, { useState, useEffect } from "react";
import { doc, setDoc } from "firebase/firestore";
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

  // inside your component
  const handleAddCharity = async () => {
    if (!newCharity.trim()) return;

    try {
      const response = await fetch("/api/add-charity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ charity: newCharity }),
      });

      const data = await response.json();
      console.log("Validation result:", data);

      if (data.valid) {
        // save to Firebase here
        const userRef = doc(db, "users", auth.currentUser!.uid);
        await setDoc(
          userRef,
          {
            charitiesInterestedIn: [
              ...(charitiesInterestedIn || []),
              newCharity,
            ],
          },
          { merge: true }
        );
        alert(`${newCharity} added!`);
        setNewCharity("");
      } else {
        alert(`${newCharity} is not recognized as a valid charity.`);
      }
    } catch (error) {
      console.error("Error adding charity:", error);
      alert("Something went wrong while adding charity.");
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
                    className="bg-turquoise-500 text-white px-6 py-2 rounded-lg hover:bg-turquoise-600 transition-colors"
                  >
                    Add Charity
                  </button>

                  {/* Display list of charities */}
                  <ul className="mt-4 list-disc pl-5">
                    {charitiesInterestedIn.map((c, idx) => (
                      <li key={idx} className="text-gray-700">
                        {c}
                      </li>
                    ))}
                  </ul>
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
