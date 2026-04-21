import React, { useEffect, useRef, useState } from "react";
import { useAppContext } from "../context/AppContext";
import type { FoodEntry } from "../types";
import Card from "../components/ui/Card";
import { quickActivitiesFoodLog } from "../assets/assets";
import {
  Loader2Icon,
  PlusIcon,
  SparkleIcon,
  Trash2Icon,
  UtensilsCrossedIcon,
  CoffeeIcon,
  SunIcon,
  MoonIcon,
  CookieIcon,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import Input from "../components/ui/Input";
import api from "../configs/api";

const mealConfig: Record<
  string,
  { icon: React.ElementType; colorClass: string }
> = {
  breakfast: {
    icon: CoffeeIcon,
    colorClass: "bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
  },
  lunch: {
    icon: SunIcon,
    colorClass: "bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
  },
  dinner: {
    icon: MoonIcon,
    colorClass: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400",
  },
  snack: {
    icon: CookieIcon,
    colorClass: "bg-pink-100 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400",
  },
};

const FoodLog = () => {
  const { allFoodLogs, setAllFoodLogs } = useAppContext();

  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<FoodEntry>({
    name: "",
    calories: 0,
    mealType: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const inputRef = useRef<HTMLInputElement | null>(null);

  const today = new Date().toISOString().split("T")[0];

  const loadEntries = () => {
    const todaysEntries = allFoodLogs.filter(
      (e: FoodEntry) => e.createdAt?.split("T")[0] === today
    );
    setEntries(todaysEntries);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.calories || !formData.mealType) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      const { data } = await api.post("/api/food-logs", { data: formData });
      setAllFoodLogs((prev) => [...prev, data]);
      setFormData({ name: "", calories: 0, mealType: "" });
      setShowForm(false);
      setError("");
    } catch (error) {
      console.log(error);
      setError("Failed to add food. Please try again.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const confirm = window.confirm("Are you sure you want to delete this entry?");
      if (!confirm) return;

      await api.delete(`/api/food-logs/${id}`);
      setAllFoodLogs((prev) =>
        prev.filter((e: any) => e.documentId !== id)
      );
    } catch (error) {
      console.log(error);
    }
  };

  const totalCalories = entries.reduce((sum, e) => sum + e.calories, 0);

  const groupedEntries = entries.reduce((acc: any, entry) => {
    if (!acc[entry.mealType]) acc[entry.mealType] = [];
    acc[entry.mealType].push(entry);
    return acc;
  }, {});

  const handleQuickAdd = (meal: string) => {
    setFormData({ ...formData, mealType: meal as FoodEntry["mealType"] });
    setShowForm(true);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);

    const formDataToUpload = new FormData();
    formDataToUpload.append("image", file);

    try {
      const { data } = await api.post("/api/image-analysis", formDataToUpload);

      const result = data.result;
      let mealType = "";

      const hour = new Date().getHours();

      if (hour < 12) mealType = "breakfast";
      else if (hour < 16) mealType = "lunch";
      else if (hour < 18) mealType = "snack";
      else mealType = "dinner";

      const { data: newEntry } = await api.post("/api/food-logs", {
        data: {
          name: result.name,
          calories: result.calories,
          mealType,
        }
      });

      setAllFoodLogs((prev) => [...prev, newEntry]);

      if (inputRef.current) inputRef.current.value = "";
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEntries();
  }, [allFoodLogs]);

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Food Log</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Track your meals
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500 dark:text-slate-400">Calories Consumed</p>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {totalCalories} kcal
            </p>
          </div>
        </div>
      </div>

      <div className="page-content-grid">
        {!showForm && (
          <div className="space-y-4">
            <Card>
              <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-3">
                Quick Add
              </h3>
              <div className="flex flex-wrap gap-2">
                {quickActivitiesFoodLog.map((a) => (
                  <button
                    key={a.name}
                    onClick={() => handleQuickAdd(a.name)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-2 capitalize"
                  >
                    <span>{a.emoji}</span> {a.name}
                  </button>
                ))}
              </div>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <Button className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setShowForm(true)}>
                <PlusIcon className="size-5" />
                Add Food
              </Button>

              <Button
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={() => inputRef.current?.click()}
                disabled={loading}
              >
                {loading ? <Loader2Icon className="animate-spin size-5" /> : <SparkleIcon className="size-5" />}
                {loading ? "Scanning..." : "AI Scan"}
              </Button>
            </div>

            <input hidden ref={inputRef} type="file" accept="image/*" onChange={handleImageChange} />
          </div>
        )}

        {showForm && (
          <Card className="border-2 border-emerald-200 dark:border-emerald-800">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-4">
              New Meal Entry
            </h3>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <Input
                label="Food Name"
                placeholder="e.g., Grilled Chicken Salad"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />

              <div className="flex gap-4">
                <Input
                  label="Calories"
                  type="number"
                  className="flex-1 w-max"
                  placeholder="300"
                  min={1}
                  max={5000}
                  required
                  value={String(formData.calories)}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      calories: Number(e.target.value),
                    })
                  }
                />
                <div className="flex-1 flex flex-col space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Meal Type
                  </label>
                  <select
                    value={formData.mealType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        mealType: e.target.value as FoodEntry["mealType"],
                      })
                    }
                    className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all min-w-max"
                    required
                  >
                    <option value="" disabled>Select Meal...</option>
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="snack">Snack</option>
                    <option value="dinner">Dinner</option>
                  </select>
                </div>
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200"
                  onClick={() => {
                    setShowForm(false);
                    setError("");
                    setFormData({ name: "", calories: 0, mealType: "" });
                  }}
                >
                  Cancel
                </Button>

                <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white">
                  Add Entry
                </Button>
              </div>
            </form>
          </Card>
        )}

        {entries.length === 0 ? (
          <Card className="text-center py-2">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <UtensilsCrossedIcon className="w-8 h-8 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-2">
              No food logged today
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Keep track of your nutritional intake
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {Object.keys(groupedEntries).map((meal) => {
              const MealIcon = mealConfig[meal]?.icon || UtensilsCrossedIcon;
              const colorClass = mealConfig[meal]?.colorClass || "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400";
              const mealCalories = groupedEntries[meal].reduce((acc: number, val: FoodEntry) => acc + val.calories, 0);

              return (
                <Card key={meal} className="overflow-hidden p-0">
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass}`}>
                        <MealIcon className="size-5" />
                      </div>
                      <h3 className="font-semibold text-slate-800 dark:text-white capitalize">
                        {meal}
                      </h3>
                    </div>
                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                      {mealCalories} kcal
                    </span>
                  </div>

                  <div className="p-4 space-y-3">
                    {groupedEntries[meal].map((entry: FoodEntry) => (
                      <div key={entry.documentId} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <div className="flex-1">
                          <p className="font-medium text-slate-700 dark:text-slate-200">
                            {entry.name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Logged at {new Date(entry?.createdAt || "").toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-4 min-w-[120px]">
                          <div className="text-right">
                            <p className="font-semibold text-slate-700 dark:text-slate-200">
                              {entry.calories}
                            </p>
                            <p className="text-xs text-slate-400">kcal</p>
                          </div>
                          <button
                            onClick={() => handleDelete(entry.documentId || "")}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Delete entry"
                          >
                            <Trash2Icon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodLog;