"use client";

import React, { useState } from "react";
import { ArrowLeft, Search, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

// Mock data
const mockSubmissions = [
  { id: 1, date: "2025-01-04", address: "123 Oak Street", photos: 8, status: "Completed", distance: "0.3 km" },
  { id: 2, date: "2025-01-03", address: "456 Pine Avenue", photos: 12, status: "Pending Review", distance: "1.2 km" },
  { id: 3, date: "2025-01-03", address: "789 Maple Drive", photos: 6, status: "Completed", distance: "2.1 km" },
  { id: 4, date: "2025-01-02", address: "321 Elm Street", photos: 15, status: "In Progress", distance: "0.8 km" },
  { id: 5, date: "2025-01-01", address: "555 Cedar Lane", photos: 9, status: "Under Review", distance: "1.5 km" },
];

export default function SubmissionsPage() {
  const [submissions] = useState(mockSubmissions);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const router = useRouter();

  // Filter submissions based on search
  const filteredSubmissions = submissions.filter(
    (submission) =>
      submission.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const viewSubmissionDetails = (submissionId: number) => {
    // In a real app, navigate to detailed submission view
    const submission = submissions.find((s) => s.id === submissionId);
    if (submission) {
      alert(
        `📋 Viewing details for:\n${submission.address}\nStatus: ${submission.status}\nPhotos: ${submission.photos}`
      );
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "Completed":
        return "status-completed";
      case "Pending Review":
      case "Under Review":
        return "status-pending";
      case "In Progress":
        return "status-in-progress";
      default:
        return "status-pending";
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white safe-area-top safe-area-bottom">
      {/* Header */}
      <div className="bg-gray-800 px-4 py-4 flex items-center shadow-lg">
        <button
          onClick={() => router.push("/dashboard")}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors mr-3 btn-touch"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-semibold flex-1">My Submissions</h1>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors btn-touch"
        >
          <RefreshCw size={20} className={isRefreshing ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">📂 Inspection Reports</h2>
          <p className="text-gray-400">View your submitted inspection reports</p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by address or status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 btn-touch"
          />
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-blue-400">{submissions.length}</div>
            <div className="text-xs text-gray-400">Total</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-green-400">
              {submissions.filter((s) => s.status === "Completed").length}
            </div>
            <div className="text-xs text-gray-400">Completed</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-yellow-400">
              {submissions.filter((s) => s.status.includes("Review")).length}
            </div>
            <div className="text-xs text-gray-400">Under Review</div>
          </div>
        </div>

        {/* Submissions List */}
        <div className="space-y-4">
          {filteredSubmissions.map((submission) => (
            <div key={submission.id} className="bg-gray-800 rounded-lg p-4 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-white">{submission.address}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyles(submission.status)}`}>
                  {submission.status}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-400">
                <div className="flex items-center space-x-4">
                  <span>📅 {submission.date}</span>
                  <span>📷 {submission.photos} photos</span>
                  <span>📍 {submission.distance}</span>
                </div>
                <button
                  onClick={() => viewSubmissionDetails(submission.id)}
                  className="text-blue-400 hover:text-blue-300 btn-touch"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredSubmissions.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <Search size={48} className="mx-auto mb-2 opacity-50" />
              <p>No submissions found</p>
              <p className="text-sm">
                {searchQuery ? "Try adjusting your search terms" : "Start your first inspection to see reports here"}
              </p>
            </div>
            {!searchQuery && (
              <button
                onClick={() => router.push("/inspection/address")}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors btn-touch"
              >
                Start New Inspection
              </button>
            )}
          </div>
        )}

        {/* Pull to refresh indicator */}
        {isRefreshing && (
          <div className="text-center py-4">
            <div className="text-gray-400 text-sm">Refreshing submissions...</div>
          </div>
        )}
      </div>
    </div>
  );
}
