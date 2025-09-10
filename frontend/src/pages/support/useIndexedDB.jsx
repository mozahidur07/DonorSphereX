import { useEffect, useState, useRef } from 'react';

// Custom hook for using IndexedDB
export function useIndexedDB(storeName) {
  const [db, setDb] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const DB_NAME = 'donnerChatDB';
  const DB_VERSION = 1;
  const dbRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    
    // Initialize database
    const initDB = async () => {
      try {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
          console.error("IndexedDB error:", event.target.error);
        };

        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName, { keyPath: 'id' });
          }
        };

        request.onsuccess = (event) => {
          if (!isMounted) return;
          
          const database = event.target.result;
          dbRef.current = database;
          setDb(database);
          setIsInitialized(true);
          
          // Listen for close events
          database.onclose = () => {
            if (isMounted) {
              setIsInitialized(false);
              setDb(null);
            }
          };
          
          // Listen for version change events
          database.onversionchange = () => {
            database.close();
            if (isMounted) {
              setIsInitialized(false);
              setDb(null);
              console.log("Database version changed, please reload the page");
            }
          };
        };
      } catch (error) {
        console.error("Error initializing IndexedDB:", error);
      }
    };
    
    initDB();
    
    return () => {
      isMounted = false;
      if (dbRef.current) {
        dbRef.current.close();
      }
    };
  }, [storeName]);

  const waitForDB = () => {
    return new Promise((resolve, reject) => {
      if (db) {
        resolve(db);
      } else if (dbRef.current) {
        resolve(dbRef.current);
      } else {
        // Wait for initialization with timeout
        let attempts = 0;
        const maxAttempts = 50; // 5 seconds with 100ms intervals
        
        const checkDB = setInterval(() => {
          attempts++;
          if (db || dbRef.current) {
            clearInterval(checkDB);
            resolve(db || dbRef.current);
          } else if (attempts >= maxAttempts) {
            clearInterval(checkDB);
            reject(new Error("Database initialization timed out"));
          }
        }, 100);
      }
    });
  };
  
  const getItem = (id) => {
    return new Promise(async (resolve, reject) => {
      try {
        const database = await waitForDB();
        
        const transaction = database.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.get(id);

        request.onsuccess = () => {
          resolve(request.result);
        };

        request.onerror = () => {
          reject(request.error);
        };
      } catch (error) {
        reject(error);
      }
    });
  };

  const getAllItems = () => {
    return new Promise(async (resolve, reject) => {
      try {
        const database = await waitForDB();
        
        const transaction = database.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();

        request.onsuccess = () => {
          resolve(request.result || []);
        };

        request.onerror = () => {
          reject(request.error);
        };
      } catch (error) {
        reject(error);
      }
    });
  };

  const setItem = (item) => {
    return new Promise(async (resolve, reject) => {
      try {
        const database = await waitForDB();
        
        const transaction = database.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.put(item);

        request.onsuccess = () => {
          resolve(request.result);
        };

        request.onerror = () => {
          reject(request.error);
        };
      } catch (error) {
        reject(error);
      }
    });
  };

  const removeItem = (id) => {
    return new Promise(async (resolve, reject) => {
      try {
        const database = await waitForDB();
        
        const transaction = database.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.delete(id);

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = () => {
          reject(request.error);
        };
      } catch (error) {
        reject(error);
      }
    });
  };

  return { 
    getItem, 
    getAllItems, 
    setItem, 
    removeItem, 
    isInitialized 
  };
}
