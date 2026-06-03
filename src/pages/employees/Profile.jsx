import React, { useState } from 'react';
import {
  User,
  Briefcase,
  ShieldCheck,
  Award,
  Download,
  CreditCard,
  CheckCircle2,
  FileText
} from 'lucide-react';

export default function Profile({
  profileData,
  setProfileData,
  handleDocumentDownload,
  downloadingDocument
}) {
  const [activeSubTab, setActiveSubTab] = useState('personal'); // personal | employment | bank | docs
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ ...profileData });

  const handleSave = (e) => {
    e.preventDefault();
    setProfileData(formData);
    setEditing(false);
  };

  const handleInputChange = (field, val) => {
    setFormData({
      ...formData,
      [field]: val
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Top Profile Core Info */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6">
        <div className="relative shrink-0">
          <img 
            src={profileData?.avatar || (profileData?.gender === 'female' 
              ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256&h=256'
              : 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256&h=256')} 
            alt="Profile Avatar" 
            className="w-24 h-24 rounded-2xl object-cover ring-4 ring-indigo-500/10 shadow-md"
          />
          <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1 rounded-lg shadow ring-2 ring-white dark:ring-slate-950">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-1">{profileData.name}</h2>
          <p className="text-sm font-semibold text-indigo-500 mb-2">{profileData.position} • {profileData.department}</p>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-lg">
              EMP-ID: {profileData.empId}
            </span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-lg">
              Status: Permanent
            </span>
          </div>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-slate-100 dark:border-slate-900 gap-6">
        {[
          { id: 'personal', label: 'Personal Details', icon: User },
          { id: 'employment', label: 'Professional Specs', icon: Briefcase },
          { id: 'bank', label: 'Bank & Tax', icon: CreditCard },
          { id: 'docs', label: 'Documents Vault', icon: FileText }
        ].map(tab => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 pb-3 text-sm font-bold border-b-2 transition-all ${
                activeSubTab === tab.id 
                  ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400' 
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <TabIcon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab contents */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm">
        
        {activeSubTab === 'personal' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Personal Information</h3>
              <button 
                onClick={() => { setEditing(!editing); if(!editing) setFormData({ ...profileData }); }}
                className="px-4 py-2 text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 dark:hover:bg-indigo-950/80 rounded-xl transition"
              >
                {editing ? 'Cancel' : 'Edit Specs'}
              </button>
            </div>
            {editing ? (
              <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Full Name</label>
                  <input 
                    type="text" 
                    value={formData.name} 
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Primary Email</label>
                  <input 
                    type="email" 
                    value={formData.email} 
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Phone Number</label>
                  <input 
                    type="text" 
                    value={formData.phone} 
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Residential Address</label>
                  <input 
                    type="text" 
                    value={formData.address} 
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <button type="submit" className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition">
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-900">
                  <span className="text-xs text-slate-400 font-semibold block mb-1">Full Legal Name</span>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{profileData.name}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-900">
                  <span className="text-xs text-slate-400 font-semibold block mb-1">Email Coordinates</span>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{profileData.email}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-900">
                  <span className="text-xs text-slate-400 font-semibold block mb-1">Phone Link</span>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{profileData.phone}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-900">
                  <span className="text-xs text-slate-400 font-semibold block mb-1">Residential Residence</span>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{profileData.address}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeSubTab === 'employment' && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Employment Specifications</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-900">
                <span className="text-xs text-slate-400 font-semibold block mb-1">Role Designation</span>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{profileData.position}</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-900">
                <span className="text-xs text-slate-400 font-semibold block mb-1">Department Module</span>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{profileData.department}</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-900">
                <span className="text-xs text-slate-400 font-semibold block mb-1">Joining Timestamp</span>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{profileData.joinDate}</p>
              </div>
            </div>

            {/* Certifications and Skills block */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-900">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <Award className="w-4.5 h-4.5 text-indigo-500" /> Skills & Active Endorsements
              </h4>
              <div className="flex flex-wrap gap-2">
                {profileData.skills.map((skill, index) => (
                  <span key={index} className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1.5 rounded-xl border border-indigo-100 dark:border-indigo-950">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'bank' && (
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-6">Financial Broker Specifications</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-900">
                <span className="text-xs text-slate-400 font-semibold block mb-1">Clearing Bank Broker</span>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{profileData.bankDetails.bankName}</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-900">
                <span className="text-xs text-slate-400 font-semibold block mb-1">Account Identifier</span>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{profileData.bankDetails.accountNo}</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-900">
                <span className="text-xs text-slate-400 font-semibold block mb-1">Tax System Identifier (PAN/SSN)</span>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{profileData.bankDetails.panNumber}</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-900">
                <span className="text-xs text-slate-400 font-semibold block mb-1">Routing Clearing ID</span>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{profileData.bankDetails.ifscCode}</p>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'docs' && (
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-6">Employment Documents Vault</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { name: 'Employment_Agreement.pdf', size: '2.4 MB' },
                { name: 'Tax_W4_Form_Signed.pdf', size: '840 KB' },
                { name: 'Degree_Certification.pdf', size: '1.2 MB' },
                { name: 'Identity_Verification_Card.pdf', size: '950 KB' },
              ].map((doc, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-900 rounded-xl hover:border-slate-200 dark:hover:border-slate-800 transition">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 rounded-lg">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[180px]">{doc.name}</h4>
                      <span className="text-[10px] text-slate-400">{doc.size}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDocumentDownload(doc.name)}
                    disabled={downloadingDocument !== null}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition"
                  >
                    {downloadingDocument === doc.name ? (
                      <span className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin block"></span>
                    ) : (
                      <Download className="w-4.5 h-4.5" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
