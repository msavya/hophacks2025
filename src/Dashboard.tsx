import { useState, useEffect } from "react";
import {
  doc,
  query,
  getDocs,
  where,
  setDoc,
  getDoc,
  collection,
  addDoc,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { loadStripe } from "@stripe/stripe-js";

import {
  Heart,
  TrendingUp,
  Gift,
  Award,
  Users,
  BarChart3,
  Settings,
  LogOut,
  DollarSign,
  Zap,
} from "lucide-react";
import { generateContent } from "../api/add-charity";

interface DashboardProps {
  onLogout: () => void;
}

interface CharityMap {
  [key: string]: [string, number]; // [stripeAccountId, totalDonated]
}
function Dashboard({ onLogout }: DashboardProps) {
  // Fix 1: Use PUBLISHABLE key, not SECRET key
const stripePromise = loadStripe(
  "pk_test_51S79UsKeGWfcX29OObAfF2cZifhhquOvx0gU8HZL97CmFn8i1ver6ddZL8kSO3oKBkKyEx9TFbc8JrohECeQuOT100YEQu5e4Y",
  {
    locale: 'en', // Explicitly set locale to avoid module loading issues
  }
);
  const [activeTab, setActiveTab] = useState("overview");
  const [localCity, setLocalCity] = useState("");
  const [localState, setLocalState] = useState("");
  const [location, setLocation] = useState(""); // for country
  const [newCharity, setNewCharity] = useState("");
  const [charitiesInterestedIn, setCharitiesInterestedIn] = useState<string[]>(
    []
  );
  const [userBadges, setUserBadges] = useState<
    Array<{ badgeId: string; earnedAt: string }>
  >([]);

  const badgeDefinitions = [
    {
      id: "A2GiiPzXm35S9fnMFmjx",
      name: "First Timer",
      icon: "/icons/first_timer.png",
      threshold: 1,
    },
    {
      id: "OPBoi2UXcMFHrU95o6v9",
      name: "Philanthropic Five",
      icon: "/icons/philanthropic_five.png",
      threshold: 5,
    },
    {
      id: "5bHfWydQvG2YwG4g4s3i",
      name: "Consistency",
      icon: "/icons/consistency.png",
      threshold: 10,
    },
    {
      id: "gt1Wq5iOKoLRmliEBqTE",
      name: "Changemaker",
      icon: "/icons/changemaker.png",
      threshold: 20,
    },
    {
      id: "AP8TLz7cPzPiAuIpsOHu",
      name: "Charity Champion",
      icon: "/icons/charity_champion.png",
      threshold: 50,
    },
    {
      id: "1z8VOUn1ceCC7obrw74Q",
      name: "Impact Maker",
      icon: "/icons/impact_maker.png",
      threshold: 100,
    },
  ];

  const [charactersTotal, setCharactersTotal] = useState<any[]>([]);
  const [userUnlockedCharacters, setUserUnlockedCharacters] = useState<any[]>(
    []
  );

  const [userDonations, setUserDonations] = useState<
    Array<{
      id: string;
      amount: number;
      charity: string;
      date: string;
      item: string;
    }>
  >([]);

  const [officialCharityNames, setOfficialCharityNames] = useState<{
    [key: string]: string;
  }>({});
  const [nearbyCharities, setNearbyCharities] = useState<
    Array<{ name: string; description: string; category: string }>
  >([]);
  const [isLoadingNearby, setIsLoadingNearby] = useState(false);
  const [charitiesDonatedTo, setCharitiesDonatedTo] = useState<CharityMap>({});

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!auth.currentUser) return;
      const userRef = doc(db, "users", auth.currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        setCharitiesDonatedTo(data.charitiesDonatedTo || {});
      }
    };

    fetchUserData();
  }, []);


  // Fix 2: Complete handleDonate function with proper error handling
  const handleDonate = async (charityName: string, charityStripeAccountId: string) => {

    const amount = (charitiesDonatedTo[charityName] && charitiesDonatedTo[charityName][1]) || 0;
    if (!amount || amount <= 0) {
      return alert("Invalid donation amount");
    }

    try {
      // 1️⃣ Call your backend to create a Checkout Session
      const response = await fetch("http://localhost:4242/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // convert dollars to cents
          nonprofitStripeAccountId: charityStripeAccountId,
        }),
      });

      const data = await response.json();
      if (data.error) {
        alert("Failed to create session");
        return;
      }

      // 2️⃣ Load Stripe.js (with your publishable key)
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error("Stripe failed to initialize");
      }

      // 3️⃣ Redirect user securely
      const result = await stripe.redirectToCheckout({ sessionId: data.id });
      if (result.error) {
        console.error(result.error.message);
        alert("Stripe checkout failed. Try again.");
      }
    } catch (err) {
      console.error("Donation error:", err);
      alert("Something went wrong. Please try again.");
    }
  };





  const handleAddCharity = async () => {
    if (!newCharity.trim()) return;
    setIsLoading(true);

    try {
      const charityName = newCharity.trim();

      // --- AI validation ---
      const validationPrompt = `For the charity "${charityName}", please provide:
1. Is it a real registered nonprofit? (YES/NO)
2. If YES, what is the official registered name?
3. If NO, suggest 3 similar legitimate nonprofits
4. Provide the location of the nonprofit (City, State, Country)

Format: "STATUS: YES/NO | OFFICIAL_NAME: [official name or suggestions] | DESCRIPTION: [brief description] | LOCATION: City, State, Country"`;

      const res = await generateContent(validationPrompt);
      const aiAnswer = res?.trim();

      const statusMatch = aiAnswer?.match(/STATUS:\s*(YES|NO)/);
      const officialMatch = aiAnswer?.match(/OFFICIAL_NAME:\s*([^|]+)/);
      const descriptionMatch = aiAnswer?.match(/DESCRIPTION:\s*([^|]+)/);
      const locationMatch = aiAnswer?.match(/LOCATION:\s*([^|]+)/);

      const status = statusMatch?.[1];
      const officialName = officialMatch?.[1]?.trim();
      const description = descriptionMatch?.[1]?.trim();
      const locationString = locationMatch?.[1]?.trim();

      const charityToAdd =
        status === "YES" && officialName ? officialName : charityName;

      // --- Parse location ---
      let charityLocation = { city: "", state: "", country: "" };
      if (locationString) {
        const [city, state, country] = locationString
          .split(",")
          .map((s) => s.trim());
        charityLocation = { city, state, country };
      }

      // --- Duplicate check for user's list ---
      const normalizedNewCharity = charityToAdd
        .toLowerCase()
        .replace(/\s+/g, "");
      const isDuplicateInUI = charitiesInterestedIn.some((c) => {
        return c.toLowerCase().replace(/\s+/g, "") === normalizedNewCharity;
      });

      if (isDuplicateInUI) {
        alert(`"${charityToAdd}" is already in your list!`);
        setIsLoading(false);
        return;
      }

      // --- Add to global collection if not exists ---
      const charitiesCollection = collection(db, "charities");
      const q = query(charitiesCollection, where("name", "==", charityToAdd));
      const existing = await getDocs(q);

      let charityId: string;

      if (!existing.empty) {
        // Already exists: get the existing ID
        charityId = existing.docs[0].id;
      } else {
        // Does not exist: create new
        const newCharityRef = doc(charitiesCollection);
        charityId = newCharityRef.id;

        const isLocal =
          charityLocation.state?.toLowerCase() === localState?.toLowerCase();

        await setDoc(newCharityRef, {
          id: charityId,
          name: charityToAdd,
          description: description || "Registered nonprofit organization",
          category: "Community",
          location: {
            city: charityLocation.city || "Unknown",
            state: charityLocation.state || localState || "Unknown",
            country: charityLocation.country || location || "Unknown",
            isLocal,
          },
        });
      }

      // --- Add to user's list ---
      const updatedCharities = [...charitiesInterestedIn, charityToAdd];
      setCharitiesInterestedIn(updatedCharities);
      setOfficialCharityNames((prev) => ({
        ...prev,
        [charityToAdd]: description || "Registered nonprofit organization",
      }));

      // Save to Firebase
      const userRef = doc(db, "users", auth.currentUser!.uid);
      await setDoc(
        userRef,
        { charitiesInterestedIn: updatedCharities },
        { merge: true }
      );

      if (status === "YES" && officialName) {
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
          // Update local state for unverified charity
          const unverifiedCharities = [...charitiesInterestedIn, newCharity];
          setCharitiesInterestedIn(unverifiedCharities);
          setOfficialCharityNames(prev => ({
            ...prev,
            [newCharity]: "Unverified organization"
          }));

          // Save to Firebase
          await setDoc(
            userRef,
            {
              charitiesInterestedIn: unverifiedCharities,
            },
            { merge: true }
          );

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
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "")
          .replace(/\n/g, " ")
          .trim();

        const parsedCharities = JSON.parse(jsonString);
        if (Array.isArray(parsedCharities) && parsedCharities.length > 0) {
          // Validate and clean the data
          const validCharities = parsedCharities
            .filter((charity) => charity && typeof charity === "object")
            .map((charity) => ({
              name: charity.name || charity.Name || "Unknown Charity",
              description:
                charity.description ||
                charity.Description ||
                "Local nonprofit organization",
              category: charity.category || charity.Category || "Community",
            }))
            .slice(0, 8); // Limit to 8 charities

          setNearbyCharities(validCharities);
        } else {
          throw new Error("No valid charities found in response");
        }
      } catch (parseError) {
        console.log("JSON parsing failed, trying text extraction:", parseError);

        // If JSON parsing fails, try to extract from text format
        const lines =
          res
            ?.split("\n")
            .filter(
              (line) =>
                line.trim() &&
                !line.includes("[") &&
                !line.includes("]") &&
                !line.includes("{") &&
                !line.includes("}") &&
                !line.includes("STATUS:") &&
                !line.includes("OFFICIAL_NAME:") &&
                !line.includes("DESCRIPTION:")
            ) || [];

        const charities = lines.slice(0, 8).map((line) => {
          // Try to extract name and description if separated by dash or colon
          const parts = line.split(/[-:]/);
          const name = parts[0]?.trim() || line.trim();
          const description =
            parts[1]?.trim() || "Local nonprofit organization";

          return {
            name: name,
            description: description,
            category: "Community",
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

  const addNearbyCharity = async (charity: {
    name: string;
    description: string;
    category: string;
  }) => {
    try {
      if (!auth.currentUser) return;

      const charityName = charity.name.trim();
      const normalizedNewCharity = charityName
        .toLowerCase()
        .replace(/\s+/g, "");

      // --- Prevent duplicate in user's list ---
      const isDuplicateInUI = charitiesInterestedIn.some((c) => {
        return c.toLowerCase().replace(/\s+/g, "") === normalizedNewCharity;
      });

      if (isDuplicateInUI) {
        alert(`"${charityName}" is already in your list!`);
        return;
      }

      // --- Add to global collection if not exists ---
      const charitiesCollection = collection(db, "charities");
      const q = query(charitiesCollection, where("name", "==", charityName));
      const existing = await getDocs(q);

      let charityId: string;

      if (!existing.empty) {
        // Already exists: get the existing ID
        charityId = existing.docs[0].id;
      } else {
        // Does not exist: create new
        const newCharityRef = doc(charitiesCollection);
        charityId = newCharityRef.id;

        const isLocal = localState === localState; // optional - using localState for now

        await setDoc(newCharityRef, {
          id: charityId,
          name: charityName,
          description:
            charity.description || "Registered nonprofit organization",
          category: charity.category || "Community",
          location: {
            city: localCity || "Unknown",
            state: localState || "Unknown",
            country: location || "Unknown",
            isLocal,
          },
        });
      }

      // --- Add to user's list ---
      const updatedCharities = [...charitiesInterestedIn, charityName];
      setCharitiesInterestedIn(updatedCharities);
      setOfficialCharityNames((prev) => ({
        ...prev,
        [charityName]:
          charity.description || "Registered nonprofit organization",
      }));

      const userRef = doc(db, "users", auth.currentUser.uid);
      await setDoc(
        userRef,
        { charitiesInterestedIn: updatedCharities },
        { merge: true }
      );

      alert(`✅ "${charityName}" added to your charities!`);
    } catch (error) {
      console.error("Error adding nearby charity:", error);
      alert("Failed to add charity. Please try again.");
    }
  };

  useEffect(() => {
    if (!auth.currentUser) return;

    const fetchUserDataAndDonations = async () => {
      try {
        const userId = auth.currentUser.uid;

        // --- 1. Fetch user profile ---
        const userDocSnap = await getDoc(doc(db, "users", userId));
        if (userDocSnap.exists()) {
          const data = userDocSnap.data();
          setLocalCity(data.localCity || "");
          setLocalState(data.localState || "");
          setLocation(data.location || "");
          setCharitiesInterestedIn(data.charitiesInterestedIn || []);
        }

        // --- 2. Fetch donations ---
        const donationsSnap = await getDocs(
          query(collection(db, "donations"), where("userId", "==", userId))
        );
        const donationsData = donationsSnap.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            amount: data.amount || 0,
            charity: data.charity || "",
            date: data.date || "",
            item: data.item || data.source || "",
          };
        });
        setUserDonations(donationsData);

        const totalDonations = donationsData.length;
        const totalAmountDonated = donationsData.reduce(
          (sum, d) => sum + d.amount,
          0
        );

        // --- 3. Fetch unlocked characters ---
        const userCharSnap = await getDocs(
          query(
            collection(db, "user_characters"),
            where("userId", "==", userId)
          )
        );
        const unlockedChars = userCharSnap.docs.map((doc) => doc.data());
        setUserUnlockedCharacters(unlockedChars);

        // --- 4. Fetch all characters ---
        const allCharSnap = await getDocs(collection(db, "characters"));
        const allChars = allCharSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCharactersTotal(allChars);

        // --- 5. Unlock characters based on total amount donated ---
        const totalUnlocks = Math.floor(totalAmountDonated / 20);
        const alreadyUnlocked = unlockedChars.length;
        const newUnlocksNeeded = totalUnlocks - alreadyUnlocked;

        if (newUnlocksNeeded > 0 && allChars.length > 0) {
          const availableChars = allChars.filter(
            (c) => !unlockedChars.some((uc) => uc.characterId === c.id)
          );
          const charsToUnlock = availableChars.slice(0, newUnlocksNeeded);

          if (charsToUnlock.length > 0) {
            const newUnlockDocs = charsToUnlock.map((char) => ({
              userId,
              characterId: char.id,
              unlockedAt: new Date().toISOString(),
            }));

            // Update UI immediately
            setUserUnlockedCharacters((prev) => [...prev, ...newUnlockDocs]);

            // Save to Firestore
            await Promise.all(
              newUnlockDocs.map((doc) =>
                addDoc(collection(db, "user_characters"), doc)
              )
            );

            console.log("Unlocked characters saved successfully!");
          }
        }

        // --- 6. Handle badges ---
        const badgeMilestones = [
          { id: "first_timer", threshold: 1 },
          { id: "philanthropic_five", threshold: 5 },
          { id: "consistency", threshold: 10 },
          { id: "changemaker", threshold: 20 },
          { id: "charity_champion", threshold: 50 },
          { id: "impact_maker", threshold: 100 },
        ];

        // Fetch user's existing badges
        const userBadgeSnap = await getDocs(
          query(collection(db, "user_badges"), where("userId", "==", userId))
        );
        const existingUserBadges = userBadgeSnap.docs.map((doc) => {
          const data = doc.data();
          return {
            badgeId: data.badgeId || "",
            earnedAt: data.earnedAt || "",
          };
        });

        // Check which badges should now be awarded
        const newBadges = badgeMilestones
          .filter(
            (badge) =>
              totalDonations >= badge.threshold &&
              !existingUserBadges.some((b) => b.badgeId === badge.id)
          )
          .map((badge) => ({
            userId,
            badgeId: badge.id,
            earnedAt: new Date().toISOString(),
          }));

        // Update UI and save new badges
        if (newBadges.length > 0) {
          const updatedBadges = [...existingUserBadges, ...newBadges];
          setUserBadges(updatedBadges);

          await Promise.all(
            newBadges.map((b) => addDoc(collection(db, "user_badges"), b))
          );

          console.log("New badges awarded:", newBadges);
        } else {
          // If no new badges, ensure UI reflects existing ones
          setUserBadges(existingUserBadges);
        }
      } catch (error) {
        console.error("Error fetching user data/donations/unlocks:", error);
      }
    };

    fetchUserDataAndDonations();
  }, []);

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
          {/* Total Donated */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-ocean-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Donated</p>
                <p className="text-3xl font-bold text-ocean-600">
                  ${userDonations.reduce((sum, d) => sum + d.amount, 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-ocean-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-ocean-600" />
              </div>
            </div>
          </div>

          {/* Total Number of Donations */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-turquoise-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Donations Made</p>
                <p className="text-3xl font-bold text-turquoise-600">
                  {userDonations.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-turquoise-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-turquoise-600" />
              </div>
            </div>
          </div>

          {/* Number of Unique Charities Donated To */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-ocean-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Charities Donated To</p>
                <p className="text-3xl font-bold text-ocean-600">
                  {new Set(userDonations.map((d) => d.charity)).size}
                </p>
              </div>
              <div className="w-12 h-12 bg-ocean-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-ocean-600" />
              </div>
            </div>
          </div>

          {/* Total Number of Donation Sources */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-ocean-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Donation Sources</p>
                <p className="text-3xl font-bold text-ocean-600">
                  {new Set(userDonations.map((d) => d.item)).size}
                </p>
              </div>
              <div className="w-12 h-12 bg-ocean-100 rounded-full flex items-center justify-center">
                <Zap className="w-6 h-6 text-ocean-600" />
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
                {/* Stats */}
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
                          {new Set(userDonations.map((d) => d.charity)).size}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">
                          Total Donations Made
                        </span>
                        <span className="font-semibold text-ocean-600">
                          {userDonations.length}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Next Milestone */}
                  {/* Next Milestone */}
                  <div className="bg-gradient-to-r from-ocean-50 to-turquoise-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Next Milestone
                    </h3>
                    <div className="text-center">
                      {/* Calculate total donated modulo 20 for progress */}
                      {(() => {
                        const totalDonated = userDonations.reduce(
                          (sum, d) => sum + d.amount,
                          0
                        );
                        const progress = (totalDonated % 20) / 20;
                        const remaining = 20 - (totalDonated % 20);

                        return (
                          <>
                            <div className="text-3xl font-bold text-ocean-600 mb-2">
                              ${remaining.toFixed(2)}
                            </div>
                            <p className="text-gray-600 mb-4">
                              Until next character unlock
                            </p>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-ocean-500 to-turquoise-600 h-2 rounded-full"
                                style={{ width: `${progress * 100}%` }}
                              ></div>
                            </div>
                          </>
                        );
                      })()}

                      <p className="text-sm text-gray-500 mt-2">
                        Keep donating to unlock your next character!
                      </p>
                    </div>
                  </div>
                </div>

                <div className="max-w-3xl mx-auto p-6 grid gap-6">
                  <h1 className="text-3xl font-bold text-center mb-6">🌱 Your Impact</h1>

                  {Object.entries(charitiesDonatedTo).length === 0 ? (
                    <div className="text-center text-gray-600 text-lg">
                      You haven't donated yet. Make your first donation to see your impact here!
                    </div>
                  ) : (
                    Object.entries(charitiesDonatedTo).map(([charityName, [stripeAccountId, total]]) => (
                      <div
                        key={charityName}
                        className="bg-white border border-gray-200 rounded-xl p-6 shadow hover:shadow-md transition"
                      >
                        <div className="flex justify-between items-center">
                          {/* Left Side: Icon + Charity Info */}
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-ocean-100 rounded-full flex items-center justify-center">
                              <Heart className="w-5 h-5 text-ocean-600" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {charityName}
                              </h3>
                              <p className="text-sm text-gray-500">
                                Total Amount Saved Up:{" "}
                                <span className="text-ocean-600 font-medium">
                                  ${total.toFixed(2)}
                                </span>
                              </p>
                            </div>
                          </div>

                          {/* Right Side: Donate Button */}
                          <button
                            onClick={() => handleDonate(charityName, stripeAccountId)}
                            className="px-4 py-2 bg-ocean-600 text-white text-sm font-medium rounded-lg hover:bg-ocean-700 transition"
                          >
                            Donate Now
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Recent Donations */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Recent Donations
                  </h3>
                  <div className="space-y-3">
                    {userDonations
                      .slice(-5)
                      .reverse()
                      .map((donation) => (
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
                            Source
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-gray-200">
                        {userDonations && userDonations.length > 0 ? (
                          userDonations.map((donation) => (
                            <tr key={donation.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                {donation.charity}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-ocean-600 font-semibold">
                                +${donation.amount}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                {donation.item}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={3}
                              className="px-6 py-4 text-center text-gray-400"
                            >
                              No donations yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Characters Tab */}
            {activeTab === "characters" && (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Character Collection
                  </h3>
                  <div className="text-sm text-gray-500">
                    {userUnlockedCharacters.length}/{charactersTotal.length}{" "}
                    unlocked
                  </div>
                </div>

                {/* Grid of characters */}
                {charactersTotal.length === 0 ? (
                  <p className="text-gray-500 text-center">
                    Loading characters...
                  </p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {charactersTotal.map((character, index) => {
                      const isUnlocked = userUnlockedCharacters.some(
                        (uc) => uc.characterId === character.id
                      );

                      // Determine next character to unlock
                      const unlockedCount = userUnlockedCharacters.length;
                      const nextCharacter =
                        unlockedCount < charactersTotal.length
                          ? charactersTotal[unlockedCount]
                          : null;

                      // Determine status text
                      let statusText = "Locked";
                      let statusColor = "text-ocean-600";

                      if (isUnlocked) {
                        statusText = "Unlocked";
                        statusColor = "text-green-600";
                      } else if (nextCharacter?.id === character.id) {
                        statusText = "Next to Unlock";
                        statusColor = "text-yellow-600";
                      }

                      return (
                        <div
                          key={character.id}
                          className={`p-4 rounded-xl text-center transition-all ${
                            isUnlocked
                              ? "bg-gradient-to-r from-ocean-100 to-turquoise-100 border-2 border-ocean-200"
                              : "bg-gray-100 border-2 border-gray-200 opacity-70"
                          }`}
                        >
                          {/* Character image */}
                          <img
                            src={`/characters/${encodeURIComponent(
                              character.name
                            )}.png`}
                            alt={character.name}
                            className="w-32 h-32 mx-auto mb-2 object-contain"
                            onError={(e) => {
                              // Fallback if image is missing
                              (e.target as HTMLImageElement).src =
                                "/characters/placeholder.png";
                            }}
                          />

                          {/* Character name */}
                          <div className="font-medium text-gray-800">
                            {character.name}
                          </div>

                          {/* Status */}
                          <div
                            className={`mt-2 text-xs font-semibold ${statusColor}`}
                          >
                            {statusText}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Next Character Unlock Progress */}
                <div className="bg-gradient-to-r from-ocean-50 to-turquoise-50 p-6 rounded-xl border-2 border-dashed border-ocean-300">
                  <div className="text-center">
                    <Gift className="w-12 h-12 mx-auto text-ocean-600 mb-3" />
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Next Character Unlock
                    </h4>
                    <p className="text-gray-600 mb-3">
                      $20 per character unlock
                    </p>

                    {/* Progress bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div
                        className="bg-gradient-to-r from-ocean-500 to-turquoise-600 h-2 rounded-full"
                        style={{
                          width: `${
                            ((userDonations.reduce(
                              (sum, d) => sum + d.amount,
                              0
                            ) %
                              20) /
                              20) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>

                    <p className="text-sm text-gray-500 mt-2">
                      $
                      {(
                        20 -
                        (userDonations.reduce((sum, d) => sum + d.amount, 0) %
                          20)
                      ).toFixed(2)}{" "}
                      to go for next character!
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
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {badgeDefinitions.map((badge) => {
                    // Check if the badge is earned
                    const earned = userBadges.some(
                      (b) => b.badgeId === badge.id
                    );

                    return (
                      <div
                        key={badge.id}
                        className={`p-6 rounded-xl text-center transition-all ${
                          earned
                            ? "bg-gradient-to-r from-ocean-100 to-turquoise-100 border-2 border-ocean-200"
                            : "bg-gray-100 border-2 border-gray-200 opacity-60"
                        }`}
                      >
                        {/* Badge Icon */}
                        <img
                          src={badge.icon}
                          alt={badge.name}
                          className="w-20 h-20 mx-auto mb-3"
                        />

                        {/* Badge Name */}
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {badge.name}
                        </h4>

                        {/* Badge Status */}
                        <div
                          className={`text-xs px-2 py-1 rounded-full ${
                            earned
                              ? "bg-ocean-200 text-ocean-800"
                              : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {earned ? "Earned" : "Locked"}
                        </div>
                      </div>
                    );
                  })}
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
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-turquoise-500 hover:bg-turquoise-600"
                    } text-white`}
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Verifying...
                      </>
                    ) : (
                      "Add Charity"
                    )}
                  </button>

                  {/* Display list of charities */}
                  <div className="mt-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-3">
                      Your Charities ({charitiesInterestedIn.length})
                    </h5>
                    {charitiesInterestedIn.length === 0 ? (
                      <p className="text-gray-500 text-sm italic">
                        No charities added yet
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {charitiesInterestedIn.map((charity, idx) => (
                          <div
                            key={idx}
                            className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                          >
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
                                  if (
                                    confirm(
                                      `Remove "${charity}" from your charities?`
                                    )
                                  ) {
                                    const updatedCharities =
                                      charitiesInterestedIn.filter(
                                        (_, i) => i !== idx
                                      );
                                    setCharitiesInterestedIn(updatedCharities);

                                    // Update Firebase
                                    if (auth.currentUser) {
                                      const userRef = doc(
                                        db,
                                        "users",
                                        auth.currentUser.uid
                                      );
                                      await setDoc(
                                        userRef,
                                        {
                                          charitiesInterestedIn:
                                            updatedCharities,
                                        },
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
                      disabled={
                        isLoadingNearby ||
                        !localCity ||
                        !localState ||
                        !location
                      }
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                        isLoadingNearby ||
                        !localCity ||
                        !localState ||
                        !location
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-blue-500 hover:bg-blue-600 text-white"
                      }`}
                    >
                      {isLoadingNearby ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Finding...
                        </>
                      ) : (
                        "Find Nearby Charities"
                      )}
                    </button>
                  </div>

                  {!localCity || !localState || !location ? (
                    <p className="text-gray-500 text-sm">
                      Please set your location above to find nearby charities.
                    </p>
                  ) : nearbyCharities.length === 0 ? (
                    <p className="text-gray-500 text-sm">
                      Click "Find Nearby Charities" to discover local nonprofits
                      in {localCity}, {localState}.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">
                        Found {nearbyCharities.length} charities near{" "}
                        {localCity}, {localState}:
                      </p>
                      <div className="grid gap-3">
                        {nearbyCharities.map((charity, idx) => (
                          <div
                            key={idx}
                            className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                          >
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