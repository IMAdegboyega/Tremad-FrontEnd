import React from 'react';

/**
 * Multi-step form progress that fills as you type.
 *
 * Each step owns a segment. The segment for the step you're on fills in
 * proportion to how much of that step you've completed, so the bar creeps
 * forward with every field and slides back when you clear one. Steps you've
 * already passed keep showing their real state rather than being pinned full —
 * go back and empty a field and that segment visibly drops, which is the
 * honest thing to show and the point of the whole exercise.
 *
 * Steps ahead of you stay empty regardless of their contents. A step you
 * haven't reached shouldn't look done even if it happens to require nothing.
 *
 * ---------------------------------------------------------------------------
 * WHAT COUNTS AS PROGRESS
 * ---------------------------------------------------------------------------
 * The caller passes a ratio per step, and it should be computed from the SAME
 * checks that decide whether "Continue" is enabled — see how both wizards
 * build theirs from one `STEP_CHECKS` array. That coupling is the point: a
 * full segment means "this step is done", so the bar filling and the button
 * lighting up are two views of one fact rather than two rules that drift.
 *
 * Optional fields deliberately don't move it. If they did, finishing
 * everything the form actually demands would leave the bar at two thirds and
 * Continue enabled — which reads as broken.
 */

export interface WizardStep {
  label: string;
  /** 0–1. How much of this step's required input is done. */
  ratio: number;
}

interface Props {
  steps: WizardStep[];
  /** 1-based. */
  current: number;
  /** Where the caption sits relative to the bar. */
  labelPosition?: 'above' | 'below';
  /** Supply to make already-visited steps clickable. */
  onStepClick?: (step: number) => void;
  className?: string;
}

const clamp = (n: number) => Math.max(0, Math.min(1, Number.isFinite(n) ? n : 0));

const WizardProgress: React.FC<Props> = ({
  steps,
  current,
  labelPosition = 'below',
  onStepClick,
  className = '',
}) => {
  // Steps ahead contribute nothing, so the headline figure can't run ahead of
  // where the person actually is.
  const overall =
    steps.reduce(
      (sum, step, i) => sum + (i + 1 <= current ? clamp(step.ratio) : 0),
      0
    ) / Math.max(1, steps.length);

  return (
    <div
      className={`flex items-stretch gap-2 sm:gap-3 ${className}`}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(overall * 100)}
      aria-label={`Step ${current} of ${steps.length}`}
    >
      {steps.map((step, i) => {
        const index = i + 1;
        const isCurrent = index === current;
        const isPast = index < current;
        const reached = index <= current;
        const pct = reached ? clamp(step.ratio) * 100 : 0;
        const navigable = Boolean(onStepClick) && reached;

        const bar = (
          <div className="h-[3px] w-full rounded-full bg-gray-200 overflow-hidden">
            <div
              className="h-full rounded-full bg-green-600 transition-[width] duration-300 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
        );

        const caption = (
          <span
            className={`block text-xs sm:text-sm text-center transition-colors ${
              isCurrent
                ? 'text-green-700 font-medium'
                : isPast
                  ? 'text-gray-900'
                  : 'text-gray-400'
            }`}
          >
            {step.label}
          </span>
        );

        const body =
          labelPosition === 'above' ? (
            <>
              {caption}
              <span className="block mt-2">{bar}</span>
            </>
          ) : (
            <>
              {bar}
              <span className="block mt-2">{caption}</span>
            </>
          );

        // A button only when it can actually do something — a disabled button
        // for every step ahead is noise for anyone tabbing through.
        return navigable ? (
          <button
            key={step.label}
            type="button"
            onClick={() => onStepClick?.(index)}
            aria-current={isCurrent ? 'step' : undefined}
            className="flex-1 min-w-0 text-left"
          >
            {body}
          </button>
        ) : (
          <div
            key={step.label}
            aria-current={isCurrent ? 'step' : undefined}
            className="flex-1 min-w-0"
          >
            {body}
          </div>
        );
      })}
    </div>
  );
};

export default WizardProgress;
