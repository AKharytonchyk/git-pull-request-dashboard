import { useState, useEffect, useCallback } from 'react';

interface UsePersistentStateOptions<T> {
  defaultValue: T;
  serialize?: (value: T) => string;
  deserialize?: (value: string) => T;
  validator?: (value: unknown) => value is T;
  storageType?: 'localStorage' | 'sessionStorage';
}

export function usePersistentState<T>(
  key: string,
  options: UsePersistentStateOptions<T>
) {
  const {
    defaultValue,
    serialize = JSON.stringify,
    deserialize = JSON.parse,
    validator,
    storageType = 'localStorage'
  } = options;

  const storage = storageType === 'localStorage' ? localStorage : sessionStorage;

  const [state, setState] = useState<T>(() => {
    try {
      const item = storage.getItem(key);
      if (item === null) return defaultValue;
      
      const parsed = deserialize(item);
      if (validator && !validator(parsed)) {
        console.warn(`Invalid data in ${storageType} for key "${key}"`);
        return defaultValue;
      }
      
      return parsed;
    } catch (error) {
      console.error(`Error reading ${storageType} key "${key}":`, error);
      return defaultValue;
    }
  });

  const updateState = useCallback((newState: T | ((prev: T) => T)) => {
    setState(prevState => {
      const nextState = typeof newState === 'function' 
        ? (newState as (prev: T) => T)(prevState)
        : newState;
      
      try {
        storage.setItem(key, serialize(nextState));
      } catch (error) {
        console.error(`Error writing to ${storageType} key "${key}":`, error);
      }
      
      return nextState;
    });
  }, [key, serialize, storage, storageType]);

  const clearState = useCallback(() => {
    try {
      storage.removeItem(key);
      setState(defaultValue);
    } catch (error) {
      console.error(`Error clearing ${storageType} key "${key}":`, error);
    }
  }, [key, defaultValue, storage, storageType]);

  useEffect(() => {
    try {
      storage.setItem(key, serialize(state));
    } catch (error) {
      console.error(`Error writing to ${storageType} key "${key}":`, error);
    }
  }, [key, state, serialize, storage, storageType]);

  return [state, updateState, clearState] as const;
}

// Validators for common use cases
export const validators = {
  repositorySettings: (value: unknown): value is Record<string, boolean> => 
    typeof value === 'object' && value !== null &&
    Object.values(value).every(v => typeof v === 'boolean'),
    
  isDarkMode: (value: unknown): value is boolean => 
    typeof value === 'boolean',
    
  stringArray: (value: unknown): value is string[] =>
    Array.isArray(value) && value.every(item => typeof item === 'string')
};
