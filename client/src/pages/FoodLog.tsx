import React, { useEffect, useRef, useState } from "react";
import { useAppContext } from "../context/AppContext";
import type { FoodEntry } from "../types";
import Card from "../components/ui/Card";
import { quickActivitiesFoodLog, mealIcons } from "../assets/assets";
import {
  Loader2Icon,
  PlusIcon,
  SparkleIcon,
  Trash2Icon,
  UtensilsCrossedIcon,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import Input from "../components/ui/Input";
import api from "../configs/api";

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
      return;
    }

    try {
      const { data } = await api.post("/api/food-logs", { data: formData });
      setAllFoodLogs((prev) => [...prev, data.data]);
      setFormData({ name: "", calories: 0, mealType: "" });
      setShowForm(false);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const confirm = window.confirm("Are you sure?");
      if (!confirm) return;

      await api.delete(`/api/food-logs/${id}`);
      setAllFoodLogs((prev) =>
        prev.filter((e: any) => e.id !== Number(id))
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

    const formData = new FormData();
    formData.append("image", file);

    try {
      const { data } = await api.post("/api/image-analysis", formData);

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
        },
      });

      setAllFoodLogs((prev) => [...prev, newEntry.data]);

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
    <>
      <div className="page-container">
        <div className="page-header">
          <div className="flex justify-between">
            <h1 className="text-xl font-bold">Food Log</h1>
            <p>{totalCalories} kcal</p>
          </div>
        </div>

        <div className="page-content-grid">
          {!showForm && (
            <div className="space-y-4">
              <Card>
                <div className="flex gap-2 flex-wrap">
                  {quickActivitiesFoodLog.map((a) => (
                    <button key={a.name} onClick={() => handleQuickAdd(a.name)}>
                      {a.name}
                    </button>
                  ))}
                </div>
              </Card>

              <Button onClick={() => setShowForm(true)}>
                <PlusIcon /> Add Food
              </Button>

              <Button onClick={() => inputRef.current?.click()}>
                <SparkleIcon /> AI Scan
              </Button>

              <input hidden ref={inputRef} type="file" onChange={handleImageChange} />

              {loading && <Loader2Icon className="animate-spin" />}
            </div>
          )}

          {showForm && (
            <Card>
              <form onSubmit={handleSubmit}>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />

                <Input
                  type="number"
                  value={String(formData.calories)}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      calories: Number(e.target.value),
                    })
                  }
                />

                <Button type="submit">Add</Button>
              </form>
            </Card>
          )}

          {entries.length === 0 ? (
            <Card>
              <UtensilsCrossedIcon />
              No food logged
            </Card>
          ) : (
            <div>
              {Object.keys(groupedEntries).map((meal) => {
                  mealIcons[meal as keyof typeof mealIcons];

                return (
                  <Card key={meal}>
                    <h3>{meal}</h3>

                    {groupedEntries[meal].map((entry: FoodEntry) => (
                      <div key={entry.documentId}>
                        {entry.name} - {entry.calories}
                        <button
                          onClick={() =>
                            handleDelete(entry.documentId || "")
                          }
                        >
                          <Trash2Icon />
                        </button>
                      </div>
                    ))}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default FoodLog;