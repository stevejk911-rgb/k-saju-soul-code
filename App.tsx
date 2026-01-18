import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { InputCard } from './components/InputCard';
import { Button } from './components/Button';
import { ResultView } from './components/ResultView';
import { INITIAL_FORM_STATE, STEPS_LOVE, STEPS_MONEY, COPY } from './constants';
import { FormData, Mode, SajuResponse } from './types';
import { generateSajuReading } from './services/geminiService';
import { Loader2 } from 'lucide-react';
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

// IMPORTANT: Replace "test" with your actual PayPal Client ID from developer.paypal.com
const PAYPAL_CLIENT_ID = "AYSDmcYrvBTLIsp42z00dmADJF2T3dt9XjGcuJABCH5ahMcN8w6-2dcHpTlYKSynUT2BdwmJiqKbHIOG"; 

const App: React.FC = () => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_STATE);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<SajuResponse | null>(null);

  // Derived state
  const isLove = formData.mode === 'LOVE';
  const steps = isLove ? STEPS_LOVE : STEPS_MONEY;
  const totalSteps = steps.length;

  const handleModeSelect = (mode: Mode) => {
    setFormData(prev => ({ ...prev, mode }));
    setStep(1);
  };

  const updateFormData = (field: string, value: any, nested?: 'user' | 'partner') => {
    if (nested) {
      setFormData(prev => ({
        ...prev,
        [nested]: { ...prev[nested]!, [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => Math.max(0, prev - 1));

  const runAnalysis = async () => {
    setStep(isLove ? 5 : 4); // Move to analyzing screen
    setIsAnalyzing(true);
    
    try {
      // Minimum "analysis" time for UX suspense
      const minTimePromise = new Promise(resolve => setTimeout(resolve, 3000));
      const apiPromise = generateSajuReading(formData, false);
      
      const [_, response] = await Promise.all([minTimePromise, apiPromise]);
      setResult(response);
      setStep(prev => prev + 1); // Move to result
    } catch (e) {
      console.error(e);
      // Handle error (alert for now)
      alert("The stars are clouded. Please try again.");
      setStep(0);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // --- Render Steps ---

  const renderModeSelect = () => (
    <div className="w-full max-w-md mx-auto animate-fade-in-up">
      {/* Header Section */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-['Eczar'] font-black text-white mb-4 tracking-tighter uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] leading-[0.9]">
          {COPY.mode.title}
        </h1>
        <p className="text-base text-zinc-400 font-medium leading-relaxed max-w-xs mx-auto">
          {COPY.mode.subtitle}
        </p>
      </div>

      {/* Grid Buttons */}
      <div className="grid grid-cols-2 gap-4">
        {/* LOVE BUTTON */}
        <button
          onClick={() => handleModeSelect('LOVE')}
          className="group relative flex flex-col items-center justify-center h-64 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 transition-all duration-500 hover:bg-black/60 hover:border-red-600 hover:shadow-[0_0_40px_rgba(220,38,38,0.25)] hover:-translate-y-1 overflow-hidden"
        >
           {/* Gradient Background Effect */}
           <div className="absolute inset-0 bg-gradient-to-t from-red-900/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
           
           <div className="relative z-10 text-center space-y-3">
             {COPY.mode.btn_love.split('\n').map((line, i) => (
               <span key={i} className={`block font-heading font-black uppercase tracking-[0.2em] transition-all duration-300 ${i === 2 ? 'text-2xl text-red-600 group-hover:text-red-500 group-hover:scale-110 drop-shadow-[0_0_8px_rgba(220,38,38,0.5)]' : 'text-lg text-zinc-500 group-hover:text-white'}`}>
                 {line}
               </span>
             ))}
           </div>
        </button>

        {/* MONEY BUTTON */}
        <button
          onClick={() => handleModeSelect('MONEY')}
          className="group relative flex flex-col items-center justify-center h-64 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 transition-all duration-500 hover:bg-black/60 hover:border-emerald-500 hover:shadow-[0_0_40px_rgba(16,185,129,0.25)] hover:-translate-y-1 overflow-hidden"
        >
           {/* Gradient Background Effect */}
           <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
           
           <div className="relative z-10 text-center space-y-3">
             {COPY.mode.btn_money.split('\n').map((line, i) => (
               <span key={i} className={`block font-heading font-black uppercase tracking-[0.2em] transition-all duration-300 ${i === 2 ? 'text-2xl text-emerald-500 group-hover:text-emerald-400 group-hover:scale-110 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'text-lg text-zinc-500 group-hover:text-white'}`}>
                 {line}
               </span>
             ))}
           </div>
        </button>
      </div>
    </div>
  );

  const renderPersonForm = (type: 'user' | 'partner') => {
    const data = type === 'user' ? formData.user : formData.partner;
    const copy = type === 'user' ? COPY.user_details : COPY.partner_details;
    
    // Auto-init partner object if null
    if (type === 'partner' && !formData.partner) {
      // Logic handled in handleChange safely
    }

    const handleChange = (f: string, v: string) => {
      // Safety init for partner
      if (type === 'partner' && !formData.partner) {
          setFormData(prev => ({ ...prev, partner: { name: '', birthDate: '', birthTime: 'unknown', gender: 'F', [f]: v }}));
      } else {
          updateFormData(f, v, type);
      }
    };

    // Helper to manage split date inputs
    const handleDateChange = (part: 'year' | 'month' | 'day', val: string) => {
        const current = data?.birthDate || '--';
        const [y, m, d] = current.includes('-') ? current.split('-') : ['', '', ''];
        
        let newDate = '';
        if (part === 'year') newDate = `${val}-${m}-${d}`;
        if (part === 'month') newDate = `${y}-${val}-${d}`;
        
        if (part === 'day') {
           // Enforce 1-31 logic
           let safeDay = val;
           if (safeDay !== '') {
             const num = parseInt(safeDay, 10);
             if (num > 31) safeDay = '31';
             if (num < 1 && safeDay.length > 0) safeDay = '1';
           }
           newDate = `${y}-${m}-${safeDay}`;
        }
        
        handleChange('birthDate', newDate);
    };

    const [year, month, day] = (data?.birthDate || '').split('-');

    // Validation: Name, Year, Month, Day, Gender are required. Time is optional.
    const isReady = data && 
                    data.name.trim().length > 0 && 
                    year && year.length === 4 && 
                    month && 
                    day && day.length > 0 &&
                    data.gender;

    return (
      <InputCard title={copy.title} subtitle={copy.subtitle}>
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs text-slate-400 mb-1 ml-1 uppercase font-bold tracking-wider">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder={copy.name_ph}
              value={data?.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full bg-white/5 border border-white/20 rounded-lg p-3 text-white placeholder-slate-600 focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>

          {/* Date of Birth - Split Fields for English UI */}
          <div>
            <label className="block text-xs text-slate-400 mb-1 ml-1 uppercase font-bold tracking-wider">
              Date of Birth <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
                <input 
                    type="number" 
                    placeholder="YYYY" 
                    value={year || ''}
                    onChange={(e) => handleDateChange('year', e.target.value)}
                    className="w-1/3 bg-white/5 border border-white/20 rounded-lg p-3 text-white placeholder-slate-600 focus:outline-none focus:border-red-500"
                />
                <select 
                    value={month || ''}
                    onChange={(e) => handleDateChange('month', e.target.value)}
                    className="w-1/3 bg-white/5 border border-white/20 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 appearance-none"
                >
                    <option value="" disabled>Month</option>
                    {Array.from({length: 12}, (_, i) => {
                        const m = (i + 1).toString().padStart(2, '0');
                        const name = new Date(2000, i, 1).toLocaleString('en-US', { month: 'short' });
                        return <option key={m} value={m} className="bg-black text-white">{name}</option>
                    })}
                </select>
                <input 
                    type="number" 
                    placeholder="DD" 
                    min={1}
                    max={31}
                    value={day || ''}
                    onChange={(e) => handleDateChange('day', e.target.value)}
                    className="w-1/3 bg-white/5 border border-white/20 rounded-lg p-3 text-white placeholder-slate-600 focus:outline-none focus:border-red-500"
                />
            </div>
          </div>

          <div className="flex gap-4">
             {/* Time - Optional Dropdown */}
             <div className="flex-1">
                <label className="block text-xs text-slate-400 mb-1 ml-1 uppercase font-bold tracking-wider">Time</label>
                <select
                  value={data?.birthTime || 'unknown'}
                  onChange={(e) => handleChange('birthTime', e.target.value)}
                  className="w-full bg-white/5 border border-white/20 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 appearance-none"
                >
                    <option value="unknown" className="bg-black text-zinc-400">Unknown</option>
                    {Array.from({length: 24}, (_, i) => {
                        const t = i.toString().padStart(2, '0') + ":00";
                        return <option key={t} value={t} className="bg-black text-white">{t}</option>
                    })}
                </select>
             </div>

             {/* Gender */}
             <div className="w-1/3">
                <label className="block text-xs text-slate-400 mb-1 ml-1 uppercase font-bold tracking-wider">
                    Gender <span className="text-red-500">*</span>
                </label>
                <select
                  value={data?.gender || 'M'}
                  onChange={(e) => handleChange('gender', e.target.value)}
                  className="w-full bg-white/5 border border-white/20 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 appearance-none"
                >
                  <option value="M" className="bg-black">Male</option>
                  <option value="F" className="bg-black">Female</option>
                  <option value="Other" className="bg-black">Other</option>
                </select>
             </div>
          </div>
        </div>
        <div className="pt-4">
           <Button onClick={nextStep} disabled={!isReady}>
             {copy.cta}
           </Button>
        </div>
      </InputCard>
    );
  };

  const renderContext = () => {
    const isLove = formData.mode === 'LOVE';
    const title = isLove ? COPY.context.love_title : COPY.context.money_title;
    const subtitle = isLove ? COPY.context.love_subtitle : COPY.context.money_subtitle;
    const ph = isLove ? COPY.context.love_ph : COPY.context.money_ph;
    const val = isLove ? formData.relationshipStatus : formData.occupation;
    const field = isLove ? 'relationshipStatus' : 'occupation';

    return (
      <InputCard title={title} subtitle={subtitle}>
        <input
          type="text"
          placeholder={ph}
          value={val}
          onChange={(e) => updateFormData(field, e.target.value)}
          className="w-full bg-white/5 border border-white/20 rounded-lg p-3 text-white placeholder-slate-600 focus:outline-none focus:border-red-500"
        />
        <div className="pt-4">
           {/* Enabled by default for optional skip */}
           <Button onClick={nextStep}>
             {COPY.context.cta}
           </Button>
        </div>
      </InputCard>
    );
  };

  const renderFinalKey = () => {
    const isLove = formData.mode === 'LOVE';
    const ph = isLove ? COPY.final_key.love_ph : COPY.final_key.money_ph;
    
    return (
      <InputCard title={COPY.final_key.title} subtitle={COPY.final_key.subtitle}>
        <textarea
          rows={3}
          placeholder={ph}
          value={formData.finalQuestion}
          onChange={(e) => updateFormData('finalQuestion', e.target.value)}
          className="w-full bg-white/5 border border-white/20 rounded-lg p-3 text-white placeholder-slate-600 focus:outline-none focus:border-red-500 resize-none"
        />
        <div className="pt-4">
           {/* Enabled by default for optional skip */}
           <Button onClick={runAnalysis}>
             {COPY.final_key.cta}
           </Button>
        </div>
      </InputCard>
    );
  };

  const renderAnalyzing = () => (
    <div className="flex flex-col items-center justify-center text-center animate-pulse">
       <Loader2 className="w-12 h-12 text-red-500 animate-spin mb-6" />
       <h2 className="text-2xl font-serif text-white mb-2">Accessing The Soul Code...</h2>
       <p className="text-sm text-slate-400">Calculating future trajectory (2026+)</p>
    </div>
  );

  // --- Step Controller ---
  
  const getStepContent = () => {
    if (step === 0) return renderModeSelect();
    
    if (formData.mode === 'LOVE') {
      if (step === 1) return renderPersonForm('user');
      if (step === 2) return renderPersonForm('partner');
      if (step === 3) return renderContext();
      if (step === 4) return renderFinalKey();
      if (step === 5) return renderAnalyzing();
      // Wraps result view in PayPal Provider when active
      if (step === 6 && result) return (
         <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID }}>
            <ResultView data={result} />
         </PayPalScriptProvider>
      );
    } else {
      if (step === 1) return renderPersonForm('user');
      if (step === 2) return renderContext();
      if (step === 3) return renderFinalKey();
      if (step === 4) return renderAnalyzing();
      // Wraps result view in PayPal Provider when active
      if (step === 5 && result) return (
         <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID }}>
            <ResultView data={result} />
         </PayPalScriptProvider>
      );
    }
    return null;
  };

  return (
    <Layout 
      onBack={prevStep} 
      showBack={step > 0 && !result} 
      step={step} 
      totalSteps={totalSteps}
    >
      {getStepContent()}
    </Layout>
  );
};

export default App;