import Header from "@/components/Header";
import { useState, useEffect } from "react";
import { supabase } from '@/lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

const SettingsPage = () => {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    avatar: "/lovable-uploads/7cb844ab-a7c0-4a3a-a3df-ff34e31930e1.png",
  });
  const [theme, setTheme] = useState("light");
  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwError, setPwError] = useState("");
  const [showDarkNotif, setShowDarkNotif] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user email and name from Supabase
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user?.email) {
        setProfile(p => ({ ...p, email: data.user.email }));
        setUserId(data.user.id);
        // Fetch name from profiles table
        const { data: profileData } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', data.user.id)
          .single();
        if (profileData?.name) {
          setProfile(p => ({ ...p, name: profileData.name }));
        }
      }
    };
    fetchUser();
  }, []);

  const handleSave = async () => {
    if (!userId) return;
    setLoading(true);
    setSuccess(false);
    // Update name in profiles table
    const { error } = await supabase
      .from('profiles')
      .update({ name: profile.name })
      .eq('id', userId);
    setLoading(false);
    if (!error) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    }
  };

  const handleChangePassword = async () => {
    setPwError("");
    setPwSuccess(false);
    if (!oldPassword) {
      setPwError("Please enter your old password.");
      return;
    }
    if (!password || !confirmPassword) {
      setPwError("Please enter and confirm your new password.");
      return;
    }
    if (password !== confirmPassword) {
      setPwError("Passwords do not match.");
      return;
    }
    setPwLoading(true);
    // Re-authenticate user with old password
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: profile.email,
      password: oldPassword,
    });
    if (signInError) {
      setPwLoading(false);
      setPwError("Old password is incorrect.");
      return;
    }
    // If re-auth successful, update password
    const { error } = await supabase.auth.updateUser({ password });
    setPwLoading(false);
    if (error) {
      setPwError(error.message || "Failed to change password.");
    } else {
      setPwSuccess(true);
      setOldPassword("");
      setPassword("");
      setConfirmPassword("");
      setTimeout(() => setPwSuccess(false), 2000);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteError("");
    setDeleteLoading(true);
    // 1. Re-authenticate
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: profile.email,
      password: deletePassword,
    });
    if (signInError) {
      setDeleteError("Password is incorrect.");
      setDeleteLoading(false);
      return;
    }
    // 2. Delete all user data
    const { error: rpcError } = await supabase.rpc('delete_user_and_data', { uid: userId });
    if (rpcError) {
      setDeleteError("Failed to delete user data. Please try again.");
      setDeleteLoading(false);
      return;
    }
    // 3. Delete user from auth (call backend/edge function)
    // Replace URL with your deployed edge function endpoint
    const res = await fetch('/api/delete-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    if (!res.ok) {
      setDeleteError("Failed to delete user from authentication. Please contact support.");
      setDeleteLoading(false);
      return;
    }
    // 4. Log out and redirect
    await supabase.auth.signOut();
    setDeleteLoading(false);
    navigate('/login');
  };

  return (
    <div className="relative min-h-screen bg-neutral-100">
      <div className="relative z-10 min-h-screen px-6 py-4">
        <Header activeTab="Settings" />
        <div className="w-full max-w-2xl mx-auto bg-white rounded-3xl p-8 border border-neutral-200">
          <h1 className="text-3xl font-extrabold mb-8 text-neutral-900">Settings</h1>

          {/* Profile Section */}
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-neutral-900">Profile</h2>
            <div className="flex items-center gap-6 mb-4">
              <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden border border-neutral-200">
                <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-neutral-700 mb-1">Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-base bg-white mb-2"
                  placeholder="Enter your name"
                  disabled={loading}
                />
                <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
                <input
                  type="email"
                  value={profile.email}
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-base bg-white"
                  disabled
                />
              </div>
            </div>
            {success && <div className="text-green-600 font-semibold mb-2">Profile updated!</div>}
          </section>

          {/* Account Section */}
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-neutral-900">Account</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Old Password</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={e => setOldPassword(e.target.value)}
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-base bg-white"
                  placeholder="Enter your old password"
                  disabled={pwLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">New Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-base bg-white"
                  placeholder="Enter new password"
                  disabled={pwLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-base bg-white"
                  placeholder="Confirm new password"
                  disabled={pwLoading}
                />
              </div>
              <button
                className="w-full bg-black text-white rounded-xl py-2 font-bold mt-2 hover:bg-neutral-800 transition disabled:opacity-60"
                onClick={handleChangePassword}
                disabled={pwLoading}
                type="button"
              >
                {pwLoading ? 'Changing...' : 'Change Password'}
              </button>
              {pwError && <div className="text-red-600 font-semibold mb-2">{pwError}</div>}
              {pwSuccess && <div className="text-green-600 font-semibold mb-2">Password changed!</div>}
              <button
                className="w-full bg-red-600 text-white rounded-xl py-2 font-bold mt-2 hover:bg-red-700 transition"
                onClick={() => {
                  const subject = encodeURIComponent('Request to Delete My Account');
                  const body = encodeURIComponent('Kindly delete my account.\n\nHere is my password - ');
                  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=prakharr.creatific@gmail.com&su=${subject}&body=${body}`;
                  window.open(gmailUrl, '_blank');
                }}
                type="button"
              >
                Request Delete Account
              </button>
            </div>
          </section>

          {/* Preferences Section */}
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-neutral-900">Preferences</h2>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <label className="text-base font-medium text-neutral-700">Theme:</label>
                <label className="flex cursor-pointer select-none items-center">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={theme === 'dark'}
                      onChange={() => {
                        if (theme !== 'dark') {
                          setShowDarkNotif(true);
                          setTimeout(() => setShowDarkNotif(false), 2000);
                        }
                        setTheme(theme === 'dark' ? 'light' : 'dark');
                      }}
                      className="sr-only"
                    />
                    <div
                      className={`box block h-6 w-10 rounded-full transition-colors duration-300 ${theme === 'dark' ? 'bg-black' : 'bg-gray-300'}`}
                    ></div>
                    <div
                      className={`absolute left-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-white shadow transition-transform duration-300 ${theme === 'dark' ? 'translate-x-4' : ''}`}
                    ></div>
                  </div>
                  <span className="ml-3 text-sm font-medium text-neutral-700">{theme === 'dark' ? 'Dark' : 'Light'}</span>
                </label>
                {showDarkNotif && (
                  <span className="ml-4 text-xs text-neutral-700 bg-yellow-100 px-3 py-1 rounded-xl font-semibold shadow">Working on it will be active soon</span>
                )}
              </div>
            </div>
          </section>

          <button
            className="w-full bg-black text-white rounded-xl py-3 font-bold text-lg mt-2 hover:bg-neutral-800 transition disabled:opacity-60"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage; 