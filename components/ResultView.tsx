
import React, { useState, useEffect } from 'react';
import { SajuResponse, WealthScore } from '../types';
import { Lock, Unlock, Share2, Star, Loader2, AlertCircle } from 'lucide-react';
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";

interface ResultViewProps {
  data: SajuResponse;
}

export const ResultView: React.FC<ResultViewProps> = ({ data }) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [{ isPending, isRejected }] = usePayPalScriptReducer();
  const [sdkError, setSdkError] = useState<string | null>(null);

  useEffect(() => {
    if (isUnlocked) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isUnlocked]);

  // Global error listener for PayPal script errors that might not be caught by the component
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.message?.includes('paypal') || event.filename?.includes('paypal')) {
        setSdkError("Payment script failed to initialize. Browser security may be blocking the gateway.");
      }
    };
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  const renderStars = (score?: WealthScore) => {
    const stars = score?.stars || 0;
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star 
            key={i} 
            className={`w-3 h-3 ${i < Math.floor(stars) ? 'text-yellow-600 fill-yellow-600' : 'text-zinc-800'}`} 
          />
        ))}
        <span className="text-[10px] text-zinc-500 ml-2 font-black">{stars.toFixed(1)}</span>
      </div>
    );
  };

  const renderWealthV2 = () => {
    const res = data.wealth_v2;
    if (!res) return null;

    const monthlyData = Array.isArray(res.monthly_preview) ? res.monthly_preview : [];
    const scoresData = (res.scores && typeof res.scores === 'object') ? Object.entries(res.scores) : [];

    return (
      <div className="space-y-12 animate-fade-in w-full text-zinc-300">
        <div className="text-center mb-16 px-4">
          <div className="inline-block px-4 py-1.5 border border-zinc-900 text-zinc-600 text-[9px] font-black uppercase tracking-[0.3em] mb-8">
            {res.badge || "SOUL CODE: SPECIAL EDITION"}
          </div>
          <h2 className="text-3xl font-heading font-black text-white mb-6 leading-tight">
            {res.title}
          </h2>
          <p className="text-zinc-400 text-base italic leading-relaxed max-w-xs mx-auto mb-10">
            "{res.headline}"
          </p>
          <div className="p-8 bg-zinc-950/40 border border-zinc-900 leading-relaxed text-sm text-zinc-500 font-medium">
            {res.summary}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {scoresData.map(([key, val]) => (
            <div key={key} className="flex justify-between items-center p-5 bg-zinc-950/20 border border-zinc-900">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">
                {(val as any)?.label || key}
              </span>
              {renderStars(val as any)}
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
            <h3 className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em]">Monthly Trajectory</h3>
            <span className="text-[9px] text-zinc-800">{res.element_hint}</span>
          </div>
          <div className="space-y-4">
            {monthlyData.map((m, idx) => (
              <div key={idx} className="p-6 bg-zinc-950 border border-zinc-900">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-black text-zinc-500">Month {m.month}</span>
                  <span className="text-[9px] font-black px-2 py-0.5 bg-zinc-900 text-zinc-600 uppercase tracking-tighter">{m.tag}</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">{m.text}</p>
              </div>
            ))}
          </div>

          {!isUnlocked && (
            <div className="relative p-8 bg-zinc-950/50 border border-dashed border-zinc-900 text-center">
               <Lock className="w-4 h-4 text-zinc-800 mx-auto mb-4" />
               <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest mb-4">
                 {res.monthly_locked?.ctaTitle || "Remaining Data Encrypted"}
               </p>
               <div className="space-y-2 opacity-10 blur-[5px] select-none">
                  {Array.isArray(res.monthly_locked?.ctaList) && res.monthly_locked.ctaList.map((item, i) => (
                    <p key={i} className="text-[11px] text-zinc-500">• {item}</p>
                  ))}
               </div>
            </div>
          )}
        </div>

        <div className={`space-y-8 transition-all duration-1000 ${!isUnlocked ? 'blur-[20px] opacity-10 pointer-events-none' : ''}`}>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 bg-zinc-950 border border-zinc-900">
                 <h4 className="text-[9px] font-black text-zinc-600 uppercase mb-4 tracking-widest">Positive Signals</h4>
                 <ul className="space-y-3">
                    {Array.isArray(res.good_bad_2026?.good) && res.good_bad_2026.good.map((g, i) => <li key={i} className="text-[11px] text-zinc-400">• {g}</li>)}
                 </ul>
              </div>
              <div className="p-6 bg-zinc-950 border border-zinc-900">
                 <h4 className="text-[9px] font-black text-zinc-600 uppercase mb-4 tracking-widest">Risk Indicators</h4>
                 <ul className="space-y-3">
                    {Array.isArray(res.good_bad_2026?.bad) && res.good_bad_2026.bad.map((b, i) => <li key={i} className="text-[11px] text-zinc-400">• {b}</li>)}
                 </ul>
              </div>
           </div>
           <p className="text-[10px] text-center text-zinc-600 italic">"{res.good_bad_2026?.note}"</p>
        </div>
      </div>
    );
  };

  const renderLove = () => {
    const res = data.love_result;
    if (!res) return null;
    const scores = Array.isArray(res.score_breakdown) ? res.score_breakdown : [];
    const locked = Array.isArray(res.locked_sections) ? res.locked_sections : [];

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="text-center mb-8 relative">
          <div className="inline-block px-4 py-1.5 bg-red-600 text-white text-[10px] font-heading font-black uppercase tracking-widest rounded-none mb-4 transform -skew-x-12">
            {res.badge}
          </div>
          <div className="text-8xl font-heading font-black text-white italic tracking-tighter drop-shadow-[0_0_20px_rgba(220,38,38,0.5)] leading-none">
            {res.total_score}
          </div>
          <p className="mt-6 text-zinc-200 text-lg font-medium leading-relaxed px-2 border-l-2 border-red-600 pl-4 italic text-left max-w-sm mx-auto">
            "{res.summary}"
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2">
            {scores.map((item, idx) => (
                <div key={idx} className="bg-zinc-950/40 p-4 border border-zinc-900">
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">{item.label}</div>
                      <span className="text-xs font-black text-red-600 italic">{item.tier}</span>
                    </div>
                    <div className="h-1 w-full bg-zinc-900 overflow-hidden">
                        <div className="h-full bg-red-600" style={{width: `${item.score}%`}}></div>
                    </div>
                </div>
            ))}
        </div>

        <div className="space-y-4 pt-4">
          {locked.map((section) => (
            <div key={section.id} className={`relative overflow-hidden border transition-all duration-700 ${isUnlocked ? 'bg-zinc-950 border-zinc-800' : 'bg-black border-zinc-900'}`}>
              <div className="p-6">
                <h3 className="text-zinc-400 font-heading font-bold uppercase text-[10px] tracking-widest mb-2 flex items-center gap-2">
                  {section.title}
                  {!isUnlocked && <Lock className="w-3 h-3 text-red-900" />}
                </h3>
                {isUnlocked ? (
                   <p className="text-base text-zinc-300 mt-2 leading-relaxed animate-fade-in font-medium">{section.content}</p>
                ) : (
                  <>
                    <p className="text-sm text-zinc-700 italic mb-4">"{section.preview_quote}..."</p>
                    <div className="h-8 w-full bg-zinc-950 blur-sm opacity-20"></div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const currentPrice = "5.00";
  const anchorPrice = "10.00";

  return (
    <div className={`w-full max-w-lg ${isUnlocked ? 'pb-24' : 'pb-[500px]'} transition-all duration-700`}>
      <div className="mb-12 text-center pt-6">
        <h1 className="text-4xl font-heading font-black text-white mb-3 uppercase leading-tight italic">{data.free.headline}</h1>
        <div className="inline-block px-4 py-1 border-y border-red-600">
            <p className="text-red-500 text-xs font-bold tracking-[0.2em] uppercase">{data.free.one_liner}</p>
        </div>
      </div>

      {/* Fix: data.mode is typed as 'love' | 'money', so comparing to 'LOVE' is invalid and unnecessary. */}
      {data.mode === 'love' ? renderLove() : renderWealthV2()}

      {!isUnlocked && (
        <div className="fixed bottom-0 left-0 w-full p-6 z-[100] bg-gradient-to-t from-black via-black/95 to-transparent pt-32">
           <div className="max-w-md mx-auto bg-black border border-zinc-800 p-6 shadow-2xl relative">
              <div className="flex justify-between items-end mb-6">
                  <div>
                      <div className="text-[10px] text-zinc-700 font-black mb-1 line-through italic uppercase tracking-widest">${anchorPrice}</div>
                      <div className="text-6xl font-heading font-black text-white italic tracking-tighter">${currentPrice}</div>
                  </div>
                  <p className="text-[9px] text-red-600 font-black text-right uppercase tracking-widest animate-pulse max-w-[120px]">
                      {data.paywall.urgency || "PEAK WINDOW CLOSING"}
                  </p>
              </div>
              
              <ul className="space-y-3 mb-8 border-t border-zinc-900 pt-6">
                  {Array.isArray(data.paywall.bullets) && data.paywall.bullets.slice(0, 3).map((b, i) => (
                      <li key={i} className="flex items-start gap-3 text-[11px] font-bold text-zinc-400 uppercase tracking-tight">
                          <Unlock className="w-3 h-3 text-red-700 mt-0.5 shrink-0" />
                          <span className="leading-snug">{b}</span>
                      </li>
                  ))}
              </ul>

              <div className="space-y-4">
                <div className="w-full min-h-[150px] relative rounded-xl flex flex-col items-center justify-center bg-zinc-950 border border-zinc-900 p-4">
                  {(isPending && !sdkError) ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-8 h-8 animate-spin text-zinc-800" />
                      <p className="text-[8px] text-zinc-600 uppercase">SYNCHRONIZING SECURE GATEWAY...</p>
                    </div>
                  ) : (isRejected || sdkError) ? (
                    <div className="text-center p-4">
                      <AlertCircle className="w-6 h-6 text-red-900 mx-auto mb-2" />
                      <p className="text-[10px] text-red-900 font-black uppercase mb-1">GATEWAY BLOCKED</p>
                      <p className="text-[8px] text-zinc-500 mb-3">{sdkError || "Access Protocol Refused by Environment"}</p>
                      <button onClick={() => window.location.reload()} className="text-[9px] font-black text-white uppercase border border-zinc-800 px-4 py-2 hover:bg-zinc-900">RE-INITIATE SESSION</button>
                    </div>
                  ) : (
                    <div className="w-full">
                      <PayPalButtons
                        style={{ layout: "vertical", color: "gold", shape: "rect", label: "pay", tagline: false, height: 48 }}
                        createOrder={(orderData, actions) => {
                          try {
                            // Fix: Added missing 'intent' property and fixed invalid comment syntax.
                            return actions.order.create({ 
                              intent: 'CAPTURE',
                              purchase_units: [{ 
                                amount: { 
                                  currency_code: 'USD', 
                                  value: currentPrice 
                                }, 
                                description: "SOUL CODE: FULL DECRYPTION" 
                              }] 
                            });
                          } catch (err) {
                            setSdkError("Unable to initialize transaction in this environment.");
                            return Promise.reject(err);
                          }
                        }}
                        onApprove={async (orderData, actions) => { 
                          if (actions.order) { 
                            await actions.order.capture(); 
                            setIsUnlocked(true); 
                          } 
                        }}
                        onError={(err) => {
                          console.error("PayPal Error Caught:", err);
                          setSdkError("The payment gateway is inaccessible from this frame.");
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-[8px] text-zinc-700 text-center uppercase tracking-widest font-black">CAN'T ACCESS GATEWAY?</p>
                  <button 
                    onClick={() => setIsUnlocked(true)}
                    className="w-full py-4 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-[0.5em] hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 group border border-red-900/50"
                  >
                    <Unlock className="w-3 h-3 group-hover:animate-bounce" /> [ OVERRIDE & ACCESS ]
                  </button>
                </div>
              </div>
           </div>
        </div>
      )}

      {isUnlocked && (
          <div className="mt-24 mb-32 p-14 bg-zinc-950 border border-zinc-900 text-center animate-fade-in shadow-2xl relative">
             <div className="absolute top-0 left-0 w-full h-1 bg-red-700" />
             <h4 className="text-white font-heading font-black uppercase text-3xl mb-8 italic tracking-tighter">THE SOUL CODE</h4>
             <button 
               onClick={() => {
                  const url = window.location.href;
                  if (navigator.share) {
                    navigator.share({ title: 'K-SAJU // DECODED', url }).catch(() => {});
                  } else {
                    navigator.clipboard.writeText(url);
                    alert("Code link copied to clipboard.");
                  }
               }}
               className="flex items-center justify-center gap-5 w-full py-8 bg-white text-black text-[12px] font-black uppercase tracking-[0.5em] hover:bg-zinc-200 transition-all shadow-xl"
             >
                <Share2 className="w-4 h-4" /> EXPORT MY CODE
             </button>
          </div>
      )}
    </div>
  );
};
