import React, { useState } from "react";
import { FenceConfig } from "../types";

interface Props {
    config: FenceConfig;
    materials: { panels: number; posts: number; fixings: number; gates: number };
    specialRequests: string;
    onBack: () => void;
}

export default function QuoteForm({ config, materials, specialRequests, onBack }: Props) {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        city: "",
    });

    const [isSubmitted, setIsSubmitted] = useState(false);

    const validateForm = () => {
        // Simple Email Regex
        const emailRegex = /\S+@\S+\.\S+/;
        if (!emailRegex.test(formData.email)) {
            alert("Please enter a valid email address.");
            return false;
        }

        // Phone Validation (must be at least 8 digits)
        const phoneDigits = formData.phone.replace(/\D/g, "");
        if (phoneDigits.length < 8) {
            alert("Please enter a valid phone number (minimum 8 digits).");
            return false;
        }

        return true;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        const subject = `Fence Quote Request: ${formData.firstName} ${formData.lastName}`;

        // ✅ BEAUTIFIED EMAIL FORMATTING
        const body = `
=========================================
      NEW FENCE QUOTE REQUEST
=========================================

CUSTOMER DETAILS
-----------------------------------------
Name: ${formData.firstName} ${formData.lastName}
Email: ${formData.email}
Phone: ${formData.phone}
City/Suburb: ${formData.city}

PROJECT SPECIFICATIONS
-----------------------------------------
Shape:      ${config.shape}
Dimensions: ${config.width}m (W) x ${config.depth}m (D)
Height:     ${config.height}mm
Color:      ${config.panelColor}

ESTIMATED MATERIAL SUMMARY
-----------------------------------------
• Fence Panels:  ${materials.panels} (${config.height}mm)
• Fence Posts:   ${materials.posts} (Steel)
• Secure Fixings: ${materials.fixings} (Anti-tamper)
• Custom Gates:  ${materials.gates}

GATE CONFIGURATION
-----------------------------------------
${config.gates.length > 0 
    ? config.gates.map(g => `• ${g.type}mm Wide @ Segment ${g.segmentIndex}`).join('\n') 
    : "No gates selected."}

SPECIAL REQUESTS / NOTES
-----------------------------------------
${specialRequests.trim() || "No special requests provided."}

=========================================
Generated via Evergreen DP 3D Configurator
=========================================
        `;

        const mailtoLink = `mailto:sales@evergreendp.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        
        window.location.href = mailtoLink;
        setIsSubmitted(true);
    };

    if (isSubmitted) {
        return (
            <div className="p-8 h-full flex flex-col items-center justify-center text-center space-y-4 bg-[#F5F5DC]">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl">✓</div>
                <h2 className="text-2xl font-bold text-slate-800">Email Generated!</h2>
                <p className="text-slate-600 text-sm leading-relaxed">
                    Your email app should have opened. Please click <strong>"Send"</strong> in your Gmail/Mail app to finish the request.
                </p>
                <button onClick={onBack} className="mt-6 px-8 py-3 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-all">
                    Return to Design
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-[#F5F5DC]">
            <div className="p-6 border-b border-slate-200 bg-white/50">
                <button onClick={onBack} className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-2">
                    ← Back to Summary
                </button>
                <h2 className="text-xl font-bold text-slate-800">Contact Details</h2>
                <p className="text-sm text-slate-500">Provide your info to receive a professional quote.</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">First Name</label>
                        <input required type="text" className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-green-500 outline-none" 
                            value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Last Name</label>
                        <input required type="text" className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-green-500 outline-none" 
                            value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Email Address</label>
                    <input required type="email" className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-green-500 outline-none" 
                        placeholder="email@example.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Phone Number</label>
                    <input required type="tel" className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-green-500 outline-none" 
                        placeholder="0400 000 000" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">City / Town</label>
                    <input required type="text" className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-green-500 outline-none" 
                        value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} />
                </div>

                <div className="pt-4 sticky bottom-0 bg-[#F5F5DC]">
                    <button type="submit" className="w-full py-4 bg-green-600 text-white font-black rounded-xl shadow-lg hover:bg-green-700 active:scale-95 transition-all flex items-center justify-center gap-3">
                        <span className="text-xl">📧</span>
                        SEND EMAIL QUOTE REQUEST
                    </button>
                    <p className="text-[9px] text-center text-slate-400 mt-2 italic">
                        Clicking will open your default email application.
                    </p>
                </div>
            </form>
        </div>
    );
}