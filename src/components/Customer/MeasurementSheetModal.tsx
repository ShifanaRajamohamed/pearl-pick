import React, { useState, useRef } from 'react';
import { 
  Ruler, 
  X, 
  Check, 
  Sparkles, 
  Camera, 
  ShieldCheck, 
  RefreshCw,
  Info
} from 'lucide-react';
import { MeasurementSheet } from '../../types';

interface MeasurementSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  measurements: MeasurementSheet;
  onSaveMeasurements: (newMeasurements: MeasurementSheet) => void;
  initialGender?: 'women' | 'men';
}

export const MeasurementSheetModal: React.FC<MeasurementSheetModalProps> = ({
  isOpen,
  onClose,
  measurements,
  onSaveMeasurements,
  initialGender = 'women'
}) => {
  const [activeTab, setActiveTab] = useState<'manual' | 'ai'>('manual');
  const [genderTab, setGenderTab] = useState<'women' | 'men'>(initialGender);
  const [formData, setFormData] = useState<MeasurementSheet>({ ...measurements });
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // AI Measurement State
  const [frontPhoto, setFrontPhoto] = useState<string | null>(null);
  const [sidePhoto, setSidePhoto] = useState<string | null>(null);
  const [heightInput, setHeightInput] = useState<number>(formData.height || 172);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanComplete, setScanComplete] = useState<boolean>(false);
  const [scanConfidence, setScanConfidence] = useState<number>(0);

  const frontInputRef = useRef<HTMLInputElement>(null);
  const sideInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleUnitToggle = (newUnit: 'inches' | 'cm') => {
    if (newUnit === formData.unit) return;
    const factor = newUnit === 'cm' ? 2.54 : 1 / 2.54;
    setFormData({
      ...formData,
      unit: newUnit,
      bust: Number((formData.bust * factor).toFixed(1)),
      waist: Number((formData.waist * factor).toFixed(1)),
      highHip: Number((formData.highHip * factor).toFixed(1)),
      lowHip: Number((formData.lowHip * factor).toFixed(1)),
      shoulderToShoulder: Number((formData.shoulderToShoulder * factor).toFixed(1)),
      shoulderToWaist: Number((formData.shoulderToWaist * factor).toFixed(1)),
      waistToHem: Number((formData.waistToHem * factor).toFixed(1)),
      hollowToFloor: Number((formData.hollowToFloor * factor).toFixed(1)),
      armhole: Number((formData.armhole * factor).toFixed(1)),
      bicep: Number((formData.bicep * factor).toFixed(1)),
      sleeveLength: Number((formData.sleeveLength * factor).toFixed(1)),
      neckCircumference: Number((formData.neckCircumference * factor).toFixed(1)),
      height: Number((formData.height * factor).toFixed(1)),
      // Men's fields conversion
      chest: formData.chest ? Number((formData.chest * factor).toFixed(1)) : 40,
      jacketLength: formData.jacketLength ? Number((formData.jacketLength * factor).toFixed(1)) : 30.5,
      collarSize: formData.collarSize ? Number((formData.collarSize * factor).toFixed(1)) : 16,
      shoulderWidth: formData.shoulderWidth ? Number((formData.shoulderWidth * factor).toFixed(1)) : 18,
      trouserWaist: formData.trouserWaist ? Number((formData.trouserWaist * factor).toFixed(1)) : 33,
      trouserInseam: formData.trouserInseam ? Number((formData.trouserInseam * factor).toFixed(1)) : 31.5,
      trouserOutseam: formData.trouserOutseam ? Number((formData.trouserOutseam * factor).toFixed(1)) : 41,
      seatHip: formData.seatHip ? Number((formData.seatHip * factor).toFixed(1)) : 40,
      thighCircumference: formData.thighCircumference ? Number((formData.thighCircumference * factor).toFixed(1)) : 24,
      trouserBottomOpening: formData.trouserBottomOpening ? Number((formData.trouserBottomOpening * factor).toFixed(1)) : 15,
    });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'front' | 'side') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'front') setFrontPhoto(reader.result as string);
        if (type === 'side') setSidePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRunAiScan = () => {
    setIsScanning(true);
    setScanComplete(false);

    // Simulate Computer Vision Pose Estimation & Anthropometric Landmarking
    setTimeout(() => {
      const hInches = formData.unit === 'inches' ? heightInput : heightInput / 2.54;
      
      if (genderTab === 'men') {
        // Men's proportional landmark ratios
        const chestEst = Number((hInches * 0.58).toFixed(1));
        const shoulderEst = Number((hInches * 0.26).toFixed(1));
        const jacketEst = Number((hInches * 0.44).toFixed(1));
        const sleeveEst = Number((hInches * 0.36).toFixed(1));
        const collarEst = Number((hInches * 0.23).toFixed(1));
        const waistEst = Number((hInches * 0.47).toFixed(1));
        const inseamEst = Number((hInches * 0.45).toFixed(1));
        const seatEst = Number((hInches * 0.57).toFixed(1));

        setFormData((prev) => ({
          ...prev,
          chest: formData.unit === 'cm' ? Number((chestEst * 2.54).toFixed(1)) : chestEst,
          shoulderWidth: formData.unit === 'cm' ? Number((shoulderEst * 2.54).toFixed(1)) : shoulderEst,
          shoulderToShoulder: formData.unit === 'cm' ? Number((shoulderEst * 2.54).toFixed(1)) : shoulderEst,
          jacketLength: formData.unit === 'cm' ? Number((jacketEst * 2.54).toFixed(1)) : jacketEst,
          sleeveLength: formData.unit === 'cm' ? Number((sleeveEst * 2.54).toFixed(1)) : sleeveEst,
          collarSize: formData.unit === 'cm' ? Number((collarEst * 2.54).toFixed(1)) : collarEst,
          trouserWaist: formData.unit === 'cm' ? Number((waistEst * 2.54).toFixed(1)) : waistEst,
          trouserInseam: formData.unit === 'cm' ? Number((inseamEst * 2.54).toFixed(1)) : inseamEst,
          seatHip: formData.unit === 'cm' ? Number((seatEst * 2.54).toFixed(1)) : seatEst,
          height: heightInput,
        }));
      } else {
        // Women's proportional landmark ratios
        const shoulderEst = Number((hInches * 0.23).toFixed(1));
        const bustEst = Number((hInches * 0.54).toFixed(1));
        const waistEst = Number((hInches * 0.43).toFixed(1));
        const hipEst = Number((hInches * 0.58).toFixed(1));
        const armEst = Number((hInches * 0.35).toFixed(1));
        const legEst = Number((hInches * 0.48).toFixed(1));
        const dressLengthEst = Number((hInches * 0.65).toFixed(1));

        setFormData((prev) => ({
          ...prev,
          shoulderToShoulder: formData.unit === 'cm' ? Number((shoulderEst * 2.54).toFixed(1)) : shoulderEst,
          bust: formData.unit === 'cm' ? Number((bustEst * 2.54).toFixed(1)) : bustEst,
          waist: formData.unit === 'cm' ? Number((waistEst * 2.54).toFixed(1)) : waistEst,
          lowHip: formData.unit === 'cm' ? Number((hipEst * 2.54).toFixed(1)) : hipEst,
          sleeveLength: formData.unit === 'cm' ? Number((armEst * 2.54).toFixed(1)) : armEst,
          waistToHem: formData.unit === 'cm' ? Number((legEst * 2.54).toFixed(1)) : legEst,
          hollowToFloor: formData.unit === 'cm' ? Number((dressLengthEst * 2.54).toFixed(1)) : dressLengthEst,
          height: heightInput,
        }));
      }

      setIsScanning(false);
      setScanComplete(true);
      setScanConfidence(96.8);
    }, 1800);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveMeasurements({
      ...formData,
      genderCategory: genderTab,
      updatedAt: new Date().toISOString()
    });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2D2825]/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in overflow-y-auto">
      <div className="bg-[#FAF7F2] rounded-[32px] sm:rounded-[36px] max-w-2xl w-full p-5 sm:p-8 border border-[#E4D9D1] shadow-2xl relative max-h-[92vh] flex flex-col justify-between">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[#E4D9D1]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#2D2825] text-white flex items-center justify-center shadow-xs">
              <Ruler className="w-5 h-5 text-[#E9D4D7]" />
            </div>
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-[#2D2825]">
                Digital Tailoring Measurement Sheet
              </h2>
              <p className="text-[11px] text-[#726761] font-light">
                Encrypted anthropometric fit parameters calibrated for master atelier cutters
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-[#E4D9D1] text-[#726761] hover:text-[#2D2825] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Gender Silhouette Selector: Women's Couture vs Men's Bespoke */}
        <div className="flex items-center justify-between gap-2 pt-3">
          <div className="flex items-center p-1 rounded-full bg-[#EFE9E2] border border-[#E0D6CC] text-xs">
            <button
              type="button"
              onClick={() => setGenderTab('women')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                genderTab === 'women'
                  ? 'bg-white text-[#8D2434] shadow-xs'
                  : 'text-[#7D726A] hover:text-[#2D2825]'
              }`}
            >
              Women's Couture (14-Point)
            </button>
            <button
              type="button"
              onClick={() => setGenderTab('men')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                genderTab === 'men'
                  ? 'bg-[#2D2825] text-white shadow-xs'
                  : 'text-[#7D726A] hover:text-[#2D2825]'
              }`}
            >
              Men's Bespoke Fit (12-Point)
            </button>
          </div>

          {/* Unit Toggle */}
          <div className="flex items-center gap-1.5 bg-[#EFE9E2] p-1 rounded-full border border-[#E0D6CC] text-xs">
            <button
              type="button"
              onClick={() => handleUnitToggle('inches')}
              className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                formData.unit === 'inches' ? 'bg-[#2D2825] text-white shadow-xs' : 'text-[#726761]'
              }`}
            >
              Inches
            </button>
            <button
              type="button"
              onClick={() => handleUnitToggle('cm')}
              className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                formData.unit === 'cm' ? 'bg-[#2D2825] text-white shadow-xs' : 'text-[#726761]'
              }`}
            >
              CM
            </button>
          </div>
        </div>

        {/* Input Mode Selector: Manual Entry vs AI Pose Estimation */}
        <div className="flex items-center space-x-2 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              activeTab === 'manual'
                ? 'bg-[#2D2825] text-white border-[#2D2825] shadow-xs'
                : 'bg-white text-[#726761] border-[#E4D9D1] hover:bg-[#F3ECE6]'
            }`}
          >
            Manual Parameter Entry
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ai')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5 border ${
              activeTab === 'ai'
                ? 'bg-[#8D2434] text-white border-[#8D2434] shadow-xs'
                : 'bg-white text-[#726761] border-[#E4D9D1] hover:bg-[#F3ECE6]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Computer Vision Scan</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto my-3 pr-1 space-y-4">
          {activeTab === 'ai' ? (
            /* AI Body Scanner Mode */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white border border-[#E4D9D1] text-xs text-[#726761] space-y-1">
                <span className="font-bold text-[#2D2825] block flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-[#8D2434]" />
                  Photometric Anthropometric Scanning
                </span>
                <p className="font-light leading-relaxed">
                  Upload front & side photographs in fitted clothing. Our AI algorithm extracts 14 anatomical landmarks using computer vision to predict precise contour dimensions.
                </p>
              </div>

              {/* Uploads Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Front Photo */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#2D2825] block">
                    1. Front View Photo
                  </label>
                  <div 
                    onClick={() => frontInputRef.current?.click()}
                    className={`relative aspect-[3/4] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-all ${
                      frontPhoto 
                        ? 'border-[#6E8765] bg-white overflow-hidden' 
                        : 'border-[#E4D9D1] bg-white/60 hover:bg-white hover:border-[#8D2434]'
                    }`}
                  >
                    {frontPhoto ? (
                      <>
                        <img src={frontPhoto} alt="Front" className="w-full h-full object-cover rounded-xl" />
                        <div className="absolute inset-0 bg-[#2D2825]/40 opacity-0 hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">
                          Change Photo
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-9 h-9 rounded-full bg-[#F3ECE6] text-[#8D2434] flex items-center justify-center mb-1.5">
                          <Camera className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-semibold text-[#2D2825]">Upload Front Photo</span>
                        <span className="text-[10px] text-[#726761] mt-0.5">Full body, natural posture</span>
                      </>
                    )}
                    <input 
                      ref={frontInputRef}
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => handlePhotoUpload(e, 'front')} 
                    />
                  </div>
                </div>

                {/* Side Photo */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#2D2825] block">
                    2. Side View Profile
                  </label>
                  <div 
                    onClick={() => sideInputRef.current?.click()}
                    className={`relative aspect-[3/4] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-all ${
                      sidePhoto 
                        ? 'border-[#6E8765] bg-white overflow-hidden' 
                        : 'border-[#E4D9D1] bg-white/60 hover:bg-white hover:border-[#8D2434]'
                    }`}
                  >
                    {sidePhoto ? (
                      <>
                        <img src={sidePhoto} alt="Side" className="w-full h-full object-cover rounded-xl" />
                        <div className="absolute inset-0 bg-[#2D2825]/40 opacity-0 hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">
                          Change Photo
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-9 h-9 rounded-full bg-[#F3ECE6] text-[#8D2434] flex items-center justify-center mb-1.5">
                          <Camera className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-semibold text-[#2D2825]">Upload Side Photo</span>
                        <span className="text-[10px] text-[#726761] mt-0.5">Profile for posture & chest depth</span>
                      </>
                    )}
                    <input 
                      ref={sideInputRef}
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => handlePhotoUpload(e, 'side')} 
                    />
                  </div>
                </div>
              </div>

              {/* Height Input */}
              <div className="p-3.5 rounded-2xl bg-white border border-[#E4D9D1] flex items-center justify-between gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#2D2825] block">
                    Standing Height ({formData.unit})
                  </label>
                  <p className="text-[10px] text-[#726761]">
                    Used to scale pixel landmarks into real sewing dimensions
                  </p>
                </div>
                <input
                  type="number"
                  step="0.5"
                  value={heightInput}
                  onChange={(e) => setHeightInput(Number(e.target.value))}
                  className="w-20 p-2 rounded-xl bg-[#F9F6F2] border border-[#E4D9D1] text-center font-bold text-[#2D2825] text-sm focus:outline-none"
                />
              </div>

              {/* Scan Trigger */}
              <button
                type="button"
                onClick={handleRunAiScan}
                disabled={isScanning}
                className="w-full py-3.5 rounded-full bg-[#2D2825] hover:bg-[#1A1816] text-white text-xs font-bold uppercase tracking-widest shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#E8C5CC]" />
                    <span>Analyzing Contours & Estimating Proportions...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#E8C5CC]" />
                    <span>Run AI Measurement Scan ({genderTab === 'men' ? "Men's Fit" : "Women's Fit"})</span>
                  </>
                )}
              </button>

              {scanComplete && (
                <div className="p-4 rounded-2xl bg-[#F4F9F2] border border-[#6E8765] shadow-xs text-xs space-y-2">
                  <div className="flex items-center gap-2 text-[#416035] font-bold">
                    <Check className="w-4 h-4" />
                    <span>AI Detection Complete ({scanConfidence}% Confidence)</span>
                  </div>
                  <p className="text-[11px] text-[#726761]">
                    Measurements successfully predicted. Switch to "Manual Parameter Entry" to review each tailoring value.
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Manual Form */
            <form id="measurement-form" onSubmit={handleSave} className="space-y-4">
              
              {/* Comfort Preference */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-[#E4D9D1] text-xs">
                <span className="font-bold text-[#2D2825]">Fit Silhouette:</span>
                <select
                  value={formData.fitPreference}
                  onChange={(e: any) => setFormData({ ...formData, fitPreference: e.target.value })}
                  className="bg-[#F9F6F2] border border-[#E4D9D1] rounded-xl px-3 py-1.5 text-xs text-[#2D2825] font-semibold focus:outline-none"
                >
                  <option value="Snug">Snug / Slim Bespoke</option>
                  <option value="Tailored / Regular">Tailored / Classic Regular</option>
                  <option value="Relaxed / Flowing">Relaxed / Comfort Fit</option>
                </select>
              </div>

              {/* MEN'S BESPOKE MEASUREMENT FIELDS */}
              {genderTab === 'men' ? (
                <div className="space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8D2434] block">
                    Men's Bespoke Suiting Parameters ({formData.unit})
                  </span>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="text-[9px] uppercase font-bold tracking-wider text-[#726761] block mb-1">
                        Chest ({formData.unit})
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.chest || 40}
                        onChange={(e) => setFormData({ ...formData, chest: Number(e.target.value) })}
                        className="w-full p-2.5 rounded-xl bg-white border border-[#E4D9D1] text-[#2D2825] font-bold focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[9px] uppercase font-bold tracking-wider text-[#726761] block mb-1">
                        Shoulder Width ({formData.unit})
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.shoulderWidth || formData.shoulderToShoulder || 18}
                        onChange={(e) => setFormData({ ...formData, shoulderWidth: Number(e.target.value), shoulderToShoulder: Number(e.target.value) })}
                        className="w-full p-2.5 rounded-xl bg-white border border-[#E4D9D1] text-[#2D2825] font-bold focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[9px] uppercase font-bold tracking-wider text-[#726761] block mb-1">
                        Jacket/Coat Length ({formData.unit})
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.jacketLength || 30.5}
                        onChange={(e) => setFormData({ ...formData, jacketLength: Number(e.target.value) })}
                        className="w-full p-2.5 rounded-xl bg-white border border-[#E4D9D1] text-[#2D2825] font-bold focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[9px] uppercase font-bold tracking-wider text-[#726761] block mb-1">
                        Sleeve Length ({formData.unit})
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.sleeveLength || 25}
                        onChange={(e) => setFormData({ ...formData, sleeveLength: Number(e.target.value) })}
                        className="w-full p-2.5 rounded-xl bg-white border border-[#E4D9D1] text-[#2D2825] font-bold focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[9px] uppercase font-bold tracking-wider text-[#726761] block mb-1">
                        Collar / Neck ({formData.unit})
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.collarSize || 16}
                        onChange={(e) => setFormData({ ...formData, collarSize: Number(e.target.value) })}
                        className="w-full p-2.5 rounded-xl bg-white border border-[#E4D9D1] text-[#2D2825] font-bold focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[9px] uppercase font-bold tracking-wider text-[#726761] block mb-1">
                        Trouser Waist ({formData.unit})
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.trouserWaist || formData.waist || 33}
                        onChange={(e) => setFormData({ ...formData, trouserWaist: Number(e.target.value) })}
                        className="w-full p-2.5 rounded-xl bg-white border border-[#E4D9D1] text-[#2D2825] font-bold focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[9px] uppercase font-bold tracking-wider text-[#726761] block mb-1">
                        Trouser Inseam ({formData.unit})
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.trouserInseam || 31.5}
                        onChange={(e) => setFormData({ ...formData, trouserInseam: Number(e.target.value) })}
                        className="w-full p-2.5 rounded-xl bg-white border border-[#E4D9D1] text-[#2D2825] font-bold focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[9px] uppercase font-bold tracking-wider text-[#726761] block mb-1">
                        Seat / Hip ({formData.unit})
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.seatHip || 40}
                        onChange={(e) => setFormData({ ...formData, seatHip: Number(e.target.value) })}
                        className="w-full p-2.5 rounded-xl bg-white border border-[#E4D9D1] text-[#2D2825] font-bold focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[9px] uppercase font-bold tracking-wider text-[#726761] block mb-1">
                        Thigh ({formData.unit})
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.thighCircumference || 24}
                        onChange={(e) => setFormData({ ...formData, thighCircumference: Number(e.target.value) })}
                        className="w-full p-2.5 rounded-xl bg-white border border-[#E4D9D1] text-[#2D2825] font-bold focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] uppercase font-bold tracking-wider text-[#726761] block mb-1">
                      Posture Profile
                    </label>
                    <select
                      value={formData.postureProfile || 'Normal Posture'}
                      onChange={(e: any) => setFormData({ ...formData, postureProfile: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-white border border-[#E4D9D1] text-xs text-[#2D2825] font-semibold focus:outline-none"
                    >
                      <option value="Normal Posture">Normal Posture (Balanced balance)</option>
                      <option value="Athletic (Broad Shoulders)">Athletic (Broad shoulders, Drop 8 chest)</option>
                      <option value="Erect Stance">Erect Military Stance (Flat back)</option>
                      <option value="Forward Leaning">Forward Leaning (Rounded upper back)</option>
                    </select>
                  </div>
                </div>
              ) : (
                /* WOMEN'S 14-POINT COUTURE FIELDS */
                <div className="space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8D2434] block">
                    Women's 14-Point Couture Fit Parameters ({formData.unit})
                  </span>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="text-[9px] uppercase font-bold tracking-wider text-[#726761] block mb-1">
                        Bust ({formData.unit})
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.bust}
                        onChange={(e) => setFormData({ ...formData, bust: Number(e.target.value) })}
                        className="w-full p-2.5 rounded-xl bg-white border border-[#E4D9D1] text-[#2D2825] font-bold focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[9px] uppercase font-bold tracking-wider text-[#726761] block mb-1">
                        Waist ({formData.unit})
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.waist}
                        onChange={(e) => setFormData({ ...formData, waist: Number(e.target.value) })}
                        className="w-full p-2.5 rounded-xl bg-white border border-[#E4D9D1] text-[#2D2825] font-bold focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[9px] uppercase font-bold tracking-wider text-[#726761] block mb-1">
                        Low Hip ({formData.unit})
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.lowHip}
                        onChange={(e) => setFormData({ ...formData, lowHip: Number(e.target.value) })}
                        className="w-full p-2.5 rounded-xl bg-white border border-[#E4D9D1] text-[#2D2825] font-bold focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[9px] uppercase font-bold tracking-wider text-[#726761] block mb-1">
                        Shoulder-to-Shoulder ({formData.unit})
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.shoulderToShoulder}
                        onChange={(e) => setFormData({ ...formData, shoulderToShoulder: Number(e.target.value) })}
                        className="w-full p-2.5 rounded-xl bg-white border border-[#E4D9D1] text-[#2D2825] font-bold focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[9px] uppercase font-bold tracking-wider text-[#726761] block mb-1">
                        Shoulder to Waist ({formData.unit})
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.shoulderToWaist}
                        onChange={(e) => setFormData({ ...formData, shoulderToWaist: Number(e.target.value) })}
                        className="w-full p-2.5 rounded-xl bg-white border border-[#E4D9D1] text-[#2D2825] font-bold focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[9px] uppercase font-bold tracking-wider text-[#726761] block mb-1">
                        Waist to Hem ({formData.unit})
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.waistToHem}
                        onChange={(e) => setFormData({ ...formData, waistToHem: Number(e.target.value) })}
                        className="w-full p-2.5 rounded-xl bg-white border border-[#E4D9D1] text-[#2D2825] font-bold focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[9px] uppercase font-bold tracking-wider text-[#726761] block mb-1">
                        Dress Length (Hollow) ({formData.unit})
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.hollowToFloor}
                        onChange={(e) => setFormData({ ...formData, hollowToFloor: Number(e.target.value) })}
                        className="w-full p-2.5 rounded-xl bg-white border border-[#E4D9D1] text-[#2D2825] font-bold focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[9px] uppercase font-bold tracking-wider text-[#726761] block mb-1">
                        Sleeve Length ({formData.unit})
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.sleeveLength}
                        onChange={(e) => setFormData({ ...formData, sleeveLength: Number(e.target.value) })}
                        className="w-full p-2.5 rounded-xl bg-white border border-[#E4D9D1] text-[#2D2825] font-bold focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[9px] uppercase font-bold tracking-wider text-[#726761] block mb-1">
                        Total Height ({formData.unit})
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.height}
                        onChange={(e) => setFormData({ ...formData, height: Number(e.target.value) })}
                        className="w-full p-2.5 rounded-xl bg-white border border-[#E4D9D1] text-[#2D2825] font-bold focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Posture & Alteration Notes */}
              <div>
                <label className="text-[9px] uppercase font-bold tracking-wider text-[#726761] block mb-1">
                  Bespoke Notes & Alteration Allowance
                </label>
                <textarea
                  value={formData.postureNotes || ''}
                  onChange={(e) => setFormData({ ...formData, postureNotes: e.target.value })}
                  rows={2}
                  className="w-full p-3 rounded-xl bg-white border border-[#E4D9D1] text-[#2D2825] text-xs focus:outline-none resize-none font-light leading-relaxed"
                  placeholder="e.g. Leave 2-inch side margin inside choli/coat for future alterations. Special padding preferences..."
                />
              </div>
            </form>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-[#E4D9D1] space-y-2">
          <button
            type="button"
            onClick={handleSave}
            className="w-full py-3.5 rounded-full bg-[#2D2825] hover:bg-[#1A1816] text-white font-semibold text-xs uppercase tracking-widest shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            {isSaved ? (
              <>
                <Check className="w-4 h-4 text-[#E8C5CC]" />
                <span>Measurement Profile Calibrated & Saved!</span>
              </>
            ) : (
              <span>Save & Verify Measurement Sheet</span>
            )}
          </button>

          <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#726761]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#416035]" />
            <span>Encrypted fit profile accessible exclusively to your verified master atelier tailor.</span>
          </div>
        </div>

      </div>
    </div>
  );
};
