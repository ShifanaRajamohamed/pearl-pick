import React from 'react';
import { ShieldCheck, Scissors, Sparkles, Lock, Truck, Award } from 'lucide-react';
import { StorefrontCategory } from './Navbar';
import { PWAInstallButton } from './PWAInstallButton';

interface FooterProps {
  onSelectCategory: (cat: StorefrontCategory) => void;
  onNavigateTab: (tab: string) => void;
  onOpenDesignerPortal: () => void;
  onOpenAdminPortal: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectCategory,
  onNavigateTab,
  onOpenDesignerPortal,
  onOpenAdminPortal,
}) => {
  return (
    <footer className="bg-white border-t border-[#ECE6DE] text-[#2D2825] mt-16">
      {/* Trust Strip */}
      <div className="border-b border-[#ECE6DE] bg-[#FAF7F2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-start gap-3">
            <Award className="w-5 h-5 text-[#8D2434] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#2D2825]">
                100% Authentic Couture
              </p>
              <p className="text-[11px] text-[#7D726A] mt-0.5">
                Handcrafted by verified Indian designers & master ateliers
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-[#8D2434] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#2D2825]">
                3-View AI Dress Studio
              </p>
              <p className="text-[11px] text-[#7D726A] mt-0.5">
                Coordinated Front, Back & Side visualization before tailoring
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-[#8D2434] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#2D2825]">
                Escrow Buyer Protection
              </p>
              <p className="text-[11px] text-[#7D726A] mt-0.5">
                Funds released to tailors only upon milestone & delivery approval
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Truck className="w-5 h-5 text-[#8D2434] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#2D2825]">
                Custom Fit Guarantee
              </p>
              <p className="text-[11px] text-[#7D726A] mt-0.5">
                14-point body measurements or standard sizing with free alterations
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        {/* Column 1: Online Shopping */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-[#2D2825] mb-4">
            Online Shopping
          </h4>
          <ul className="space-y-2.5 text-xs text-[#6E6359]">
            <li>
              <button
                type="button"
                onClick={() => onSelectCategory('women')}
                className="hover:text-[#8D2434] transition-colors cursor-pointer"
              >
                Women&apos;s Couture
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onSelectCategory('men')}
                className="hover:text-[#8D2434] transition-colors cursor-pointer"
              >
                Men&apos;s Bespoke & Ethnic
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onSelectCategory('ethnic')}
                className="hover:text-[#8D2434] transition-colors cursor-pointer"
              >
                Ethnic & Heritage Silks
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onSelectCategory('festive')}
                className="hover:text-[#8D2434] transition-colors cursor-pointer"
              >
                Festive & Bridal Edit
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onSelectCategory('collections')}
                className="hover:text-[#8D2434] transition-colors cursor-pointer"
              >
                Designer Collections
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNavigateTab('generator')}
                className="font-semibold text-[#8D2434] hover:underline cursor-pointer"
              >
                AI Dress Design Studio
              </button>
            </li>
          </ul>
        </div>

        {/* Column 2: Customer Services */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-[#2D2825] mb-4">
            Customer Policies
          </h4>
          <ul className="space-y-2.5 text-xs text-[#6E6359]">
            <li>
              <button
                type="button"
                onClick={() => onNavigateTab('orders')}
                className="hover:text-[#8D2434] transition-colors cursor-pointer"
              >
                Track Orders & Milestones
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNavigateTab('quotes')}
                className="hover:text-[#8D2434] transition-colors cursor-pointer"
              >
                Custom Quotations & Bargaining
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNavigateTab('profile')}
                className="hover:text-[#8D2434] transition-colors cursor-pointer"
              >
                14-Point Measurement Guide
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNavigateTab('tailors')}
                className="hover:text-[#8D2434] transition-colors cursor-pointer"
              >
                Verified Designer Directory
              </button>
            </li>
            <li className="pt-1 border-t border-[#ECE6DE]">
              <PWAInstallButton variant="link" />
            </li>
          </ul>
        </div>

        {/* Column 3: Partner With Us (Designer / Seller Portal) */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-[#2D2825] mb-4">
            Partner With Pearl Pick
          </h4>
          <p className="text-xs text-[#6E6359] leading-relaxed mb-3">
            Are you an independent fashion designer, boutique, or master tailor? Showcase your collections and receive custom dress orders.
          </p>
          <div className="space-y-2">
            <button
              id="footer-become-designer-link"
              type="button"
              onClick={onOpenDesignerPortal}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#FAF7F2] border border-[#E4D9D1] hover:border-[#8D2434] text-xs font-bold text-[#2D2825] hover:text-[#8D2434] transition-all cursor-pointer"
            >
              <Scissors className="w-3.5 h-3.5 text-[#8D2434]" />
              <span>Become a Designer / Sell With Us</span>
            </button>
            <div className="pt-1">
              <button
                type="button"
                onClick={onOpenDesignerPortal}
                className="text-[11px] text-[#7D726A] hover:text-[#2D2825] underline cursor-pointer"
              >
                Designer Portal Login (/designer/login)
              </button>
            </div>
          </div>
        </div>

        {/* Column 4: Brand & Governance */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-[#2D2825] mb-4">
            About Pearl Pick
          </h4>
          <p className="text-xs text-[#6E6359] leading-relaxed mb-4">
            India&apos;s premier bespoke fashion destination uniting ready-to-wear designer collections with AI-powered custom tailoring.
          </p>
          <div className="pt-2 border-t border-[#ECE6DE]">
            <button
              id="footer-admin-portal-link"
              type="button"
              onClick={onOpenAdminPortal}
              className="inline-flex items-center gap-1.5 text-[11px] text-[#7D726A] hover:text-[#2D2825] transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#7D726A]" />
              <span>Admin Governance Portal (/admin/login)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="border-t border-[#ECE6DE] py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#7D726A]">
          <span>© 2026 Pearl Pick Couture Pvt. Ltd. All rights reserved.</span>
          <span>100% Secure Payments • UPI • Cards • Escrow Protected</span>
        </div>
      </div>
    </footer>
  );
};
