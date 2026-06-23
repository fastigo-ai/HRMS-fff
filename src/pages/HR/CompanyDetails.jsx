import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Save, Loader2, Landmark } from 'lucide-react';
import PageHeader from '../../shared/components/PageHeader';
import { DatabaseService } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

export default function CompanyDetails({ triggerToast }) {
  const { userRole } = useAuthStore();
  const isHR = userRole === 'hr_admin';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [company, setCompany] = useState({
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    radius: 200,
    saturdayRule: '5-day'
  });

  useEffect(() => {
    fetchDetails();
  }, []);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const data = await DatabaseService.getCompanyDetails();
      if (data) {
        setCompany({
          name: data.name || '',
          address: data.address || '',
          latitude: data.latitude !== undefined ? data.latitude : '',
          longitude: data.longitude !== undefined ? data.longitude : '',
          radius: data.radius || 200,
          saturdayRule: data.saturdayRule || '5-day'
        });
      }
    } catch (err) {
      triggerToast('Failed to load corporate location configurations.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGetCurrentLocation = () => {
    if (!isHR) return;
    if (!navigator.geolocation) {
      triggerToast('Geolocation is not supported by your browser!', 'error');
      return;
    }

    triggerToast('Retrieving current GPS coordinates...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCompany(prev => ({
          ...prev,
          latitude: parseFloat(position.coords.latitude.toFixed(6)),
          longitude: parseFloat(position.coords.longitude.toFixed(6))
        }));
        triggerToast('GPS coordinates captured successfully!');
      },
      (error) => {
        triggerToast(`Geolocation error: ${error.message}`, 'error');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!isHR) return;
    if (!company.name || !company.address || company.latitude === '' || company.longitude === '') {
      triggerToast('All fields are required!', 'warning');
      return;
    }

    setSaving(true);
    try {
      await DatabaseService.updateCompanyDetails({
        name: company.name,
        address: company.address,
        latitude: Number(company.latitude),
        longitude: Number(company.longitude),
        radius: Number(company.radius),
        saturdayRule: company.saturdayRule
      });
      triggerToast('Corporate geofence configurations saved successfully!');
    } catch (err) {
      triggerToast(err.message || 'Failed to save location details', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Syncing Geofence Matrix...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Office Geofence Configurations" 
        description="Configure your corporate headquarters location and set the allowed geographical radius for employee check-ins."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Form Card */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-850 p-6 rounded-3xl shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-900">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 rounded-xl">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-805 dark:text-white uppercase tracking-wider">Office Perimeter Settings</h3>
              <p className="text-[10px] text-slate-400">Configure corporate geofencing details</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <div>
              <label className="block mb-1.5 font-bold uppercase tracking-wider text-[10px] text-slate-400">Company Name</label>
              <input 
                type="text" 
                value={company.name}
                disabled={!isHR}
                onChange={(e) => setCompany({ ...company, name: e.target.value })}
                placeholder="e.g. Fastigo X Technologies Inc."
                className="w-full px-4.5 py-3 bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-2xl focus:outline-hidden focus:border-indigo-500 transition text-slate-900 dark:text-white disabled:opacity-75 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block mb-1.5 font-bold uppercase tracking-wider text-[10px] text-slate-400">Office Physical Address</label>
              <textarea 
                value={company.address}
                disabled={!isHR}
                onChange={(e) => setCompany({ ...company, address: e.target.value })}
                placeholder="e.g. 882 Park Boulevard, Suite 100, San Francisco, California 94103"
                rows={3}
                className="w-full px-4.5 py-3 bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-2xl focus:outline-hidden focus:border-indigo-500 transition text-slate-900 dark:text-white leading-relaxed resize-none disabled:opacity-75 disabled:cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1.5 font-bold uppercase tracking-wider text-[10px] text-slate-400">Latitude Coordinate</label>
                <input 
                  type="number" 
                  step="any"
                  value={company.latitude}
                  disabled={!isHR}
                  onChange={(e) => setCompany({ ...company, latitude: e.target.value })}
                  placeholder="e.g. 37.7749"
                  className="w-full px-4.5 py-3 bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-2xl focus:outline-hidden focus:border-indigo-500 transition text-slate-900 dark:text-white font-mono disabled:opacity-75 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block mb-1.5 font-bold uppercase tracking-wider text-[10px] text-slate-400">Longitude Coordinate</label>
                <input 
                  type="number" 
                  step="any"
                  value={company.longitude}
                  disabled={!isHR}
                  onChange={(e) => setCompany({ ...company, longitude: e.target.value })}
                  placeholder="e.g. -122.4194"
                  className="w-full px-4.5 py-3 bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-2xl focus:outline-hidden focus:border-indigo-500 transition text-slate-900 dark:text-white font-mono disabled:opacity-75 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block mb-1.5 font-bold uppercase tracking-wider text-[10px] text-slate-400">Working Schedule / Saturdays</label>
                {isHR ? (
                  <select 
                    value={company.saturdayRule || '5-day'}
                    onChange={(e) => setCompany({ ...company, saturdayRule: e.target.value })}
                    className="w-full px-4.5 py-3 bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-2xl focus:outline-hidden focus:border-indigo-500 transition text-slate-900 dark:text-white cursor-pointer font-bold"
                  >
                    <option value="5-day">5-Day Week (Saturdays & Sundays Off)</option>
                    <option value="6-day">6-Day Week (All Saturdays Working)</option>
                    <option value="2nd-4th-off">Alternate Off (2nd & 4th Saturdays Off)</option>
                  </select>
                ) : (
                  <div className="w-full px-4.5 py-3 bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white font-bold">
                    {company.saturdayRule === '5-day' && '5-Day Week (Saturdays & Sundays Off)'}
                    {company.saturdayRule === '6-day' && '6-Day Week (All Saturdays Working)'}
                    {company.saturdayRule === '2nd-4th-off' && 'Alternate Off (2nd & 4th Saturdays Off)'}
                  </div>
                )}
              </div>

              <div>
                <label className="block mb-1.5 font-bold uppercase tracking-wider text-[10px] text-slate-400">Allowed Punch-in Radius</label>
                <select 
                  value={company.radius}
                  disabled={!isHR}
                  onChange={(e) => setCompany({ ...company, radius: Number(e.target.value) })}
                  className="w-full px-4.5 py-3 bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-2xl focus:outline-hidden focus:border-indigo-500 transition text-slate-900 dark:text-white cursor-pointer font-bold disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  <option value={50}>50 Meters (Strict Office Room)</option>
                  <option value={100}>100 Meters (Office Building)</option>
                  <option value={200}>200 Meters (Campus/Tech Park)</option>
                  <option value={500}>500 Meters (Neighborhood Area)</option>
                  <option value={1000}>1000 Meters (1 Kilometre)</option>
                </select>
              </div>
            </div>

            {isHR && (
              <div className="pt-2">
                <button 
                  type="button"
                  onClick={handleGetCurrentLocation}
                  className="w-full py-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-850 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-800 font-bold rounded-2xl transition flex items-center justify-center gap-2"
                >
                  <Navigation className="w-4 h-4 text-indigo-500 animate-pulse" />
                  Capture My Location Coordinates
                </button>
              </div>
            )}

            {isHR && (
              <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-900">
                <button 
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold rounded-2xl transition flex items-center justify-center gap-2 shadow-sm"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving details...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Configurations
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Informational Card */}
        <div className="bg-indigo-600 text-white p-6 rounded-3xl shadow-lg shadow-indigo-600/10 flex flex-col justify-between space-y-6 h-fit">
          <div className="space-y-4">
            <div className="p-3 bg-indigo-500/50 rounded-2xl w-fit">
              <MapPin className="w-6 h-6 text-indigo-200" />
            </div>
            <h3 className="text-base font-extrabold">Geofenced Attendance Rules</h3>
            <p className="text-[11px] text-indigo-150 leading-relaxed">
              When an employee checks in using <strong>"Office"</strong> mode, their current browser location is compared against the office coordinates defined on this page.
            </p>
            <p className="text-[11px] text-indigo-150 leading-relaxed">
              If they are further than the allowed radius, their clock-in is rejected by the server. <strong>"WFH"</strong> mode bypasses this check.
            </p>
          </div>

          <div className="p-4 bg-indigo-700/60 rounded-2xl border border-indigo-500/20 text-[10px] leading-relaxed text-indigo-200">
            <strong>Coordinate Tips:</strong> You can click the "Capture My Location" button while sitting in the office to pre-populate your precise office geofencing coordinates automatically.
          </div>
        </div>
      </div>
    </div>
  );
}

