import { performance } from 'perf_hooks';

export interface PerformanceMetrics {
  duration: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  timestamp: string;
}

export interface PerformanceContext {
  operation: string;
  details?: Record<string, unknown>;
}

/**
 * Measure performance of an async operation
 */
export async function measurePerformance<T>(
  operation: () => Promise<T>
): Promise<{ result: T; metrics: PerformanceMetrics }> {
  const startTime = performance.now();
  const startMemory = process.memoryUsage();

  try {
    const result = await operation();
    
    const endTime = performance.now();
    const endMemory = process.memoryUsage();
    
    const metrics: PerformanceMetrics = {
      duration: endTime - startTime,
      memory: {
        used: endMemory.heapUsed - startMemory.heapUsed,
        total: endMemory.heapUsed,
        percentage: ((endMemory.heapUsed - startMemory.heapUsed) / endMemory.heapUsed) * 100
      },
      timestamp: new Date().toISOString()
    };

    return { result, metrics };
  } catch {
    const endTime = performance.now();
    const endMemory = process.memoryUsage();
    
    const metrics: PerformanceMetrics = {
      duration: endTime - startTime,
      memory: {
        used: endMemory.heapUsed - startMemory.heapUsed,
        total: endMemory.heapUsed,
        percentage: ((endMemory.heapUsed - startMemory.heapUsed) / endMemory.heapUsed) * 100
      },
      timestamp: new Date().toISOString()
    };

    throw { metrics };
  }
}

/**
 * Create a performance timer
 */
export function createTimer(operation: string) {
  const startTime = performance.now();
  const startMemory = process.memoryUsage();

  return {
    end: () => {
      const endTime = performance.now();
      const endMemory = process.memoryUsage();
      
      return {
        operation,
        duration: endTime - startTime,
        memory: {
          used: endMemory.heapUsed - startMemory.heapUsed,
          total: endMemory.heapUsed,
          percentage: ((endMemory.heapUsed - startMemory.heapUsed) / endMemory.heapUsed) * 100
        },
        timestamp: new Date().toISOString()
      };
    }
  };
}

/**
 * Get current system performance metrics
 */
export function getSystemMetrics(): PerformanceMetrics {
  const memory = process.memoryUsage();

    return {
    duration: 0,
    memory: {
      used: memory.heapUsed,
      total: memory.heapTotal,
      percentage: (memory.heapUsed / memory.heapTotal) * 100
    },
    timestamp: new Date().toISOString()
  };
}

/**
 * Performance decorator for class methods
 */
export function measureMethod(target: Record<string, unknown>, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = async function (...args: unknown[]) {
    const timer = createTimer(`${target.constructor.name}.${propertyKey}`);
    
    try {
      const result = await originalMethod.apply(this, args);
      const metrics = timer.end();
      
      console.log(`Performance: ${metrics.operation}`, {
        duration: `${metrics.duration.toFixed(2)}ms`,
        memory: `${(metrics.memory.used / 1024 / 1024).toFixed(2)}MB`
      });
      
    return result;
    } catch {
      const metrics = timer.end();
      
      console.error(`Performance Error: ${metrics.operation}`, {
        duration: `${metrics.duration.toFixed(2)}ms`,
        memory: `${(metrics.memory.used / 1024 / 1024).toFixed(2)}MB`
      });
      
      throw new Error(`Operation failed: ${metrics.operation}`);
    }
  };

  return descriptor;
}

/**
 * Performance wrapper for functions
 */
export function withPerformance<T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  operationName: string
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    const timer = createTimer(operationName);
    
    try {
      const result = await fn(...args);
      const metrics = timer.end();
      
      console.log(`Performance: ${metrics.operation}`, {
        duration: `${metrics.duration.toFixed(2)}ms`,
        memory: `${(metrics.memory.used / 1024 / 1024).toFixed(2)}MB`
      });
      
      return result;
    } catch {
      const metrics = timer.end();
      
      console.error(`Performance Error: ${metrics.operation}`, {
        duration: `${metrics.duration.toFixed(2)}ms`,
        memory: `${(metrics.memory.used / 1024 / 1024).toFixed(2)}MB`
      });
      
      throw new Error(`Operation failed: ${metrics.operation}`);
    }
  };
} 