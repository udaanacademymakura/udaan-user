import { useEffect, useRef, useState } from "react";

export type TimerStatus = "idle" | "running" | "expired";

export interface TimerWarning {
	atMs: number;
	play: () => void;
}

export interface UseTestTimerOptions {
	durationMs: number | undefined;
	endDatetime: string | null | undefined;
	storageKey: string;
	onExpire?: () => void;
	warnings?: TimerWarning[];
}

export interface UseTestTimerReturn {
	timeLeft: number | undefined;
	startedAt: number | undefined;
	deadline: number | undefined;
	status: TimerStatus;
	wasAlreadyClosed: boolean;
}

interface PersistedState {
	deadline: number;
	startedAt: number;
	warningsPlayed: number[];
}

const TIMER_SUFFIX = "__timer";

function readPersisted(key: string): PersistedState | null {
	try {
		const raw = localStorage.getItem(key + TIMER_SUFFIX);
		if (!raw) return null;
		const parsed = JSON.parse(raw);
		if (typeof parsed?.deadline !== "number" || typeof parsed?.startedAt !== "number") return null;
		return {
			deadline: parsed.deadline,
			startedAt: parsed.startedAt,
			warningsPlayed: Array.isArray(parsed.warningsPlayed) ? parsed.warningsPlayed : [],
		};
	} catch {
		return null;
	}
}

function writePersisted(key: string, state: PersistedState) {
	try {
		localStorage.setItem(key + TIMER_SUFFIX, JSON.stringify(state));
	} catch {
		// localStorage full or disabled — fail open
	}
}

export default function useTestTimer({
	durationMs,
	endDatetime,
	storageKey,
	onExpire,
	warnings,
}: UseTestTimerOptions): UseTestTimerReturn {
	const [state, setState] = useState<PersistedState | null>(null);
	const [, setNowTick] = useState(0);

	const onExpireRef = useRef(onExpire);
	onExpireRef.current = onExpire;

	const warningsRef = useRef(warnings);
	warningsRef.current = warnings;

	const expiredFiredRef = useRef(false);

	// Hydrate / initialize. Deadline is an absolute timestamp; once set it
	// only ever shrinks (if the test window is shortened mid-session).
	useEffect(() => {
		if (durationMs === undefined) return;

		const now = Date.now();
		const endTime = endDatetime ? new Date(endDatetime).getTime() : Number.POSITIVE_INFINITY;

		if (endTime <= now) {
			// Test window has already closed. deadline === startedAt is the
			// signal `wasAlreadyClosed` is derived from.
			setState({ deadline: now, startedAt: now, warningsPlayed: [] });
			return;
		}

		const persisted = readPersisted(storageKey);
		if (persisted) {
			const effectiveDeadline = Math.min(persisted.deadline, endTime);
			const hydrated: PersistedState = {
				deadline: effectiveDeadline,
				startedAt: persisted.startedAt,
				warningsPlayed: persisted.warningsPlayed,
			};
			setState(hydrated);
			if (effectiveDeadline !== persisted.deadline) {
				writePersisted(storageKey, hydrated);
			}
			return;
		}

		const fresh: PersistedState = {
			deadline: Math.min(now + durationMs, endTime),
			startedAt: now,
			warningsPlayed: [],
		};
		setState(fresh);
		writePersisted(storageKey, fresh);
	}, [durationMs, endDatetime, storageKey]);

	// 1 Hz render tick — does NOT drive the countdown, just triggers re-render
	// so the wall-clock-derived `timeLeft` refreshes.
	useEffect(() => {
		if (!state) return;
		const id = setInterval(() => setNowTick((t) => (t + 1) | 0), 1000);
		return () => clearInterval(id);
	}, [state]);

	// Re-sync immediately when the tab comes back to focus.
	useEffect(() => {
		const onVisibility = () => {
			if (!document.hidden) setNowTick((t) => (t + 1) | 0);
		};
		document.addEventListener("visibilitychange", onVisibility);
		return () => document.removeEventListener("visibilitychange", onVisibility);
	}, []);

	const timeLeft = state ? Math.max(state.deadline - Date.now(), 0) : undefined;
	const wasAlreadyClosed = !!state && state.deadline <= state.startedAt;
	const status: TimerStatus =
		state === null ? "idle" : timeLeft === 0 ? "expired" : "running";

	// Fire onExpire once when the timer transitions from running to expired
	// in a live session. Skipped when the test was already closed on open —
	// the consumer should redirect via `wasAlreadyClosed`.
	useEffect(() => {
		if (!state) return;
		if (wasAlreadyClosed) return;
		if (status === "expired" && !expiredFiredRef.current) {
			expiredFiredRef.current = true;
			onExpireRef.current?.();
		}
	}, [status, state, wasAlreadyClosed]);

	// Audio warnings. A warning fires once per atMs threshold, persisted so
	// refreshing inside the warning window doesn't replay it.
	useEffect(() => {
		if (!state || status !== "running" || timeLeft === undefined) return;
		const ws = warningsRef.current;
		if (!ws || ws.length === 0) return;

		const newlyPlayed: number[] = [];
		for (const w of ws) {
			if (state.warningsPlayed.includes(w.atMs)) continue;
			if (timeLeft <= w.atMs) {
				newlyPlayed.push(w.atMs);
				try {
					w.play();
				} catch {
					// audio playback can throw if blocked by autoplay policy
				}
			}
		}
		if (newlyPlayed.length > 0) {
			const next: PersistedState = {
				...state,
				warningsPlayed: [...state.warningsPlayed, ...newlyPlayed],
			};
			setState(next);
			writePersisted(storageKey, next);
		}
	}, [timeLeft, status, state, storageKey]);

	return {
		timeLeft,
		startedAt: state?.startedAt,
		deadline: state?.deadline,
		status,
		wasAlreadyClosed,
	};
}
