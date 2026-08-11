import { useCallback, useEffect, useState } from "react";
import { getOfflineEbook, removeOfflineEbook, saveEbookOffline } from "../utils/offlineEbookStore";

export function useOfflineEbook(id: number) {
    const [objectUrl, setObjectUrl] = useState<string | null>(null);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        let revoked: string | null = null;
        let cancelled = false;

        setIsChecking(true);
        getOfflineEbook(id)
            .then((record) => {
                if (cancelled || !record?.blob) return;
                const url = URL.createObjectURL(record.blob);
                revoked = url;
                setObjectUrl(url);
            })
            .catch(() => undefined)
            .finally(() => {
                if (!cancelled) setIsChecking(false);
            });

        return () => {
            cancelled = true;
            if (revoked) URL.revokeObjectURL(revoked);
        };
    }, [id]);

    const save = useCallback(
        async (blob: Blob, title: string, fileName: string) => {
            await saveEbookOffline({
                id,
                title,
                fileName,
                size: blob.size,
                savedAt: new Date().toISOString(),
                blob,
            });
            setObjectUrl((previous) => {
                if (previous) URL.revokeObjectURL(previous);
                return URL.createObjectURL(blob);
            });
        },
        [id]
    );

    const remove = useCallback(async () => {
        await removeOfflineEbook(id);
        setObjectUrl((previous) => {
            if (previous) URL.revokeObjectURL(previous);
            return null;
        });
    }, [id]);

    return { offlineUrl: objectUrl, isSavedOffline: Boolean(objectUrl), isChecking, save, remove };
}
