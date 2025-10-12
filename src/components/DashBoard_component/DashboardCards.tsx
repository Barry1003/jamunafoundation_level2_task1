import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

const DashboardCards = () => {
  const [user, setUser] = useState<{
    fullName?: string;
    email?: string;
    username?: string;
    firstName?: string;
  } | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("No token found");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("http://localhost:5000/api/auth/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();

        if (response.ok && result.user) {
          // Derive first name for greeting
          const fullName = result.user.fullName || "User";
          const firstName = fullName.split(" ")[0];
          const username =
            result.user.username ||
            (firstName ? firstName.toLowerCase() + "123" : "user123");

          setUser({ ...result.user, firstName, username });
        } else {
          console.error("Failed to load user data:", result.message);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const cards = [
    {
      title: "Jobs for Me",
      img: "/card1.png",
      bgColor: "bg-blue-50",
      linkText: "10 new jobs for you →",
    },
    {
      title: "My Learning",
      img: "/card-2.png",
      bgColor: "bg-purple-50",
      linkText: "3 essential courses →",
    },
    {
      title: "My Social Story",
      img: "/card-3.png",
      bgColor: "bg-indigo-50",
      linkText: "4 New Messages →",
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center mt-8 text-gray-600">Loading dashboard...</div>
    );
  }

  return (
    <div className="flex flex-wrap gap-4 mt-6 justify-center">
      {/* Info cards */}
      {cards.map((card, index) => (
        <div
          key={index}
          className={`${card.bgColor} rounded-2xl shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition-all 
          w-full sm:w-[48%] lg:w-[23%]`}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-gray-800 font-semibold text-lg">{card.title}</h3>
          </div>

          <div className="flex justify-center mb-3">
            <img
              src={card.img}
              alt={card.title + " illustration"}
              className="w-28 h-24 object-contain"
              draggable="false"
            />
          </div>

          <button className="flex items-center text-sm text-blue-600 font-medium hover:underline">
            {card.linkText} <ArrowRight className="ml-1 w-4 h-4" />
          </button>
        </div>
      ))}

      {/* Profile Completion Card */}
      <div
        className="bg-white rounded-2xl shadow-sm p-5 flex flex-col justify-between border border-gray-100 
      w-full sm:w-[48%] lg:w-[23%]"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <img
              src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
              alt="Profile avatar"
              className="w-10 h-10 rounded-full"
            />
            <div>
              <h3 className="font-semibold text-gray-800">{user?.fullName}</h3>
              <button className="text-blue-600 text-sm font-medium hover:underline">
                View Profile
              </button>
            </div>
          </div>
          <div className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-2 py-1 rounded">
            50%
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-2">
          Your profile is complete for 50%
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
          <div className="bg-blue-600 h-2.5 rounded-full w-1/2"></div>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">Next: Add your Experience</p>
          <button className="bg-blue-600 text-white text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-blue-500 transition">
            Finish Your Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardCards;
