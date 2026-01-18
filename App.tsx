
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

// PayPal Client ID
const PAYPAL_CLIENT_ID = "AVdHM8ow4Q4aMTd_m9WDCqr8IYNWxCX_r3mc855R08Z4_xzXZ_laPfk51qAJttiBVzhICIZ-GJC4Uj6i"; 

const App: React.FC = () => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_STATE);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<SajuResponse | null>(null);

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
    const loadingStep = isLove ? 5 : 4;
    setStep(loadingStep); 
    setIsAnalyzing(true);
    
    try {
      const minTimePromise = new Promise(resolve => setTimeout(resolve, 3000));
      const apiPromise = generateSajuReading(formData);
      
      const [_, response] = await Promise.all([minTimePromise, apiPromise]);
      setResult(response);
      setStep(loadingStep + 1); 
    } catch (e: any) {
      console.error("ANALYSIS_ERROR:", e);
      alert(`The stars are clouded: ${e.message || 'Please try again later.'}`);
      // Go back to the last interactive step instead of total reset
      setStep(isLove ? 4 : 3);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderModeSelect = () => (
    <div className="w-full max-w-md mx-auto animate-fade-in-up">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-['Eczar'] font-black text-white mb-4 tracking-tighter uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] leading-[0.9]">
          {COPY.mode.title}
        </h1>
        <p className="text-base text-zinc-400 font-medium leading-relaxed max-w-xs mx-auto">
          {COPY.mode.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => handleModeSelect('LOVE')}
          className="group relative flex flex-col items-center justify-center h-64 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 transition-all duration-500 hover:bg-black/60 hover:border-red-600 hover:shadow-[0_0_40px_rgba(220,38,38,0.25)] hover:-translate-y-1 overflow-hidden"
        >
           <div className="absolute inset-0 bg-gradient-to-t from-red-900/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
           <div className="relative z-10 text-center space-y-3">
             {COPY.mode.btn_love.split('\n').map((line, i) => (
               <span key={i} className={`block font-heading font-black uppercase tracking-[0.2em] transition-all duration-300 ${i === 2 ? 'text-2xl text-red-600 group-hover:text-red-500 group-hover:scale-110 drop-shadow-[0_0_8px_rgba(220,38,38,0.5)]' : 'text-lg text-zinc-500 group-hover:text-white'}`}>
                 {line}
               </span>
             ))}
           </div>
        </button>

        <button
          onClick={() => handleModeSelect('MONEY')}
          className="group relative flex flex-col items-center justify-center h-64 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 transition-all duration-500 hover:bg-black/60 hover:border-emerald-500 hover:shadow-[0_0_40px_rgba(16,185,129,0.25)] hover:-translate-y-1 overflow-hidden"
        >
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
    
    const handleChange = (f: string, v: string) => {
      if (type === 'partner' && !formData.partner) {
          setFormData(prev => ({ ...prev, partner: { name: '', birthDate: '', birthTime: 'unknown', gender: 'F', [f]: v }}));
      } else {
          updateFormData(f, v, type);
      }
    };

    const handleDateChange = (part: 'year' | 'month' | 'day', val: string) => {
        const current = data?.birthDate || '--';
        const [y, m, d] = current.includes('-') ? current.split('-') : ['', '', ''];
        
        let newDate = '';
        if (part === 'year') {
          const cleaned = val.replace(/\D/g, '').slice(0, 4);
          newDate = `${cleaned}-${m}-${d}`;
        }
        if (part === 'month') newDate = `${y}-${val}-${d}`;
        if (part === 'day') {
           let safeDay = val.replace(/\D/g, '').slice(0, 2);
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
    const isReady = data && 
                    data.name.trim().length > 0 && 
                    year && year.length === 4 && 
                    month && 
                    day && day.length > 0 &&
                    data.gender;

    return (
      <InputCard title={copy.title} subtitle={copy.subtitle}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-zinc-400 mb-1 ml-1 uppercase font-bold tracking-wider">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder={copy.name_ph}
              value={data?.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full bg-white/5 border border-white/20 rounded-lg p-3 text-white placeholder-zinc-700 focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1 ml-1 uppercase font-bold tracking-wider">
              Date of Birth <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
                <input 
                    type="text"
                    inputMode="numeric"
                    placeholder="YYYY" 
                    value={year || ''}
                    onChange={(e) => handleDateChange('year', e.target.value)}
                    className="w-1/3 bg-white/5 border border-white/20 rounded-lg p-3 text-white placeholder-zinc-700 focus:outline-none focus:border-red-500"
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
                    type="text"
                    inputMode="numeric"
                    placeholder="DD" 
                    value={day || ''}
                    onChange={(e) => handleDateChange('day', e.target.value)}
                    className="w-1/3 bg-white/5 border border-white/20 rounded-lg p-3 text-white placeholder-zinc-700 focus:outline-none focus:border-red-500"
                />
            </div>
          </div>

          <div className="flex gap-4">
             <div className="flex-1">
                <label className="block text-xs text-zinc-400 mb-1 ml-1 uppercase font-bold tracking-wider">Time</label>
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

             <div className="w-1/3">
                <label className="block text-xs text-zinc-400 mb-1 ml-1 uppercase font-bold tracking-wider">
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
          className="w-full bg-white/5 border border-white/20 rounded-lg p-3 text-white placeholder-zinc-700 focus:outline-none focus:border-red-500"
        />
        <div className="pt-4">
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
          className="w-full bg-white/5 border border-white/20 rounded-lg p-3 text-white placeholder-zinc-700 focus:outline-none focus:border-red-500 resize-none"
        />
        <div className="pt-4">
           <Button onClick={runAnalysis} isLoading={isAnalyzing}>
             {COPY.final_key.cta}
           </Button>
        </div>
      </InputCard>
    );
  };

  const renderAnalyzing = () => (
    <div className="flex flex-col items-center justify-center text-center animate-pulse py-12">
       <Loader2 className="w-16 h-16 text-red-500 animate-spin mb-8" />
       <h2 className="text-3xl font-heading font-black text-white mb-4 uppercase italic">Accessing Source Code</h2>
       <p className="text-sm text-zinc-500 tracking-widest uppercase font-black">Decrypting future trajectory (2026+)</p>
    </div>
  );

  const getStepContent = () => {
    if (step === 0) return renderModeSelect();
    
    if (formData.mode === 'LOVE') {
      if (step === 1) return renderPersonForm('user');
      if (step === 2) return renderPersonForm('partner');
      if (step === 3) return renderContext();
      if (step === 4) return renderFinalKey();
      if (step === 5) return renderAnalyzing();
      if (step === 6 && result) return <ResultView data={result} />;
    } else {
      if (step === 1) return renderPersonForm('user');
      if (step === 2) return renderContext();
      if (step === 3) return renderFinalKey();
      if (step === 4) return renderAnalyzing();
      if (step === 5 && result) return <ResultView data={result} />;
    }
    return null;
  };

  return (
    <PayPalScriptProvider options={{ 
      clientId: PAYPAL_CLIENT_ID,
      currency: "USD",
      intent: "capture",
      components: "buttons"
    }}>
      <Layout 
        onBack={prevStep} 
        showBack={step > 0 && !result && !isAnalyzing} 
        step={step} 
        totalSteps={totalSteps}
      >
        {getStepContent()}
      </Layout>
    </PayPalScriptProvider>
  );
};

export default App;
