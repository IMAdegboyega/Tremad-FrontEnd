'use client';

/**
 * The contact form on the landing page.
 *
 * Extracted into its own client component because `page.tsx` is a server
 * component — it can't hold form state or attach an onSubmit. Until now this
 * form had no handler at all: it rendered, accepted typing, and threw every
 * message away on submit.
 *
 * Posts to the same public endpoint as the Contact tab on /apply, so messages
 * from either place land in one admin inbox.
 */

import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { submitContactMessage } from '@/lib/api/public.service';
import { getApiErrorMessage } from '@/lib/api/client';

const LandingContactForm = () => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: '',
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState('');
  const [error, setError] = useState('');

  const set = (key: keyof typeof form, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (error) setError('');
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const name = `${form.firstName} ${form.lastName}`.trim();
    if (!name || !form.email.trim() || !form.message.trim()) {
      setError('Please fill in your name, email and message.');
      return;
    }

    setSending(true);
    try {
      const res = await submitContactMessage({
        kind: 'enquiry',
        name,
        email: form.email.trim(),
        message: form.message.trim(),
        preferredContact: 'email',
      });
      if (res?.success) {
        setSent(res.message || 'Thank you — we’ll be in touch shortly.');
        setForm({ firstName: '', lastName: '', email: '', message: '' });
      } else {
        setError(res?.message || 'Could not send your message.');
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not send your message.'));
    } finally {
      setSending(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="space-y-4 w-full max-w-xl p-5 sm:p-8 bg-white rounded-xl"
    >
      {sent && (
        <div className="bg-green-50 border border-green-200 text-green-800 text-sm rounded-lg px-4 py-2.5">
          {sent}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2.5">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">First name</label>
          <input
            type="text"
            value={form.firstName}
            onChange={(e) => set('firstName', e.target.value)}
            placeholder="Enter Your First Name"
            className="w-full px-4 py-2 bg-gray-100 border-0 rounded focus:outline-none focus:ring-2 focus:ring-green-700"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Last Name</label>
          <input
            type="text"
            value={form.lastName}
            onChange={(e) => set('lastName', e.target.value)}
            placeholder="Enter Your Last Name"
            className="w-full px-4 py-2 bg-gray-100 border-0 rounded focus:outline-none focus:ring-2 focus:ring-green-700"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-1">Email</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => set('email', e.target.value)}
          placeholder="Enter your email address"
          className="w-full px-4 py-2 bg-gray-100 border-0 rounded focus:outline-none focus:ring-2 focus:ring-green-700"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-1">
          How can we help you?
        </label>
        <textarea
          value={form.message}
          onChange={(e) => set('message', e.target.value)}
          placeholder="Enter your message"
          rows={5}
          className="w-full px-4 py-2 bg-gray-100 border-0 rounded resize-none focus:outline-none focus:ring-2 focus:ring-green-700"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={sending}
          className="bg-primary-green text-white px-6 py-2 rounded text-sm font-medium disabled:opacity-50 flex items-center gap-2"
        >
          {sending && <Loader2 size={14} className="animate-spin" />}
          {sending ? 'Sending…' : 'Send message'}
        </button>
      </div>
    </form>
  );
};

export default LandingContactForm;
