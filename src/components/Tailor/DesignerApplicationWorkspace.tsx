import React, { useState } from 'react';
import {
  ShieldCheck,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Building2,
  MapPin,
  Briefcase,
  FileCheck,
  RefreshCw,
  LogOut
} from 'lucide-react';
import { TailorProfile } from '../../types';

interface DesignerApplicationWorkspaceProps {
  profile: TailorProfile;
  onUpdateApplication: (
    updated: Partial<TailorProfile> & { resubmit?: boolean }
  ) => Promise<void>;
  onOpenVerificationModal: () => void;
  onLogout: () => void;
}

export const DesignerApplicationWorkspace: React.FC<DesignerApplicationWorkspaceProps> = ({
  profile,
  onUpdateApplication,
  onOpenVerificationModal,
  onLogout
}) => {
  const [shopName, setShopName] = useState(profile.shopName);
  const [city, setCity] = useState(profile.city);
  const [stateName, setStateName] = useState(profile.state || 'Maharashtra');
  const [experienceYears, setExperienceYears] = useState(profile.experienceYears);
  const [specialties, setSpecialties] = useState((profile.specialties || []).join(', '));
  const [pricingRange, setPricingRange] = useState(
    profile.pricingRange || `₹${profile.startingPrice.toLocaleString('en-IN')} – ₹75,000`
  );
  const [bio, setBio] = useState(profile.bio || '');
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const isRejected = profile.verificationStatus === 'REJECTED';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedMessage('');
    setErrorMsg('');
    try {
      await onUpdateApplication({
        shopName,
        city,
        state: stateName,
        experienceYears: Number(experienceYears) || 1,
        specialties: specialties
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        pricingRange,
        bio,
        resubmit: true
      });
      setSavedMessage(
        isRejected
          ? 'Application updated and resubmitted for Admin verification (Status: PENDING).'
          : 'Application details saved for Admin verification.'
      );
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to update application.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      {/* Status Banner */}
      <div
        className={`rounded-3xl p-6 border ${
          isRejected
            ? 'bg-red-50/70 border-red-300 text-red-950'
            : 'bg-amber-50/80 border-amber-300 text-amber-950'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                isRejected ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
              }`}
            >
              {isRejected ? <AlertTriangle className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/80 border border-current/20">
                  VERIFICATION STATUS: {profile.verificationStatus}
                </span>
              </div>
              <h1 className="font-serif text-xl sm:text-2xl font-bold mt-1.5">
                {isRejected
                  ? 'Designer Verification Requires Revision'
                  : 'Designer Application Awaiting Admin Verification'}
              </h1>
              <p className="text-xs mt-1 leading-relaxed opacity-90">
                {isRejected
                  ? 'Your designer verification was rejected or revoked by Platform Governance. Selling, product management, customer requests, quotations, and order fulfillment are locked until your revised application is approved.'
                  : 'Your designer account is registered with PENDING verification. Selling, product listings, customer requests, quotations, and order fulfillment unlock automatically once an Administrator verifies your atelier.'}
              </p>

              {isRejected && profile.rejectionReason && (
                <div className="mt-3 p-3.5 rounded-2xl bg-white border border-red-200 text-xs text-red-900">
                  <strong className="uppercase text-[10px] tracking-wider block text-red-700 mb-0.5">
                    Admin Rejection / Revocation Reason:
                  </strong>
                  <span>{profile.rejectionReason}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex sm:flex-col gap-2 shrink-0">
            <button
              type="button"
              onClick={onOpenVerificationModal}
              className="px-4 py-2.5 rounded-xl bg-[#2D2825] hover:bg-[#8D2434] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <FileCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Upload KYC Docs</span>
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-red-50 text-red-700 border border-red-200 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Application Editor & Resubmission Form */}
      <div className="bg-white rounded-3xl border border-[#E4D9D1] p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-[#E4D9D1] pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#8D2434] block">
              ATELIER APPLICATION & PROFILE
            </span>
            <h2 className="font-serif text-xl font-bold text-[#2D2825]">
              {profile.name} — {profile.shopName}
            </h2>
            <p className="text-xs text-[#7D726A]">
              Review or update your professional details below. Submitting edits when REJECTED will resubmit your application as PENDING.
            </p>
          </div>
        </div>

        {savedMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{savedMessage}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold uppercase tracking-wider text-[10px] text-[#6E6359] mb-1">
                Boutique / Atelier Name
              </label>
              <div className="relative">
                <Building2 className="w-3.5 h-3.5 text-[#7D726A] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#D6C7B8] bg-[#FAF7F2]"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-[10px] text-[#6E6359] mb-1">
                Experience (Years)
              </label>
              <div className="relative">
                <Briefcase className="w-3.5 h-3.5 text-[#7D726A] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  min={1}
                  required
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#D6C7B8] bg-[#FAF7F2]"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-[10px] text-[#6E6359] mb-1">
                City
              </label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 text-[#7D726A] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#D6C7B8] bg-[#FAF7F2]"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-[10px] text-[#6E6359] mb-1">
                State
              </label>
              <input
                type="text"
                required
                value={stateName}
                onChange={(e) => setStateName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#D6C7B8] bg-[#FAF7F2]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold uppercase tracking-wider text-[10px] text-[#6E6359] mb-1">
                Specializations (comma separated)
              </label>
              <input
                type="text"
                required
                value={specialties}
                onChange={(e) => setSpecialties(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#D6C7B8] bg-[#FAF7F2]"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-[10px] text-[#6E6359] mb-1">
                Pricing Range (INR)
              </label>
              <input
                type="text"
                required
                value={pricingRange}
                onChange={(e) => setPricingRange(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#D6C7B8] bg-[#FAF7F2]"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold uppercase tracking-wider text-[10px] text-[#6E6359] mb-1">
              Craftsmanship Bio & Atelier Statement
            </label>
            <textarea
              rows={3}
              required
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-3 rounded-xl border border-[#D6C7B8] bg-[#FAF7F2]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 rounded-xl bg-[#2D2825] hover:bg-[#8D2434] text-white font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
              <span>
                {isSaving
                  ? 'Saving...'
                  : isRejected
                  ? 'Update & Resubmit Application for Review'
                  : 'Save Application Details'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
