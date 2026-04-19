import { useAppContext } from "../context/AppContext";
import { useTheme } from "../context/ThemeContext";
import { useEffect, useState } from "react";
import type { ProfileFormData } from "../types";
import Card from "../components/ui/Card";
import { Calendar, LogOutIcon, MoonIcon, Scale, SunIcon, Target, User } from "lucide-react";
import { Button } from "../components/ui/Button";
import { goalLabels, goalOptions } from "../assets/assets";
import Input from "../components/ui/Input";
// import toast from "react-hot-toast";
import api from "../configs/api";

const Profile = () => {
  const { user, logout, fetchUser, allFoodLogs, allActivityLogs } = useAppContext();
  const { theme, toggleTheme } = useTheme();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormdata] = useState<ProfileFormData>({
    age: 0,
    weight: 0,
    height: 0,
    goal: "maintain",
    dailyCalorieIntake: 2000,
    dailyCalorieBurn: 400,
  });

  const fetchUserData = () => {
    if (user) {
      setFormdata({
        age: user?.age || 0,
        weight: user?.weight || 0,
        height: user?.height || 0,
        goal: user?.goal || "maintain",
        dailyCalorieIntake: user?.dailyCalorieIntake || 2000,
        dailyCalorieBurn: user?.dailyCalorieBurn || 400,
      });
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [user]);

  const handleSave = async () => {
    try {
      await api.put(`/api/users/${user?.id}`, formData);
      await fetchUser(user?.token || "");
      // toast.success("Profile updated successfully");
    } catch (error: any) {
      console.log(error);
      // toast.error(error?.message || "Failed to update profile");
    }
  };

  const getStats = () => {
    const totalFoodEntries = allFoodLogs?.length || 0;
    const totalActivities = allActivityLogs?.length || 0;

    return { totalFoodEntries, totalActivities };
  };

  const stats = getStats();

  if (!user) return null;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Profile</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">manage your settings</p>
      </div>

      <div className="profile-content">
        <Card>
          <div className="flex items-center gap-4 mb-6">
            <div className="size-12 rounded-xl bg-linear-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
              <User className="size-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Your Profile</h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs">
                Member since {new Date(user?.createdAt || "").toLocaleDateString()}
              </p>
            </div>
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <Input label="Age" type="number" value={String(formData.age)} onChange={(v) => setFormdata({ ...formData, age: Number(v) })} min={13} max={120} />
              <Input label="Weight (kg)" type="number" value={String(formData.weight)} onChange={(v) => setFormdata({ ...formData, weight: Number(v) })} min={20} max={300} />
              <Input label="Height (cm)" type="number" value={String(formData.height)} onChange={(v) => setFormdata({ ...formData, height: Number(v) })} min={100} max={250} />

              <select
                value={formData.goal}
                onChange={(e) => setFormdata({ ...formData, goal: e.target.value as "lose" | "maintain" | "gain" })}
                className="login-input"
              >
                {goalOptions.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>

              <div className="flex gap-3 pt-2">
                <Button
                  className="flex-1"
                  onClick={() => {
                    setIsEditing(false);
                    setFormdata({
                      age: Number(user.age),
                      weight: Number(user.weight),
                      height: Number(user.height),
                      goal: user.goal || "maintain",
                      dailyCalorieIntake: user.dailyCalorieIntake || 2000,
                      dailyCalorieBurn: user.dailyCalorieBurn || 400,
                    });
                  }}
                >
                  Cancel
                </Button>

                <Button onClick={handleSave} className="flex-1">
                  Save Changes
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <Calendar className="size-4.5 text-blue-600" />
                  <div>
                    <p className="text-sm text-slate-500">Age</p>
                    <p className="font-semibold text-slate-800 dark:text-white">{user.age} years</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <Scale className="size-4.5 text-purple-600" />
                  <div>
                    <p className="text-sm text-slate-500">Weight</p>
                    <p className="font-semibold text-slate-800 dark:text-white">{user.weight} kg</p>
                  </div>
                </div>

                {user.height !== 0 && (
                  <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <User className="size-4.5 text-green-600" />
                    <div>
                      <p className="text-sm text-slate-500">Height</p>
                      <p className="font-semibold text-slate-800 dark:text-white">{user.height} cm</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <Target className="size-4.5 text-orange-600" />
                  <div>
                    <p className="text-sm text-slate-500">Goal</p>
                    <p className="font-semibold text-slate-800 dark:text-white">
                      {goalLabels[user?.goal || "gain"]}
                    </p>
                  </div>
                </div>
              </div>

              <Button onClick={() => setIsEditing(true)} className="mt-4">
                Edit Profile
              </Button>
            </>
          )}
        </Card>

        <div className="space-y-4">
          <Card>
            <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Your Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl">
                <p className="text-2xl font-bold text-emerald-600">{stats.totalFoodEntries}</p>
                <p className="text-sm text-slate-500">Food Entries</p>
              </div>
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl">
                <p className="text-2xl font-bold text-blue-600">{stats.totalActivities}</p>
                <p className="text-sm text-slate-500">Activities</p>
              </div>
            </div>
          </Card>

          <div className="lg:hidden">
            <button onClick={toggleTheme} className="flex items-center gap-3 px-4 py-2.5 w-full">
              {theme === "light" ? <MoonIcon className="size-5" /> : <SunIcon className="size-5" />}
              <span>{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
            </button>
          </div>

          <Button onClick={logout} className="w-full">
            <LogOutIcon className="size-4" />
            LogOut
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;