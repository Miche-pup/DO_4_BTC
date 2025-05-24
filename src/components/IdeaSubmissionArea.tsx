"use client";

import React, { useState } from 'react';
import IdeaForm from '@/components/IdeaForm';

export default function IdeaSubmissionArea() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  async function handleIdeaSubmit(formData: { name: string; headline: string; lightning: string; idea: string }) {
    console.log('--- [FRONTEND LOG] Form data received:', formData);
    const apiPayload = {
      submitter_name: formData.name,
      title: formData.headline,
      lightning_address: formData.lightning,
      description: formData.idea,
    };
    console.log('--- [FRONTEND LOG] Sending payload to API:', apiPayload);
    try {
      const response = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiPayload),
      });
      console.log('--- [FRONTEND LOG] API response status:', response.status);
      const result = await response.json();
      console.log('--- [FRONTEND LOG] API result:', result);
      if (response.ok) {
        alert('Idea submitted successfully!');
      } else {
        alert(result.error || response.statusText);
      }
    } catch (err) {
      console.error('--- [FRONTEND LOG] Fetch error:', err);
      alert('An error occurred while submitting your idea. Please try again.');
    } finally {
      setIsModalOpen(false);
    }
  }

  return (
    <div>
      <button onClick={() => setIsModalOpen(true)}>
        Submit a New Idea
      </button>
      <IdeaForm
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleIdeaSubmit}
      />
    </div>
  );
} 