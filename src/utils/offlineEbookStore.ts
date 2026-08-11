const DB_NAME = "udaan-offline";
const STORE_NAME = "ebooks";
const DB_VERSION = 1;

export interface OfflineEbookRecord {
    id: number;
    title: string;
    fileName: string;
    size: number;
    savedAt: string;
    blob: Blob;
}

function openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        if (typeof indexedDB === "undefined") {
            reject(new Error("Offline storage is not supported in this browser."));
            return;
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: "id" });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error ?? new Error("Unable to open offline storage."));
    });
}

function runTransaction<T>(
    mode: IDBTransactionMode,
    operation: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
    return openDatabase().then(
        (db) =>
            new Promise<T>((resolve, reject) => {
                const transaction = db.transaction(STORE_NAME, mode);
                const request = operation(transaction.objectStore(STORE_NAME));

                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error ?? new Error("Offline storage request failed."));
                transaction.oncomplete = () => db.close();
            })
    );
}

export const saveEbookOffline = (record: OfflineEbookRecord) =>
    runTransaction("readwrite", (store) => store.put(record));

export const getOfflineEbook = (id: number) =>
    runTransaction<OfflineEbookRecord | undefined>("readonly", (store) => store.get(id));

export const removeOfflineEbook = (id: number) =>
    runTransaction("readwrite", (store) => store.delete(id));

export const listOfflineEbookIds = () =>
    runTransaction<IDBValidKey[]>("readonly", (store) => store.getAllKeys()).then((keys) =>
        keys.map((key) => Number(key))
    );

export const triggerBlobDownload = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
};
