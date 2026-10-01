import React, { useState, useEffect, useRef } from 'react';
import { Activity, FileText, Utensils, Plus, Upload, Loader2, Sparkles, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function HealthTab() {
  const [subTab, setSubTab] = useState('records');
  const [records, setRecords] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [metricType, setMetricType] = useState('Blood Pressure');
  const [metricValue, setMetricValue] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [qData, setQData] = useState({
    age: '',
    gender: 'Male',
    weight: '',
    height: '',
    goal: 'Weight Loss',
    dietPreference: 'Vegetarian',
    allergies: '',
    dailyBudget: '$15 - $20',
  });
  const [dietPlan, setDietPlan] = useState('');
  const [generatingDiet, setGeneratingDiet] = useState(false);

  useEffect(() => {
    if (subTab === 'records') fetchHealthData();
  }, [subTab]);

  async function fetchHealthData() {
    setLoading(true);
    const { data: recs } = await supabase.from('health_records').select('*').order('record_date', { ascending: false });
    const { data: docs } = await supabase.from('health_documents').select('*').order('created_at', { ascending: false });
    setRecords(recs || []);
    setDocuments(docs || []);
    setLoading(false);
  }

  async function addRecord(e) {
    e.preventDefault();
    if (!metricValue.trim()) return;

    const { data, error } = await supabase
      .from('health_records')
      .insert([{ metric_type: metricType, metric_value: metricValue.trim(), notes: notes.trim() }])
      .select();

    if (!error && data) {
      setRecords([data[0], ...records]);
      setMetricValue('');
      setNotes('');
    }
  }

  async function handlePDFUpload(e) {
    const file = e.target.files[0];
    if (!file || file.type !== 'application/pdf') {
      alert('Please select a valid PDF file.');
      return;
    }

    setUploading(true);
    const fileName = `${Date.now()}_${file.name}`;

    const { error: storageError } = await supabase.storage.from('health_docs').upload(fileName, file);

    if (storageError) {
      alert('Upload failed: ' + storageError.message);
      setUploading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage.from('health_docs').getPublicUrl(fileName);

    const { data: docData } = await supabase
      .from('health_documents')
      .insert([{ document_name: file.name, file_url: publicUrlData.publicUrl }])
      .select();

    if (docData) setDocuments([docData[0], ...documents]);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function generateAIDietPlan(e) {
    e.preventDefault();
    setGeneratingDiet(true);
    setDietPlan('');

    const prompt = `Act as an expert clinical dietitian and nutritionist. 
Create a comprehensive, healthy 1-day sample meal plan with recipes and estimated costs based on these user details:
- Age: ${qData.age} years, Gender: ${qData.gender}
- Weight: ${qData.weight} kg, Height: ${qData.height} cm
- Primary Health Goal: ${qData.goal}
- Dietary Preference: ${qData.dietPreference}
- Allergies/Restrictions: ${qData.allergies || 'None'}
- Target Daily Budget: ${qData.dailyBudget}

Requirements:
1. Include Breakfast, Lunch, Dinner, and 2 healthy Snacks.
2. Provide precise portions, total estimated calories, and macro breakdown (Protein, Carbs, Fats).
3. Keep ingredients practical and strictly within the requested budget.`;

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        setDietPlan("⚠️ API Key Missing: Please add VITE_GEMINI_API_KEY to your .env file.");
        setGeneratingDiet(false);
        return;
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        }
      );

      const resData = await response.json();
      setDietPlan(resData.candidates[0].content.parts[0].text);
    } catch (err) {
      setDietPlan("Failed to connect to AI Nutritionist.");
    } finally {
      setGeneratingDiet(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <Activity className="w-7 h-7 text-emerald-500 dark:text-emerald-400" />
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Health & Wellness Hub</h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">Track vitals, upload medical PDFs, and get AI diet plans</p>
          </div>
        </div>

        {/* Sub-tab Switcher */}
        <div className="flex bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setSubTab('records')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
              subTab === 'records'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> My Records & PDFs
          </button>
          <button
            onClick={() => setSubTab('nutrition')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
              subTab === 'nutrition'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" /> AI Nutritionist
          </button>
        </div>
      </div>

      {subTab === 'records' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <form onSubmit={addRecord} className="md:col-span-2 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200 flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-500" /> Log Health Metric
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <select
                  value={metricType}
                  onChange={(e) => setMetricType(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="Blood Pressure">Blood Pressure</option>
                  <option value="Blood Sugar">Blood Sugar</option>
                  <option value="Body Weight">Body Weight</option>
                  <option value="Heart Rate / Pulse">Heart Rate / Pulse</option>
                  <option value="Cholesterol">Cholesterol</option>
                </select>

                <input
                  type="text"
                  placeholder="Value (e.g. 120/80 mmHg or 70 kg) *"
                  value={metricValue}
                  onChange={(e) => setMetricValue(e.target.value)}
                  required
                  className="px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <input
                type="text"
                placeholder="Doctor comments or daily notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
              />

              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition-colors"
              >
                Save Record
              </button>
            </form>

            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col justify-between space-y-4 shadow-sm">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200 mb-1">Health PDF Vault</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">Upload lab results, prescriptions, and medical reports for easy access.</p>
              </div>

              <input type="file" accept=".pdf" ref={fileInputRef} onChange={handlePDFUpload} className="hidden" />

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin text-emerald-500" /> : <Upload className="w-4 h-4 text-emerald-500" />}
                {uploading ? 'Uploading PDF...' : 'Upload Medical PDF'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Recorded Vitals</h4>
              {loading ? (
                <p className="text-xs text-slate-500 py-4">Loading health metrics...</p>
              ) : records.length === 0 ? (
                <p className="text-xs text-slate-500 py-4">No metrics recorded yet.</p>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {records.map((r) => (
                    <div key={r.id} className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 rounded-xl flex justify-between items-start">
                      <div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">{r.record_date}</span>
                        <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">{r.metric_type}: <span className="text-emerald-600 dark:text-emerald-400">{r.metric_value}</span></h5>
                        {r.notes && <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{r.notes}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">PDF Documents</h4>
              {loading ? (
                <p className="text-xs text-slate-500 py-4">Loading documents...</p>
              ) : documents.length === 0 ? (
                <p className="text-xs text-slate-500 py-4">No health PDFs uploaded yet.</p>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {documents.map((doc) => (
                    <div key={doc.id} className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 rounded-xl flex justify-between items-center">
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <FileText className="w-4 h-4 text-rose-500 flex-shrink-0" />
                        <span className="text-xs text-slate-800 dark:text-slate-200 truncate">{doc.document_name}</span>
                      </div>
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-lg text-[10px] font-medium transition-colors flex items-center gap-1 flex-shrink-0"
                      >
                        View <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {subTab === 'nutrition' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <form onSubmit={generateAIDietPlan} className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-500" /> Custom Diet Profile
            </h3>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-600 dark:text-slate-400">Age</label>
                <input
                  type="number"
                  placeholder="e.g. 28"
                  value={qData.age}
                  onChange={(e) => setQData({ ...qData, age: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-600 dark:text-slate-400">Gender</label>
                <select
                  value={qData.gender}
                  onChange={(e) => setQData({ ...qData, gender: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-600 dark:text-slate-400">Weight (kg)</label>
                <input
                  type="number"
                  placeholder="e.g. 75"
                  value={qData.weight}
                  onChange={(e) => setQData({ ...qData, weight: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-600 dark:text-slate-400">Height (cm)</label>
                <input
                  type="number"
                  placeholder="e.g. 175"
                  value={qData.height}
                  onChange={(e) => setQData({ ...qData, height: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-600 dark:text-slate-400">Health Goal</label>
              <select
                value={qData.goal}
                onChange={(e) => setQData({ ...qData, goal: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="Weight Loss">Weight Loss</option>
                <option value="Muscle Building">Muscle Building</option>
                <option value="Keto Fat Burning">Keto Fat Burning</option>
                <option value="Diabetes Control">Diabetes Control</option>
                <option value="General Fitness">General Fitness</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-600 dark:text-slate-400">Diet Type</label>
              <select
                value={qData.dietPreference}
                onChange={(e) => setQData({ ...qData, dietPreference: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="Vegetarian">Vegetarian</option>
                <option value="Vegan">Vegan</option>
                <option value="Non-Vegetarian">Non-Vegetarian</option>
                <option value="High-Protein">High-Protein</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-600 dark:text-slate-400">Daily Food Budget</label>
              <input
                type="text"
                placeholder="e.g. $10 - $15 per day"
                value={qData.dailyBudget}
                onChange={(e) => setQData({ ...qData, dailyBudget: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={generatingDiet}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {generatingDiet ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {generatingDiet ? 'AI Generating Diet Plan...' : 'Generate AI Meal Plan'}
            </button>
          </form>

          <div className="md:col-span-2 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col justify-between shadow-sm min-h-[400px]">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 pb-3 mb-4 flex items-center gap-2">
                <Utensils className="w-4 h-4 text-emerald-500" /> Tailored Diet & Budget Plan
              </h3>

              {generatingDiet ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-500 space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                  <p className="text-xs">Analyzing your metrics & computing budget meal macros...</p>
                </div>
              ) : dietPlan ? (
                <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap max-h-[500px] overflow-y-auto pr-2">
                  {dietPlan}
                </div>
              ) : (
                <div className="text-center py-20 text-slate-500 space-y-2">
                  <Sparkles className="w-10 h-10 text-slate-400 dark:text-slate-700 mx-auto" />
                  <p className="text-xs">Fill in your health profile on the left and click **Generate AI Meal Plan**.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}