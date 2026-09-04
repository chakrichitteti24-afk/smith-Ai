import React from 'react';
import { User, Mail, Settings, Shield, Award, Calendar } from 'lucide-react';

export default function Profile() {
  return (
    <div className="max-w-4xl mx-auto w-full space-y-8 pb-10">
      
      <header className="flex items-center gap-6 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-4xl font-bold text-white shadow-inner">
          AR
        </div>
        <div>
          <h1 className="text-3xl font-bold text-secondary">Alex Rivera</h1>
          <p className="text-gray-500 flex items-center gap-2 mt-1">
            <Mail size={16} /> alex.rivera@email.com
          </p>
          <div className="mt-4 flex gap-2">
            <span className="px-3 py-1 bg-surface rounded-full text-xs font-semibold text-secondary">Senior Backend Engineer</span>
            <span className="px-3 py-1 bg-surface rounded-full text-xs font-semibold text-secondary">San Francisco, CA</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Stats Bento */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-secondary flex items-center gap-2">
              <Award className="text-primary" />
              Interview Stats
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-surface rounded-2xl">
              <div className="text-3xl font-bold text-secondary mb-1">12</div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Mock Interviews</div>
            </div>
            <div className="p-4 bg-surface rounded-2xl">
              <div className="text-3xl font-bold text-secondary mb-1">84</div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Avg Score</div>
            </div>
            <div className="p-4 bg-surface rounded-2xl">
              <div className="text-3xl font-bold text-secondary mb-1">45</div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Problems Solved</div>
            </div>
            <div className="p-4 bg-surface rounded-2xl">
              <div className="text-3xl font-bold text-secondary mb-1">92%</div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">ATS Avg</div>
            </div>
          </div>
        </div>

        {/* Upcoming Bento */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-secondary flex items-center gap-2">
              <Calendar className="text-primary" />
              Upcoming Schedule
            </h2>
          </div>
          <div className="flex-grow space-y-4">
            <div className="p-4 border border-gray-100 rounded-2xl flex items-center gap-4 hover:border-primary transition-colors cursor-pointer">
              <div className="bg-primary/10 text-primary p-3 rounded-xl font-bold text-center leading-tight">
                Sep<br/><span className="text-xl">05</span>
              </div>
              <div>
                <h4 className="font-bold text-secondary">System Design Mock</h4>
                <p className="text-xs text-gray-500">Google Format • 45 mins</p>
              </div>
            </div>
            <div className="p-4 border border-gray-100 rounded-2xl flex items-center gap-4 hover:border-primary transition-colors cursor-pointer">
              <div className="bg-surface text-gray-500 p-3 rounded-xl font-bold text-center leading-tight">
                Sep<br/><span className="text-xl">12</span>
              </div>
              <div>
                <h4 className="font-bold text-secondary">Algorithms & Data Structures</h4>
                <p className="text-xs text-gray-500">Meta Format • 60 mins</p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div className="md:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-secondary mb-6 flex items-center gap-2">
            <Settings className="text-gray-400" />
            Account Settings
          </h2>
          <div className="divide-y divide-gray-100">
            <div className="py-4 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-secondary">Personal Information</h4>
                <p className="text-sm text-gray-500">Update your name, email, and target roles.</p>
              </div>
              <button className="text-sm font-semibold text-primary hover:text-primary/80">Edit</button>
            </div>
            <div className="py-4 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-secondary flex items-center gap-2"><Shield size={16}/> Password & Security</h4>
                <p className="text-sm text-gray-500">Manage your password and 2FA settings.</p>
              </div>
              <button className="text-sm font-semibold text-primary hover:text-primary/80">Manage</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
