'use client';

/**
 * The "Need Help?" contact dialog, opened from the sidebar card.
 *
 * That card's button had no onClick at all — it rendered, it hovered, and it
 * did nothing. This is the handler it was missing.
 *
 * Built on the shared Radix `Dialog` rather than a hand-rolled overlay. The
 * first attempt was hand-rolled and rendered INSIDE the sidebar's <aside>,
 * which meant the backdrop never covered the page — Radix portals to <body>,
 * so the overlay, focus trap and Escape handling all behave regardless of
 * where the trigger lives.
 *
 * Posts to the same public contact endpoint as the landing page and /apply, so
 * everything lands in one place: Admin → Admissions → Messages.
 */

import React, { useEffect, useState } from 'react';
import { Loader2, MessageSquare } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useUser } from '@/Constants/UserContext';
import SocialLinks from '@/components/shared/SocialLinks';
import {
  getPublicSettings,
  submitContactMessage,
  type PublicSettings,
} from '@/lib/api/public.service';
import { getApiErrorMessage } from '@/lib/api/client';

interface Props {
  open: boolean;
  onClose: () => void;
}

const NeedHelpDialog: React.FC<Props> = ({ open, onClose }) => {
  const user = useUser();

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState('');
  const [error, setError] = useState('');
  const [settings, setSettings] = useState<PublicSettings | null>(null);

  // The school's socials come from /public/settings, so which platforms show
  // is configuration, not code. Fetched on first open rather than on mount —
  // no reason to pay for it until someone actually opens the dialog.
  useEffect(() => {
    if (!open || settings) return;
    getPublicSettings()
      .then((res) => {
        if (res?.success && res.data) setSettings(res.data);
      })
      .catch(() => {
        /* socials are a nicety — the form still works without them */
      });
  }, [open, settings]);

  // Reset on each open so a previous send doesn't greet the next one.
  useEffect(() => {
    if (open) {
      setSubject('');
      setMessage('');
      setSent('');
      setError('');
      setSending(false);
    }
  }, [open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!message.trim()) {
      setError('Tell us what you need help with.');
      return;
    }

    // They're signed in, so we already know who they are — no point asking
    // them to retype a name and email the system is holding.
    const name = user?.name?.trim() || user?.email || 'Portal user';
    const email = user?.email || '';

    if (!email) {
      setError("We couldn't read your email. Please sign in again.");
      return;
    }

    setSending(true);
    try {
      const res = await submitContactMessage({
        // Everything from here is an enquiry. An admin can read it and
        // re-prioritise in the inbox — asking a parent to self-classify their
        // own complaint was friction for no gain.
        kind: 'enquiry',
        name,
        email,
        message: message.trim(),
        subject: subject.trim() || undefined,
        preferredContact: 'email',
        // Lets an admin see which student a complaint concerns without
        // cross-referencing the sender's email by hand.
        relatedStudentName: user?.role === 'student' ? name : undefined,
      });

      if (res?.success) {
        setSent(res.message || "Thanks — we've received your message.");
        setMessage('');
        setSubject('');
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
    <Dialog
      open={open}
      onOpenChange={(next) => {
        // Don't let a stray click dismiss a send that's in flight.
        if (!next && !sending) onClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
              <MessageSquare size={16} className="text-green-700" />
            </span>
            Contact the school
          </DialogTitle>
          <DialogDescription>
            We&apos;ll reply to {user?.email || 'your registered email'}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
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

          <label className="block">
            <span className="text-xs text-gray-500 mb-1 block">
              Subject <span className="text-gray-400">(optional)</span>
            </span>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className={input}
            />
          </label>

          <label className="block">
            <span className="text-xs text-gray-500 mb-1 block">Message</span>
            <textarea
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                if (error) setError('');
              }}
              rows={4}
              placeholder="How can we help?"
              className={`${input} resize-none`}
            />
          </label>

          <DialogFooter>
            <button
              type="button"
              onClick={onClose}
              disabled={sending}
              className="text-sm px-4 py-2.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              {sent ? 'Done' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={sending}
              className="text-sm px-4 py-2.5 rounded-lg bg-primary-green text-white hover:bg-primary-green-hover disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {sending && <Loader2 size={15} className="animate-spin" />}
              {sending ? 'Sending…' : 'Send message'}
            </button>
          </DialogFooter>
        </form>

        <SocialLinks
          contact={settings?.contact}
          label="Or reach us on"
          className="pt-4 border-t border-gray-100"
        />
      </DialogContent>
    </Dialog>
  );
};

const input =
  'w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500';

export default NeedHelpDialog;
