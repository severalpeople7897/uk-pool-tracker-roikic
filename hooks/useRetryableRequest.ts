
import { useState, useCallback } from 'react';

interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  exponentialBackoff?: boolean;
}

export function useRetryableRequest<T>(
  requestFn: () => Promise<T>,
  options: RetryOptions = {}
) {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    exponentialBackoff = true,
  } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const executeRequest = useCallback(async (): Promise<T | null> => {
    setLoading(true);
    setError(null);
    
    let currentRetry = 0;
    
    while (currentRetry <= maxRetries) {
      try {
        const result = await requestFn();
        setLoading(false);
        setRetryCount(0);
        return result;
      } catch (err) {
        console.log(`Request failed (attempt ${currentRetry + 1}/${maxRetries + 1}):`, err);
        
        if (currentRetry === maxRetries) {
          const errorMessage = err instanceof Error ? err.message : 'Request failed';
          setError(errorMessage);
          setLoading(false);
          setRetryCount(currentRetry);
          return null;
        }
        
        // Calculate delay with exponential backoff
        const delay = exponentialBackoff 
          ? retryDelay * Math.pow(2, currentRetry)
          : retryDelay;
        
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        currentRetry++;
        setRetryCount(currentRetry);
      }
    }
    
    setLoading(false);
    return null;
  }, [requestFn, maxRetries, retryDelay, exponentialBackoff]);

  const retry = useCallback(() => {
    return executeRequest();
  }, [executeRequest]);

  return {
    loading,
    error,
    retryCount,
    executeRequest,
    retry,
  };
}
