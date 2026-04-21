import { PersonStanding, User } from "lucide-react";
import { useState } from "react";
// import toast, { Toaster } from "react-hot-toast";
import { useAppContext } from "../context/AppContext";
import type { ProfileFormData } from "../types";
import Input from "../components/ui/Input";
import { useNavigate } from "react-router-dom";
import api from "../configs/api";

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const { setOnboardingCompleted, user, fetchUser } = useAppContext();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<ProfileFormData>({
    age: 0,
    weight: 0,
    height: 0,
    goal: "maintain",
    dailyCalorieIntake: 2000,
    dailyCalorieBurn: 400,
  });

  const totalSteps = 3;

  const updateField = (field: keyof ProfileFormData, value: string | number) => {
    setFormData({ ...formData, [field]: Number(value) || value });
  };

  const handleNext = async () => {
    if (step === 1) {
      if (!formData.age || Number(formData.age) < 13 || Number(formData.age) > 120) {
        // return toast("Age is required");
      }
    }

    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    const userData = {
      ...formData,
      age: Number(formData.age),
      weight: Number(formData.weight),
      height: formData.height ? Number(formData.height) : null,
    };

    try {
      await api.put(`/api/users/${user?.id}`, userData);
      setOnboardingCompleted(true);
      await fetchUser(user?.token || "");
      navigate("/");
    } catch (error: any) {
      console.error(error);
    }
  };

  return (
    <>
      {/* <Toaster /> */}

      <div className="onboarding-container">
        <div className="p-6 pt-12 onboarding-wrapper">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
              <PersonStanding className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">FitTrack</h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 mt-4">
            Let's personalize your experience
          </p>
        </div>

        <div className="px-6 mb-8 onboarding-wrapper">
          <div className="flex gap-2 max-w-2xl">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                  s <= step ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-800"
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-slate-400 mt-3">
            Step {step} of {totalSteps}
          </p>
        </div>

        <div className="flex-1 px-6 onboarding-wrapper">
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 mb-8">
                <div className="size-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800 flex items-center justify-center">
                  <User className="size-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                    How old are you?
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    This helps us calculate your needs
                  </p>
                </div>
              </div>

              <Input
                label="Age"
                type="number"
                className="max-w-2xl"
                value={String(formData.age)}
                onChange={(e) => updateField("age", e.target.value)}
                placeholder="Enter your age"
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                Your Measurements
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Helps us track your progress
              </p>

              <Input
                label="Weight (kg)"
                type="number"
                value={String(formData.weight)}
                onChange={(e) => updateField("weight", e.target.value)}
                placeholder="Enter your weight"
                min={20}
                max={120}
                required
              />

              <Input
                label="Height (cm)"
                type="number"
                value={String(formData.height)}
                onChange={(e) => updateField("height", e.target.value)}
                placeholder="Enter height"
              />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                Your Goal
              </h2>

              <select
                value={formData.goal}
                onChange={(e) => updateField("goal", e.target.value)}
                className="login-input"
              >
                <option value="lose">🔥Lose Weight</option>
                <option value="maintain">⚖️Maintain</option>
                <option value="gain">💪🏻Gain Weight</option>
              </select>

              <Input
                label="Daily Calorie Intake"
                type="number"
                value={String(formData.dailyCalorieIntake)}
                onChange={(e) => updateField("dailyCalorieIntake", e.target.value)}
                placeholder="Calories intake"
              />

              <Input
                label="Daily Calorie Burn"
                type="number"
                value={String(formData.dailyCalorieBurn)}
                onChange={(e) => updateField("dailyCalorieBurn", e.target.value)}
                placeholder="Calories burn"
              />
            </div>
          )}

          <div className="flex justify-between mt-8">
            {step > 1 && (
              <button onClick={handleBack} className="login-button">
                Back
              </button>
            )}

            {step < totalSteps ? (
              <button onClick={handleNext} className="login-button ml-auto">
                Next
              </button>
            ) : (
              <button onClick={handleSubmit} className="login-button ml-auto">
                Finish
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Onboarding;