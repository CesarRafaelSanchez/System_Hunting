import React, { useEffect } from 'react';
import { toast } from 'sonner';
import { getSyncQueue, removeFromSyncQueue } from '../utils/indexedDB';
import { fetchApi } from '../services/api.client';

export const SyncManager: React.FC = () => {
  useEffect(() => {
    const handleOnline = async () => {
      try {
        const queue = await getSyncQueue();
        if (queue.length === 0) return;

        toast.info(`Sincronizando ${queue.length} registro(s) guardado(s) offline...`);
        let synced = 0;

        for (const task of queue) {
          try {
            await fetchApi(task.url, {
              method: task.method,
              body: JSON.stringify(task.payload),
              headers: {
                'Content-Type': 'application/json'
              }
            });
            await removeFromSyncQueue(task.id!);
            synced++;
          } catch (e) {
            console.error('Error sincronizando tarea', task.id, e);
          }
        }

        if (synced > 0) {
          toast.success(`Sincronización completada: ${synced} registro(s) enviado(s)`);
        }
      } catch (err) {
        console.error('Error en proceso de sincronización', err);
      }
    };

    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  return null;
};
