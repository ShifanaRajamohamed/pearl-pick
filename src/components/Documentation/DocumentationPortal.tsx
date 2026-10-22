import React, { useState } from 'react';
import { 
  BookOpen, 
  Database, 
  Layers, 
  Code, 
  Smartphone, 
  ShieldCheck, 
  Copy, 
  Check, 
  ExternalLink,
  Sparkles,
  Scissors
} from 'lucide-react';
import { 
  PROJECT_SRS, 
  PROJECT_SDD, 
  GRAPHQL_SCHEMA, 
  MYSQL_DDL_SCHEMA, 
  UI_SPECIFICATIONS, 
  INSTALLATION_GUIDE 
} from '../../data/documentationData';

export const DocumentationPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'srs' | 'sdd' | 'graphql' | 'mysql' | 'ui' | 'capacitor'>('srs');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      
      {/* Portal Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#FBD7D1]/50 text-[#4A3728] border border-[#FBD7D1] text-[10px] font-bold uppercase tracking-wider mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Master Technical Architecture Documentation</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-4xl font-bold text-[#4A3728]">
            PEARL PICK! Engineering Hub
          </h1>
          <p className="text-xs text-[#8C7A6B] mt-1 font-light">
            Complete SRS, SDD, GraphQL Schema, MySQL Relational DDL, UI Specifications, and Capacitor Mobile Guide.
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center space-x-2 overflow-x-auto p-1.5 rounded-full bg-white border border-[#4A3728]/10 text-xs font-semibold shadow-xs">
        <button
          onClick={() => setActiveTab('srs')}
          className={`px-4 py-2 rounded-full whitespace-nowrap transition-all text-xs font-bold uppercase tracking-wider cursor-pointer ${
            activeTab === 'srs'
              ? 'bg-[#4A3728] text-[#FBD7D1] shadow-xs'
              : 'text-[#8C7A6B] hover:text-[#4A3728]'
          }`}
        >
          1. SRS Specification
        </button>
        <button
          onClick={() => setActiveTab('sdd')}
          className={`px-4 py-2 rounded-full whitespace-nowrap transition-all text-xs font-bold uppercase tracking-wider cursor-pointer ${
            activeTab === 'sdd'
              ? 'bg-[#4A3728] text-[#FBD7D1] shadow-xs'
              : 'text-[#8C7A6B] hover:text-[#4A3728]'
          }`}
        >
          2. SDD Architecture
        </button>
        <button
          onClick={() => setActiveTab('graphql')}
          className={`px-4 py-2 rounded-full whitespace-nowrap transition-all text-xs font-bold uppercase tracking-wider cursor-pointer ${
            activeTab === 'graphql'
              ? 'bg-[#4A3728] text-[#FBD7D1] shadow-xs'
              : 'text-[#8C7A6B] hover:text-[#4A3728]'
          }`}
        >
          3. GraphQL Schema
        </button>
        <button
          onClick={() => setActiveTab('mysql')}
          className={`px-4 py-2 rounded-full whitespace-nowrap transition-all text-xs font-bold uppercase tracking-wider cursor-pointer ${
            activeTab === 'mysql'
              ? 'bg-[#4A3728] text-[#FBD7D1] shadow-xs'
              : 'text-[#8C7A6B] hover:text-[#4A3728]'
          }`}
        >
          4. MySQL DDL Database
        </button>
        <button
          onClick={() => setActiveTab('ui')}
          className={`px-4 py-2 rounded-full whitespace-nowrap transition-all text-xs font-bold uppercase tracking-wider cursor-pointer ${
            activeTab === 'ui'
              ? 'bg-[#4A3728] text-[#FBD7D1] shadow-xs'
              : 'text-[#8C7A6B] hover:text-[#4A3728]'
          }`}
        >
          5. UI Screen Architecture
        </button>
        <button
          onClick={() => setActiveTab('capacitor')}
          className={`px-4 py-2 rounded-full whitespace-nowrap transition-all text-xs font-bold uppercase tracking-wider cursor-pointer ${
            activeTab === 'capacitor'
              ? 'bg-[#4A3728] text-[#FBD7D1] shadow-xs'
              : 'text-[#8C7A6B] hover:text-[#4A3728]'
          }`}
        >
          6. Mobile Packaging
        </button>
      </div>

      {/* Tab 1: SRS */}
      {activeTab === 'srs' && (
        <div className="bg-white rounded-[32px] sm:rounded-[40px] p-6 sm:p-8 border border-[#4A3728]/10 shadow-xs space-y-6 text-xs text-[#4A3728]">
          <div className="border-b border-[#4A3728]/10 pb-4">
            <span className="text-[9px] uppercase font-bold tracking-wider text-[#8C7A6B]">Software Requirement Specification</span>
            <h2 className="font-serif text-2xl font-bold mt-1 text-[#4A3728]">{PROJECT_SRS.title}</h2>
            <p className="text-xs text-[#6B584C] mt-2 leading-relaxed font-light">{PROJECT_SRS.overview}</p>
          </div>

          <div className="space-y-4">
            <h3 className="font-serif text-base font-bold text-[#4A3728]">Core Functional Requirements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PROJECT_SRS.functionalRequirements.map((req, idx) => (
                <div key={idx} className="p-5 rounded-[24px] bg-[#F5F2ED] border border-[#4A3728]/5 space-y-2">
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white text-[#4A3728] border border-[#4A3728]/10">
                    {req.module}
                  </span>
                  <h4 className="font-bold text-sm text-[#4A3728] mt-1">{req.title}</h4>
                  <ul className="list-disc list-inside space-y-1 text-[#6B584C] text-[11px] font-light">
                    {req.features.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 border-t border-[#4A3728]/10 pt-6">
            <h3 className="font-serif text-base font-bold text-[#4A3728]">Non-Functional Quality Standards</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PROJECT_SRS.nonFunctionalRequirements.map((nfr, idx) => (
                <div key={idx} className="p-4 rounded-[20px] bg-white border border-[#4A3728]/10 shadow-xs">
                  <span className="font-bold text-[#4A3728] text-[11px] block">{nfr.category}</span>
                  <p className="text-xs text-[#594437] mt-0.5 font-light">{nfr.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: SDD Architecture */}
      {activeTab === 'sdd' && (
        <div className="bg-white rounded-[32px] sm:rounded-[40px] p-6 sm:p-8 border border-[#4A3728]/10 shadow-xs space-y-6 text-xs text-[#4A3728]">
          <div className="border-b border-[#4A3728]/10 pb-4">
            <span className="text-[9px] uppercase font-bold tracking-wider text-[#8C7A6B]">Software Design Document</span>
            <h2 className="font-serif text-2xl font-bold mt-1 text-[#4A3728]">{PROJECT_SDD.title}</h2>
          </div>

          {/* Clean Architecture Layers */}
          <div className="space-y-4">
            <h3 className="font-serif text-base font-bold text-[#4A3728]">Clean Architecture & MVVM Layering</h3>
            <div className="space-y-3">
              {PROJECT_SDD.architectureLayers.map((layer, idx) => (
                <div key={idx} className="p-5 rounded-[24px] bg-[#F5F2ED] border border-[#4A3728]/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-sm text-[#4A3728]">{layer.layer}</span>
                    <p className="text-xs text-[#6B584C] mt-0.5 font-light">{layer.responsibility}</p>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-3 py-1 rounded-full bg-white text-[#4A3728] border border-[#4A3728]/10 shrink-0">
                    {layer.technologies}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Data Flow Pipeline */}
          <div className="space-y-4 border-t border-[#4A3728]/10 pt-6">
            <h3 className="font-serif text-base font-bold text-[#4A3728]">End-to-End Escrow & Production Data Flow</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {PROJECT_SDD.dataFlowSteps.map((step, idx) => (
                <div key={idx} className="p-4 rounded-[24px] bg-white border border-[#4A3728]/10 space-y-2 shadow-xs">
                  <div className="w-7 h-7 rounded-full bg-[#4A3728] text-[#FBD7D1] flex items-center justify-center text-xs font-bold font-serif">
                    {step.step}
                  </div>
                  <h4 className="font-bold text-xs text-[#4A3728]">{step.title}</h4>
                  <p className="text-[11px] text-[#6B584C] leading-relaxed font-light">{step.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: GraphQL Schema */}
      {activeTab === 'graphql' && (
        <div className="bg-white rounded-[32px] sm:rounded-[40px] p-6 sm:p-8 border border-[#4A3728]/10 shadow-xs space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[9px] uppercase font-bold tracking-wider text-[#8C7A6B]">API Specification</span>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#4A3728]">GraphQL Schema (Types, Queries & Mutations)</h2>
            </div>
            <button
              onClick={() => handleCopy(GRAPHQL_SCHEMA, 'graphql')}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-full bg-[#F5F2ED] text-[#4A3728] border border-[#4A3728]/10 hover:bg-white font-bold uppercase tracking-wider text-[10px] cursor-pointer shadow-xs"
            >
              {copiedKey === 'graphql' ? <Check className="w-3.5 h-3.5 text-[#4A3728]" /> : <Copy className="w-3.5 h-3.5 text-[#4A3728]" />}
              <span>{copiedKey === 'graphql' ? 'Copied' : 'Copy Schema'}</span>
            </button>
          </div>

          <pre className="p-5 rounded-[24px] bg-[#4A3728] text-[#F5F2ED] font-mono text-[11px] overflow-x-auto leading-relaxed max-h-[500px] border border-[#4A3728]/20">
            {GRAPHQL_SCHEMA}
          </pre>
        </div>
      )}

      {/* Tab 4: MySQL DDL Database */}
      {activeTab === 'mysql' && (
        <div className="bg-white rounded-[32px] sm:rounded-[40px] p-6 sm:p-8 border border-[#4A3728]/10 shadow-xs space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[9px] uppercase font-bold tracking-wider text-[#8C7A6B]">Relational Database</span>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#4A3728]">MySQL 8.0 DDL Schema Script (InnoDB)</h2>
            </div>
            <button
              onClick={() => handleCopy(MYSQL_DDL_SCHEMA, 'mysql')}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-full bg-[#F5F2ED] text-[#4A3728] border border-[#4A3728]/10 hover:bg-white font-bold uppercase tracking-wider text-[10px] cursor-pointer shadow-xs"
            >
              {copiedKey === 'mysql' ? <Check className="w-3.5 h-3.5 text-[#4A3728]" /> : <Copy className="w-3.5 h-3.5 text-[#4A3728]" />}
              <span>{copiedKey === 'mysql' ? 'Copied' : 'Copy SQL Script'}</span>
            </button>
          </div>

          <pre className="p-5 rounded-[24px] bg-[#4A3728] text-[#F5F2ED] font-mono text-[11px] overflow-x-auto leading-relaxed max-h-[500px] border border-[#4A3728]/20">
            {MYSQL_DDL_SCHEMA}
          </pre>
        </div>
      )}

      {/* Tab 5: UI Screen Specs */}
      {activeTab === 'ui' && (
        <div className="bg-white rounded-[32px] sm:rounded-[40px] p-6 sm:p-8 border border-[#4A3728]/10 shadow-xs space-y-6 text-xs text-[#4A3728]">
          <div className="border-b border-[#4A3728]/10 pb-4">
            <span className="text-[9px] uppercase font-bold tracking-wider text-[#8C7A6B]">Design System & Screen Guide</span>
            <h2 className="font-serif text-2xl font-bold mt-1 text-[#4A3728]">Cross-Platform UI Specifications</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {UI_SPECIFICATIONS.map((screen, idx) => (
              <div key={idx} className="p-5 rounded-[24px] bg-[#F5F2ED] border border-[#4A3728]/5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif font-bold text-sm text-[#4A3728]">{screen.screen}</h4>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white text-[#4A3728] border border-[#4A3728]/10">
                    Screen #{idx + 1}
                  </span>
                </div>
                <p className="text-[#6B584C] text-[11px] font-light">{screen.purpose}</p>
                <div className="pt-2 border-t border-[#4A3728]/10 text-[10px] text-[#594437] font-medium space-y-1">
                  <div><strong>Key Components:</strong> {screen.components.join(' • ')}</div>
                  {screen.actions && (
                    <div className="text-[#8C7A6B]"><strong>Actions:</strong> {screen.actions.join(' • ')}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: Capacitor & Ionic Mobile Packaging */}
      {activeTab === 'capacitor' && (
        <div className="bg-white rounded-[32px] sm:rounded-[40px] p-6 sm:p-8 border border-[#4A3728]/10 shadow-xs space-y-6 text-xs text-[#4A3728]">
          <div className="border-b border-[#4A3728]/10 pb-4">
            <span className="text-[9px] uppercase font-bold tracking-wider text-[#8C7A6B]">Mobile Packaging & Build</span>
            <h2 className="font-serif text-2xl font-bold mt-1 text-[#4A3728]">Capacitor & Ionic Cross-Platform Setup</h2>
          </div>

          <div className="space-y-4">
            {INSTALLATION_GUIDE.steps.map((step, idx) => (
              <div key={idx} className="p-5 rounded-[24px] bg-[#F5F2ED] border border-[#4A3728]/5 space-y-2">
                <h4 className="font-bold text-sm text-[#4A3728]">{step.title}</h4>
                <p className="text-xs text-[#6B584C] font-light">{step.description}</p>
                {step.commands && (
                  <pre className="p-3.5 rounded-2xl bg-[#4A3728] text-[#F5F2ED] font-mono text-[11px] overflow-x-auto">
                    {step.commands.join('\n')}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
