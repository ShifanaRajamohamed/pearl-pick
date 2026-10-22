import React, { useState } from 'react';
import { ShieldCheck, Upload, FileText, CheckCircle2, X, AlertCircle } from 'lucide-react';
import { TailorVerificationDocument } from '../../types';

interface TailorVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitDocuments: (documents: TailorVerificationDocument[], notes: string) => void;
}

export const TailorVerificationModal: React.FC<TailorVerificationModalProps> = ({
  isOpen,
  onClose,
  onSubmitDocuments,
}) => {
  const [govIdName, setGovIdName] = useState<string>('National_ID_Elena_Vance.pdf');
  const [bizLicenseName, setBizLicenseName] = useState<string>('Paris_Haute_Couture_Trade_Reg.pdf');
  const [certName, setCertName] = useState<string>('Master_Pattern_Maker_Diploma_Chambre_Syndicale.pdf');
  const [studioPhotos, setStudioPhotos] = useState<string>('atelier_workspace_cutting_tables.jpg');
  const [experienceYears, setExperienceYears] = useState<number>(14);
  const [specialtiesText, setSpecialtiesText] = useState<string>('Bridal Gowns, French Seam Construction, Bias-Cut Silk');
  const [additionalNotes, setAdditionalNotes] = useState<string>(
    '14 years atelier master experience with full industrial steam press and 12-thread serger studio.'
  );
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const docs: TailorVerificationDocument[] = [
      {
        id: `doc-${Date.now()}-1`,
        tailorId: 'tailor-1',
        type: 'GOVERNMENT_ID',
        fileUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
        uploadedAt: new Date().toISOString(),
        verificationStatus: 'PENDING',
        notes: govIdName
      },
      {
        id: `doc-${Date.now()}-2`,
        tailorId: 'tailor-1',
        type: 'BUSINESS_LICENSE',
        fileUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=80',
        uploadedAt: new Date().toISOString(),
        verificationStatus: 'PENDING',
        notes: bizLicenseName
      },
      {
        id: `doc-${Date.now()}-3`,
        tailorId: 'tailor-1',
        type: 'TAILORING_CERTIFICATE',
        fileUrl: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=600&auto=format&fit=crop&q=80',
        uploadedAt: new Date().toISOString(),
        verificationStatus: 'PENDING',
        notes: certName
      },
      {
        id: `doc-${Date.now()}-4`,
        tailorId: 'tailor-1',
        type: 'STUDIO_PHOTO',
        fileUrl: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&auto=format&fit=crop&q=80',
        uploadedAt: new Date().toISOString(),
        verificationStatus: 'PENDING',
        notes: studioPhotos
      }
    ];

    onSubmitDocuments(docs, additionalNotes);
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#F5F2ED] rounded-[36px] sm:rounded-[44px] max-w-xl w-full border border-[#4A3728]/10 shadow-2xl p-6 sm:p-8 space-y-6 my-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-full bg-white text-[#4A3728] flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-[#4A3728]">
                Master Tailor Verification KYC
              </h2>
              <p className="text-xs text-[#8C7A6B] font-light">
                Submit artisan credentials for the Verified Atelier badge
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white border border-[#4A3728]/10 text-[#4A3728] flex items-center justify-center hover:bg-[#F5F2ED] transition-all cursor-pointer shadow-xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Document 1: Govt ID */}
          <div className="p-4 sm:p-5 rounded-[24px] bg-white border border-[#4A3728]/10 space-y-2.5 shadow-xs">
            <div className="flex items-center justify-between">
              <label className="font-bold text-[#4A3728]">1. Government ID / Passport</label>
              <span className="text-[10px] text-[#4A3728] font-bold uppercase tracking-wider flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3 text-[#4A3728]" />
                <span>Selected</span>
              </span>
            </div>
            <div className="flex items-center space-x-2 text-[#6B584C]">
              <FileText className="w-4 h-4 text-[#8C6547]" />
              <input
                type="text"
                value={govIdName}
                onChange={(e) => setGovIdName(e.target.value)}
                className="flex-1 p-2.5 rounded-xl bg-[#F5F2ED] border border-[#4A3728]/10 text-xs font-medium text-[#4A3728] focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Document 2: Business / Trade License */}
          <div className="p-4 sm:p-5 rounded-[24px] bg-white border border-[#4A3728]/10 space-y-2.5 shadow-xs">
            <div className="flex items-center justify-between">
              <label className="font-bold text-[#4A3728]">2. Atelier Business & Trade Registration</label>
              <span className="text-[10px] text-[#4A3728] font-bold uppercase tracking-wider flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3 text-[#4A3728]" />
                <span>Selected</span>
              </span>
            </div>
            <div className="flex items-center space-x-2 text-[#6B584C]">
              <FileText className="w-4 h-4 text-[#8C6547]" />
              <input
                type="text"
                value={bizLicenseName}
                onChange={(e) => setBizLicenseName(e.target.value)}
                className="flex-1 p-2.5 rounded-xl bg-[#F5F2ED] border border-[#4A3728]/10 text-xs font-medium text-[#4A3728] focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Document 3: Tailoring / Pattern Diploma */}
          <div className="p-4 sm:p-5 rounded-[24px] bg-white border border-[#4A3728]/10 space-y-2.5 shadow-xs">
            <div className="flex items-center justify-between">
              <label className="font-bold text-[#4A3728]">3. Master Tailor / Couture Certificate</label>
              <span className="text-[10px] text-[#4A3728] font-bold uppercase tracking-wider flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3 text-[#4A3728]" />
                <span>Selected</span>
              </span>
            </div>
            <div className="flex items-center space-x-2 text-[#6B584C]">
              <FileText className="w-4 h-4 text-[#8C6547]" />
              <input
                type="text"
                value={certName}
                onChange={(e) => setCertName(e.target.value)}
                className="flex-1 p-2.5 rounded-xl bg-[#F5F2ED] border border-[#4A3728]/10 text-xs font-medium text-[#4A3728] focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Document 4: Studio Workshop Photos */}
          <div className="p-4 sm:p-5 rounded-[24px] bg-white border border-[#4A3728]/10 space-y-2.5 shadow-xs">
            <div className="flex items-center justify-between">
              <label className="font-bold text-[#4A3728]">4. Atelier Studio & Equipment Photo Proof</label>
              <span className="text-[10px] text-[#4A3728] font-bold uppercase tracking-wider flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3 text-[#4A3728]" />
                <span>Selected</span>
              </span>
            </div>
            <div className="flex items-center space-x-2 text-[#6B584C]">
              <Upload className="w-4 h-4 text-[#8C6547]" />
              <input
                type="text"
                value={studioPhotos}
                onChange={(e) => setStudioPhotos(e.target.value)}
                className="flex-1 p-2.5 rounded-xl bg-[#F5F2ED] border border-[#4A3728]/10 text-xs font-medium text-[#4A3728] focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[9px] uppercase font-bold tracking-wider text-[#8C7A6B] block mb-1">Experience (Years)</label>
              <input
                type="number"
                value={experienceYears}
                onChange={(e) => setExperienceYears(Number(e.target.value))}
                className="w-full p-3 rounded-2xl bg-white border border-[#4A3728]/10 text-[#4A3728] font-bold focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="text-[9px] uppercase font-bold tracking-wider text-[#8C7A6B] block mb-1">Key Specialties</label>
              <input
                type="text"
                value={specialtiesText}
                onChange={(e) => setSpecialtiesText(e.target.value)}
                className="w-full p-3 rounded-2xl bg-white border border-[#4A3728]/10 text-[#4A3728] text-xs focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold tracking-wider text-[#8C7A6B] block mb-1">Atelier Equipment & Craftsmanship Statement</label>
            <textarea
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              rows={2}
              className="w-full p-3.5 rounded-2xl bg-white border border-[#4A3728]/10 text-[#4A3728] text-xs focus:outline-none focus:border-[#4A3728] resize-none font-light leading-relaxed"
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-full bg-[#4A3728] text-[#F5F2ED] font-bold text-xs uppercase tracking-widest shadow-md hover:scale-95 transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            {isSubmitted ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-[#FBD7D1]" />
                <span>KYC Application Submitted to Admin!</span>
              </>
            ) : (
              <span>Submit Verification Documents</span>
            )}
          </button>
        </form>

      </div>
    </div>
  );
};
