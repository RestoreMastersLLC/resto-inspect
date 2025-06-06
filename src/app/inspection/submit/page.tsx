'use client';

import React, { useState } from 'react';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function InspectionSubmitPage() {
  const [currentStep] = useState(3);
  const [totalSteps] = useState(3);
  const [notes, setNotes] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const router = useRouter();

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Simulate submission process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Show success and redirect
    alert('✅ Inspection submitted successfully!');
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white safe-area-top safe-area-bottom">
      {/* Header */}
      <div className="bg-gray-800 px-4 py-4 flex items-center shadow-lg">
        <button
          onClick={() => router.push('/inspection/media')}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors mr-3 btn-touch"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold">Review & Submit</h1>
          <div className="text-xs text-gray-400">Step {currentStep} of {totalSteps}</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-gray-800 px-4 pb-2">
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="px-6 py-8 pb-32">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Almost Done!</h2>
          <p className="text-gray-400">Review your inspection and add any final notes</p>
        </div>

        {/* Inspection Summary */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <h3 className="font-semibold mb-3 flex items-center">
            <CheckCircle size={20} className="text-green-400 mr-2" />
            Inspection Summary
          </h3>
          <div className="space-y-2 text-sm text-gray-300">
            <div>📍 Address: Sample address entered</div>
            <div>📷 Media: 0 photos, 0 videos captured</div>
            <div>⏰ Started: {new Date().toLocaleTimeString()}</div>
          </div>
        </div>

        {/* Additional Notes */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Additional Notes (Optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any additional observations, damage details, or notes about the property..."
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 btn-touch"
            rows={4}
          />
        </div>

        {/* Priority Marking */}
        <div className="mb-6">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={isUrgent}
              onChange={(e) => setIsUrgent(e.target.checked)}
              className="w-4 h-4 text-red-600 bg-gray-800 border-gray-700 rounded focus:ring-red-500"
            />
            <span className="text-sm">🚨 Mark as urgent</span>
          </label>
          <p className="text-xs text-gray-400 mt-1">
            Check this if the property poses immediate safety risks or requires urgent attention
          </p>
        </div>

        {/* Data Storage Notice */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6">
          <h4 className="font-medium mb-2">📊 Data Storage & Privacy</h4>
          <div className="text-sm text-gray-400 space-y-1">
            <p>• Photos and videos will be uploaded to secure cloud storage</p>
            <p>• Owner contact information is encrypted and protected</p>
            <p>• Location data helps with mapping and response coordination</p>
            <p>• All data is used solely for restoration and recovery purposes</p>
          </div>
        </div>

        {/* Offline Notice */}
        <div className="bg-yellow-900 border border-yellow-700 rounded-lg p-4 mb-6">
          <h4 className="font-medium mb-2">📱 Offline Support</h4>
          <p className="text-sm text-yellow-200">
            Don&apos;t worry if you lose internet connection. This inspection will be saved locally 
            and automatically uploaded when you&apos;re back online.
          </p>
        </div>
      </div>

      {/* Submit Button */}
      <div className="fixed bottom-6 left-6 right-6">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors btn-touch ripple haptic-medium"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Submitting...
            </span>
          ) : (
            '🚀 Submit Inspection'
          )}
        </button>
      </div>
    </div>
  );
} 