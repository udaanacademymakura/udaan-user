import { Box, CircularProgress, Typography } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { useThemeSettings } from './hooks/useThemeSettings';
import { useAppSelector } from './store/hook';

type Props = {
    children?: React.ReactNode;
};

const SIZE_THRESHOLD = 160;
// Floor threshold — raised dynamically by calibration on slow/throttled devices
const TIMING_THRESHOLD = 80;
const CALIBRATION_SAMPLES = 5;

// eslint-disable-next-line no-new-func
const triggerDebugger = new Function('debugger');

// Returns the px consumed by the browser's own chrome (address bar + bottom
// nav) by measuring 100svh — the viewport when all chrome is fully visible.
// On desktop this is just the toolbar (~86px); on mobile it's address bar +
// nav bar (~130-200px). Subtracting this from outerHeight - innerHeight leaves
// only DevTools height, making size detection accurate on every device.
const measureNativeChromeHeight = (): number => {
    const el = document.createElement('div');
    el.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:100svh;visibility:hidden;pointer-events:none;';
    document.body.appendChild(el);
    const svhPx = el.offsetHeight;
    document.body.removeChild(el);
    return Math.max(0, window.outerHeight - svhPx);
};

const ScreenProtection: React.FC<Props> = ({ children }) => {
    const [devToolsOpen, setDevToolsOpen] = useState(false);
    const devToolsRef = useRef(false);
    const { mode } = useAppSelector((state) => state.udaan_theme);
    const { logoUrl, logoDarkUrl } = useThemeSettings();
    const logo = mode === 'dark' ? logoUrl : logoDarkUrl;

    useEffect(() => {
        // ── Basic content protections ──────────────────────────────────────
        const handleContextMenu = (e: MouseEvent) => e.preventDefault();
        const handleSelectStart = (e: Event) => e.preventDefault();
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'PrintScreen') {
                navigator.clipboard.writeText('').catch(() => { });
            }
            if ((e.ctrlKey || e.metaKey) && ['u', 's', 'p'].includes(e.key.toLowerCase())) {
                e.preventDefault();
            }
        };

        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('selectstart', handleSelectStart);
        document.addEventListener('keydown', handleKeyDown);

        const markOpen = () => {
            if (!devToolsRef.current) {
                devToolsRef.current = true;
                setDevToolsOpen(true);
            }
        };
        const markClosed = () => {
            if (devToolsRef.current) {
                devToolsRef.current = false;
                setDevToolsOpen(false);
            }
        };

        // ── Continuous debugger trap ───────────────────────────────────────
        const debuggerTrap = setInterval(() => {
            try { triggerDebugger(); } catch { /* noop */ }
        }, 50);

        // ── Size detection — svh-adjusted, all devices ─────────────────────
        // nativeChromeHeight cancels out the browser chrome so only an actual
        // DevTools panel registers in adjustedHeightDiff.
        const nativeChromeHeight = measureNativeChromeHeight();

        const sizeCheck = setInterval(() => {
            const widthDiff = window.outerWidth - window.innerWidth;
            const adjustedHeightDiff = (window.outerHeight - window.innerHeight) - nativeChromeHeight;
            if (widthDiff > SIZE_THRESHOLD || adjustedHeightDiff > SIZE_THRESHOLD) {
                markOpen();
            } else {
                if (!devToolsRef.current) markClosed();
            }
        }, 500);

        // ── Timing detection — self-calibrating, all devices ──────────────
        // Collects CALIBRATION_SAMPLES baseline measurements first, then sets
        // adaptiveThreshold = max(80ms, maxBaseline × 5).
        //
        // Fast desktop  (baseline ~0.5ms) → threshold stays 80ms
        // Throttled mobile (baseline ~60ms) → threshold rises to 300ms
        //
        // No UA sniffing — the device calibrates itself.
        const calibrationSamples: number[] = [];
        let adaptiveThreshold = TIMING_THRESHOLD;

        const timingCheck = setInterval(() => {
            const t0 = performance.now();
            try { triggerDebugger(); } catch { /* noop */ }
            const elapsed = performance.now() - t0;

            if (calibrationSamples.length < CALIBRATION_SAMPLES) {
                calibrationSamples.push(elapsed);
                if (calibrationSamples.length === CALIBRATION_SAMPLES) {
                    const maxBaseline = Math.max(...calibrationSamples);
                    adaptiveThreshold = Math.max(TIMING_THRESHOLD, maxBaseline * 5);
                }
                return;
            }

            if (elapsed > adaptiveThreshold) {
                markOpen();
            } else {
                markClosed();
            }
        }, 1000);

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('selectstart', handleSelectStart);
            document.removeEventListener('keydown', handleKeyDown);
            clearInterval(debuggerTrap);
            clearInterval(sizeCheck);
            clearInterval(timingCheck);
        };
    }, []);

    return (
        <>
            {children}

            {devToolsOpen && (
                <Box
                    sx={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 999999,
                        bgcolor: 'background.default',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 3,
                    }}
                >
                    <img
                        src={logo}
                        alt=""
                        style={{ height: 52, objectFit: 'contain' }}
                    />
                    <CircularProgress size={36} thickness={3.5} />
                    <Typography variant="body2" color="text.secondary">
                        Loading, please wait…
                    </Typography>
                </Box>
            )}
        </>
    );
};

export default ScreenProtection;
