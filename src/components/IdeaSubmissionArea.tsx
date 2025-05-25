"use client";

import React, { useState } from 'react';
import IdeaForm from '@/components/IdeaForm';

export default function IdeaSubmissionArea() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  async function handleIdeaSubmit(formData: { name: string; headline: string; lightning: string; idea: string }) {
    const apiPayload = {
      submitter_name: formData.name,
      title: formData.headline,
      lightning_address: formData.lightning,
      description: formData.idea,
    };
    try {
      const response = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiPayload),
      });
      const result = await response.json();
      if (response.ok) {
        alert('Idea submitted successfully!');
      } else {
        alert(result.error || response.statusText);
      }
    } catch (err) {
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