import React, { useState } from 'react';
import { SajuResponse } from '../types';
import { Lock, Unlock, Share2, Sparkles, AlertTriangle } from 'lucide-react';
import { Button } from './Button';
import { PayPalButtons } from "@paypal/react-paypal-js";

interface ResultViewProps {
  data: SajuResponse;
}

export const ResultView: React.FC<ResultViewProps> = ({ data }) => {
  const [isUnlocked, setIsUnlocked] = useState(false);

  // --- LOVE RENDERER ---
  const renderLove = () => {
    const res = data.love_result!;
    return (
      <div className="space-y-6 animate-fade-in">
        {/* FREE: Score & Badge */}
        <div className="text-center mb-8 relative">
          <div className="inline-block px-4 py-1.5 bg-red-600 text-white text-[10px] font-heading font-black uppercase tracking-widest rounded-none mb-4 transform -skew-x-12">
            {res.badge}
          </div>
          <div className="relative inline-block">
             <div className="text-8xl font-heading font-black text-white italic tracking-tighter drop-shadow-[0_0_20px_rgba(220,38,38,0.5)]">
              {res.total_score}
             </div>
             <div className="text-[10px] text-zinc-500 mt-2 uppercase font-bold tracking-[0.4em] border-t border-zinc-800 pt-2">Compatibility</div>
          </div>
          <p className="mt-6 text-zinc-200 text-lg font-medium leading-relaxed px-2 border-l-2 border-red-600 pl-4 italic">
            "{res.summary}"
          </p>
        </div>

        {/* FREE: Instinctive Attraction */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-6 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-3 text-red-500 text-[10px] font-bold uppercase tracking-widest">
            <Sparkles className="w-3 h-3" />
            {res.partner_instinctive_attraction.title}
          </div>
          <p className="text-2xl font-heading font-bold text-white mb-3 leading-tight uppercase">
            "{res.partner_instinctive_attraction.quote}"
          </p>
          <p className="text-sm text-zinc-500">
            {res.partner_instinctive_attraction.why}
          </p>
        </div>

        {/* FREE: Mini Scores */}
        <div className="grid grid-cols-2 gap-2">
            {res.score_breakdown.map((item, idx) => (
                <div key={idx} className="bg-black/40 p-3 rounded-lg border border-white/5">
                    <div className="text-[10px] text-zinc-500 mb-2 font-bold uppercase tracking-wider">{item.label}</div>
                    <div className="flex items-end justify-between">
                        <div className="h-1.5 w-full bg-zinc-800 rounded-none overflow-hidden mr-3">
                            <div className={`h-full bg-white`} style={{width: `${item.score}%`}}></div>
                        </div>
                        <span className="text-xs font-bold text-red-500 font-heading">{item.tier}</span>
                    </div>
                </div>
            ))}
        </div>

        {/* LOCKED CONTENT */}
        <div className="space-y-4 pt-4">
          {res.locked_sections.map((section) => (
            <div key={section.id} className={`relative overflow-hidden rounded-xl border ${isUnlocked ? 'bg-red-900/10 border-red-500/30' : 'bg-zinc-900 border-zinc-800'}`}>
              <div className="p-6">
                <h3 className="text-white font-heading font-bold uppercase text-xs tracking-widest mb-2 flex items-center gap-2">
                  {section.title}
                  {!isUnlocked && <Lock className="w-3 h-3 text-zinc-500" />}
                </h3>
                
                {isUnlocked ? (
                   <p className="text-base text-zinc-300 mt-2 leading-relaxed animate-fade-in font-medium">
                     {section.content}
                   </p>
                ) : (
                  <>
                    <p className="text-sm text-zinc-600 italic mb-4">"{section.preview_quote}..."</p>
                    <div className="h-12 w-full bg-zinc-800/50 rounded-lg blur-sm opacity-50"></div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // --- MONEY RENDERER ---
  const renderMoney = () => {
    const res = data.money_result!;
    return (
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-heading font-black text-white mb-2 uppercase italic">{res.risk_map_title}</h2>
          <p className="text-sm text-zinc-400 px-4">{res.free_insight}</p>
        </div>

        {/* FREE: Timeline */}
        <div className="space-y-4">
          {res.free_timeline.map((event, idx) => (
            <div key={idx} className="bg-zinc-900/90 border-l-4 border-l-red-600 border-y border-r border-y-zinc-800 border-r-zinc-800 rounded-r-xl p-5 relative overflow-hidden group">
              <div className="flex justify-between items-start mb-2 pl-1">
                <span className="text-[10px] font-heading font-black text-red-500 uppercase tracking-[0.2em]">{event.window}</span>
              </div>
              <div className="text-white font-heading font-bold text-xl mb-4 pl-1 leading-tight">{event.theme}</div>
              <div className="grid grid-cols-2 gap-4 text-xs border-t border-zinc-800 pt-4 pl-1">
                <div>
                   <span className="text-white font-black block mb-1 uppercase text-[10px] tracking-wider">DO THIS</span>
                   <span className="text-zinc-400 leading-snug">{event.best_action}</span>
                </div>
                <div>
                   <span className="text-zinc-500 font-black block mb-1 uppercase text-[10px] tracking-wider">AVOID THIS</span>
                   <span className="text-zinc-500 leading-snug">{event.avoid}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* LOCKED: Strategy */}
        <div className={`relative rounded-xl p-1 ${isUnlocked ? '' : 'bg-zinc-900/30'}`}>
            {!isUnlocked && (
                 <div className="p-6 border border-zinc-800 rounded-xl bg-zinc-900">
                    <div className="flex items-center gap-3 mb-4">
                        <Lock className="w-4 h-4 text-zinc-500" />
                        <span className="text-white font-heading font-bold text-xs tracking-widest uppercase">Your Strategy Protocol</span>
                    </div>
                    <div className="space-y-4 blur-sm select-none opacity-20">
                         <div className="h-4 bg-zinc-600 rounded w-3/4"></div>
                         <div className="h-4 bg-zinc-600 rounded w-1/2"></div>
                         <div className="h-4 bg-zinc-600 rounded w-5/6"></div>
                    </div>
                 </div>
            )}

            {isUnlocked && (
                 <div className="space-y-4 animate-fade-in">
                     <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-6">
                        <h4 className="text-emerald-500 text-[10px] font-heading font-black uppercase mb-2">Highest ROI Habit</h4>
                        <p className="text-white text-base font-medium">{res.locked.highest_roi_habit}</p>
                     </div>
                     <div className="bg-red-900/10 border border-red-500/20 rounded-xl p-6">
                        <h4 className="text-red-500 text-[10px] font-heading font-black uppercase mb-2 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" /> Danger Zones
                        </h4>
                        <ul className="list-disc list-inside text-sm text-zinc-300 space-y-2">
                            {res.locked.danger_zones.map((z, i) => <li key={i}>{z}</li>)}
                        </ul>
                     </div>
                     <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                        <h4 className="text-white text-[10px] font-heading font-black uppercase mb-3">Next Move Checklist</h4>
                        <ul className="text-sm text-zinc-300 space-y-3">
                             {res.locked.next_move_checklist.map((c, i) => (
                                 <li key={i} className="flex gap-3">
                                     <span className="text-red-600 font-bold text-lg">✓</span> <span className="pt-0.5">{c}</span>
                                 </li>
                             ))}
                        </ul>
                     </div>
                 </div>
            )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-lg pb-40">
      {/* Dynamic Header */}
      <div className="mb-12 text-center pt-6">
        <h1 className="text-4xl font-heading font-black text-white mb-3 uppercase leading-tight italic">{data.free.headline}</h1>
        <div className="inline-block px-4 py-1 border-y border-red-600">
            <p className="text-red-500 text-xs font-bold tracking-[0.2em] uppercase">{data.free.one_liner}</p>
        </div>
      </div>

      {/* Render Mode Content */}
      {data.mode === 'love' && data.love_result && renderLove()}
      {data.mode === 'money' && data.money_result && renderMoney()}

      {/* PAYWALL / UNLOCK CARD */}
      {!isUnlocked && (
        <div className="fixed bottom-0 left-0 w-full p-6 z-50 bg-gradient-to-t from-black via-black/95 to-transparent pt-12">
           <div className="max-w-md mx-auto bg-black/90 backdrop-blur-xl border border-red-600 rounded-xl p-6 shadow-[0_-10px_50px_rgba(220,38,38,0.2)]">
              <div className="flex justify-between items-end mb-6">
                  <div>
                      <div className="text-xs text-zinc-600 font-bold mb-1 line-through decoration-red-600 decoration-2">{data.paywall.price_anchor}</div>
                      <div className="text-5xl font-heading font-black text-white italic">{data.paywall.discount_price}</div>
                  </div>
                  <div className="text-right">
                       <p className="text-xs text-red-500 font-black mb-1 max-w-[160px] leading-tight uppercase animate-pulse">
                           {data.paywall.urgency}
                       </p>
                  </div>
              </div>
              
              <ul className="space-y-3 mb-6">
                  {data.paywall.bullets.map((b, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm font-medium text-zinc-300">
                          <Unlock className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                          <span className="leading-tight">{b}</span>
                      </li>
                  ))}
              </ul>

              {/* PAYPAL BUTTONS REPLACE THE OLD BUTTON */}
              <div className="w-full relative z-10 min-h-[48px]">
                <PayPalButtons
                    style={{ layout: "horizontal", color: "gold", tagline: false, height: 48 }}
                    createOrder={(data, actions) => {
                        return actions.order.create({
                            intent: "CAPTURE",
                            purchase_units: [
                                {
                                    amount: {
                                        value: "5.00", 
                                        currency_code: "USD" 
                                    },
                                    description: "K-SAJU Premium Reading"
                                },
                            ],
                        });
                    }}
                    onApprove={async (data, actions) => {
                        if (actions.order) {
                            await actions.order.capture();
                            setIsUnlocked(true); // Unlock content on success
                        }
                    }}
                    onError={(err) => {
                        console.error("PayPal Error:", err);
                        alert("Payment failed. Please try again.");
                    }}
                />
              </div>

              <p className="text-[10px] text-center text-zinc-600 mt-4 font-medium uppercase tracking-wider">{data.paywall.disclaimer}</p>
           </div>
        </div>
      )}

      {/* SHARE (Only shown if unlocked) */}
      {isUnlocked && (
          <div className="mt-12 mb-8 p-6 bg-black rounded-xl border border-zinc-800 text-center">
             <h4 className="text-white font-heading font-bold uppercase text-lg mb-2">{data.share_card.title}</h4>
             <p className="text-sm text-zinc-500 mb-6 font-medium">{data.share_card.subtitle}</p>
             <button className="flex items-center justify-center gap-3 w-full py-4 bg-white text-black hover:bg-zinc-200 rounded-none text-sm font-heading font-black uppercase tracking-widest transition-colors shadow-lg">
                <Share2 className="w-4 h-4" /> Share The Truth
             </button>
          </div>
      )}
    </div>
  );
};