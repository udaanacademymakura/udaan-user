import React, { useEffect } from 'react';

type Props = {
    children?: React.ReactNode;
};

// eslint-disable-next-line no-new-func
const triggerDebugger = new Function('debugger');

const ScreenProtection: React.FC<Props> = ({ children }) => {
    useEffect(() => {
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

        const debuggerTrap = setInterval(() => {
            try { triggerDebugger(); } catch { /* noop */ }
        }, 50);

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('selectstart', handleSelectStart);
            document.removeEventListener('keydown', handleKeyDown);
            clearInterval(debuggerTrap);
        };
    }, []);

    return <>{children}</>;
};

export default ScreenProtection;
