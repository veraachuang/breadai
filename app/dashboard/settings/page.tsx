'use client';

import { useState } from 'react';

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold text-[#3a3027] mb-6">Settings</h1>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-medium text-[#3a3027] mb-4">Account Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-[#3a3027]">Push Notifications</h3>
                  <p className="text-sm text-[#3a3027] opacity-60">Receive notifications about your spending and budgets</p>
                </div>
                <button
                  onClick={() => setNotifications(!notifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications ? 'bg-[#9c6644]' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-[#3a3027]">Email Updates</h3>
                  <p className="text-sm text-[#3a3027] opacity-60">Receive weekly summaries and important updates</p>
                </div>
                <button
                  onClick={() => setEmailUpdates(!emailUpdates)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    emailUpdates ? 'bg-[#9c6644]' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      emailUpdates ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-medium text-[#3a3027] mb-4">Connected Accounts</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-[#e6dfd5] rounded-lg">
                <div>
                  <h3 className="text-sm font-medium text-[#3a3027]">Bank Account</h3>
                  <p className="text-sm text-[#3a3027] opacity-60">Manage your connected bank accounts</p>
                </div>
                <button
                  onClick={() => {}}
                  className="text-sm text-[#9c6644] hover:text-[#8b5a3b] transition-colors"
                >
                  Manage
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

