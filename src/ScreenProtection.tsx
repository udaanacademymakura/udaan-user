import React, { useEffect } from 'react';

type Props = {
    children?: React.ReactNode;
};

const MOBILE_BREAKPOINT = 1200;

const triggerDebugger = new Function('debugger');

const ScreenProtection: React.FC<Props> = ({ children }) => {
    useEffect(() => {
        const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);

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

        let debuggerTrap: ReturnType<typeof setInterval> | null = null;
        let attached = false;

        const enable = () => {
            if (attached) return;
            document.addEventListener('contextmenu', handleContextMenu);
            document.addEventListener('selectstart', handleSelectStart);
            document.addEventListener('keydown', handleKeyDown);
            debuggerTrap = setInterval(() => {
                try { triggerDebugger(); } catch { /* noop */ }
            }, 50);
            attached = true;
        };

        const disable = () => {
            if (!attached) return;
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('selectstart', handleSelectStart);
            document.removeEventListener('keydown', handleKeyDown);
            if (debuggerTrap) {
                clearInterval(debuggerTrap);
                debuggerTrap = null;
            }
            attached = false;
        };

        const sync = () => {
            if (mql.matches) disable();
            else enable();
        };

        sync();
        mql.addEventListener('change', sync);

        return () => {
            mql.removeEventListener('change', sync);
            disable();
        };
    }, []);

    return <>{children}</>;
};

export default ScreenProtection;
