/**
 * Background Sync Service Worker Extension
 * Handles offline mutation queue processing when connectivity is restored
 */

// IndexedDB constants (must match offline-mutation-queue.ts)
const DB_NAME = 'saveplus-offline';
const DB_VERSION = 1;
const STORE_NAME = 'mutation-queue';

// Sync tags
const SYNC_TAGS = {
  MUTATION_SYNC: 'mutation-sync',
  GOAL_SYNC: 'goal-sync',
  TRANSACTION_SYNC: 'transaction-sync',
  BUDGET_SYNC: 'budget-sync',
};

// Retry configuration
const MAX_RETRIES = 5;
const BACKOFF_BASE_MS = 1000;

/**
 * Open IndexedDB
 */
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

/**
 * Get all pending mutations from IndexedDB
 */
async function getPendingMutations(db, type = null) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    
    let request;
    if (type) {
      const index = store.index('type');
      request = index.getAll(type);
    } else {
      const index = store.index('timestamp');
      request = index.getAll();
    }
    
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Remove mutation from IndexedDB
 */
async function removeMutation(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Update mutation retry count
 */
async function incrementRetry(db, mutation) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    mutation.retryCount = (mutation.retryCount || 0) + 1;
    
    if (mutation.retryCount >= MAX_RETRIES) {
      // Max retries reached, remove mutation
      const deleteRequest = store.delete(mutation.id);
      deleteRequest.onsuccess = () => resolve({ removed: true, mutation });
      deleteRequest.onerror = () => reject(deleteRequest.error);
    } else {
      const putRequest = store.put(mutation);
      putRequest.onsuccess = () => resolve({ removed: false, mutation });
      putRequest.onerror = () => reject(putRequest.error);
    }
  });
}

/**
 * Execute a single mutation via Supabase
 */
async function executeMutation(mutation) {
  const supabaseUrl = self.__SUPABASE_URL__;
  const supabaseKey = self.__SUPABASE_ANON_KEY__;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase credentials not available in service worker');
    throw new Error('Missing Supabase credentials');
  }
  
  const response = await fetch(mutation.endpoint, {
    method: mutation.action === 'delete' ? 'DELETE' : 
            mutation.action === 'create' ? 'POST' : 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
    },
    body: JSON.stringify(mutation.payload),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Mutation failed: ${response.status} - ${errorText}`);
  }
  
  return response.json();
}

/**
 * Calculate exponential backoff delay
 */
function getBackoffDelay(retryCount) {
  return Math.min(BACKOFF_BASE_MS * Math.pow(2, retryCount), 30000); // Max 30s
}

/**
 * Process all pending mutations
 */
async function processAllMutations() {
  let db;
  let syncedCount = 0;
  let failedCount = 0;
  
  try {
    db = await openDatabase();
    const mutations = await getPendingMutations(db);
    
    console.log(`[Background Sync] Processing ${mutations.length} pending mutations`);
    
    for (const mutation of mutations) {
      try {
        // Apply backoff if this is a retry
        if (mutation.retryCount > 0) {
          const delay = getBackoffDelay(mutation.retryCount);
          console.log(`[Background Sync] Waiting ${delay}ms before retry`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        
        await executeMutation(mutation);
        await removeMutation(db, mutation.id);
        syncedCount++;
        
        console.log(`[Background Sync] Synced mutation: ${mutation.id}`);
      } catch (err) {
        console.error(`[Background Sync] Failed mutation: ${mutation.id}`, err);
        
        const result = await incrementRetry(db, mutation);
        if (result.removed) {
          console.warn(`[Background Sync] Mutation ${mutation.id} exceeded max retries, removed`);
        }
        failedCount++;
      }
    }
    
    return { success: failedCount === 0, syncedCount, failedCount };
  } catch (err) {
    console.error('[Background Sync] Fatal error:', err);
    return { success: false, syncedCount, failedCount: -1 };
  } finally {
    if (db) db.close();
  }
}

/**
 * Notify main thread of sync completion
 */
async function notifyClients(result) {
  const clients = await self.clients.matchAll({ type: 'window' });
  
  for (const client of clients) {
    client.postMessage({
      type: 'SYNC_COMPLETE',
      success: result.success,
      syncedCount: result.syncedCount,
      failedCount: result.failedCount,
      timestamp: Date.now(),
    });
  }
}

/**
 * Handle sync event
 */
self.addEventListener('sync', (event) => {
  console.log('[Background Sync] Sync event triggered:', event.tag);
  
  if (event.tag === SYNC_TAGS.MUTATION_SYNC || 
      event.tag === SYNC_TAGS.GOAL_SYNC ||
      event.tag === SYNC_TAGS.TRANSACTION_SYNC ||
      event.tag === SYNC_TAGS.BUDGET_SYNC) {
    
    event.waitUntil(
      processAllMutations()
        .then(result => {
          console.log('[Background Sync] Sync completed:', result);
          return notifyClients(result);
        })
        .catch(err => {
          console.error('[Background Sync] Sync failed:', err);
          return notifyClients({ success: false, syncedCount: 0, failedCount: -1 });
        })
    );
  }
});

/**
 * Handle periodic background sync (if supported)
 */
self.addEventListener('periodicsync', (event) => {
  console.log('[Periodic Sync] Event triggered:', event.tag);
  
  if (event.tag === 'periodic-mutation-sync') {
    event.waitUntil(processAllMutations());
  }
});

/**
 * Handle messages from main thread
 */
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SET_SUPABASE_CONFIG') {
    self.__SUPABASE_URL__ = event.data.url;
    self.__SUPABASE_ANON_KEY__ = event.data.key;
    console.log('[Background Sync] Supabase config updated');
  }
  
  if (event.data?.type === 'MANUAL_SYNC') {
    processAllMutations()
      .then(result => notifyClients(result))
      .catch(err => {
        console.error('[Manual Sync] Failed:', err);
        notifyClients({ success: false, syncedCount: 0, failedCount: -1 });
      });
  }
});

console.log('[Background Sync] Service worker extension loaded');
