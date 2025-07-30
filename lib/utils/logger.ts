interface LogLevel {
  ERROR: 'error';
  WARN: 'warn';
  INFO: 'info';
  DEBUG: 'debug';
}

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  context?: Record<string, unknown>;
  userId?: string;
  requestId?: string;
  endpoint?: string;
  method?: string;
  duration?: number;
  error?: Error;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isProduction = process.env.NODE_ENV === 'production';

  private formatLog(entry: LogEntry): string {
    const base = `[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}`;
    
    if (entry.context && Object.keys(entry.context).length > 0) {
      return `${base} | ${JSON.stringify(entry.context)}`;
    }
    
    return base;
  }

  private createEntry(
    level: string, 
    message: string, 
    context?: Record<string, unknown>
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
    };
  }

  error(message: string, context?: Record<string, unknown>, error?: Error): void {
    const entry = this.createEntry('error', message, context);
    if (error) {
      entry.error = error;
      entry.context = {
        ...entry.context,
        errorMessage: error.message,
        errorStack: error.stack,
        errorName: error.name,
      };
    }
    
    console.error(this.formatLog(entry));
    
    // In production, you might want to send to external logging service
    if (this.isProduction) {
      // TODO: Send to external logging service (e.g., Sentry, LogRocket)
      this.sendToExternalService(entry);
    }
  }

  warn(message: string, context?: Record<string, unknown>): void {
    const entry = this.createEntry('warn', message, context);
    console.warn(this.formatLog(entry));
  }

  info(message: string, context?: Record<string, unknown>): void {
    const entry = this.createEntry('info', message, context);
    console.info(this.formatLog(entry));
  }

  debug(message: string, context?: Record<string, unknown>): void {
    if (this.isDevelopment) {
      const entry = this.createEntry('debug', message, context);
      console.debug(this.formatLog(entry));
    }
  }

  // API-specific logging
  logApiRequest(
    method: string,
    endpoint: string,
    duration: number,
    statusCode: number,
    userId?: string,
    requestId?: string
  ): void {
    const context = {
      method,
      endpoint,
      duration: `${duration}ms`,
      statusCode,
      userId,
      requestId,
    };

    if (statusCode >= 400) {
      this.error(`API ${method} ${endpoint} failed with status ${statusCode}`, context);
    } else {
      this.info(`API ${method} ${endpoint} completed in ${duration}ms`, context);
    }
  }

  logDatabaseOperation(
    operation: string,
    table: string,
    duration: number,
    success: boolean,
    error?: Error
  ): void {
    const context = {
      operation,
      table,
      duration: `${duration}ms`,
      success,
    };

    if (success) {
      this.debug(`Database ${operation} on ${table} completed in ${duration}ms`, context);
    } else {
      this.error(`Database ${operation} on ${table} failed`, context, error);
    }
  }

  logAuthentication(
    action: 'login' | 'logout' | 'failed_login',
    email: string,
    success: boolean,
    error?: Error
  ): void {
    const context = {
      action,
      email: email.replace(/./g, '*'), // Mask email for security
      success,
    };

    if (success) {
      this.info(`Authentication ${action} successful for ${email}`, context);
    } else {
      this.warn(`Authentication ${action} failed for ${email}`, context);
      if (error) {
        this.error(`Authentication error details`, context, error);
      }
    }
  }

  logFileUpload(
    fileName: string,
    fileSize: number,
    success: boolean,
    error?: Error
  ): void {
    const context = {
      fileName,
      fileSize: `${(fileSize / 1024 / 1024).toFixed(2)}MB`,
      success,
    };

    if (success) {
      this.info(`File upload successful: ${fileName}`, context);
    } else {
      this.error(`File upload failed: ${fileName}`, context, error);
    }
  }

  logExternalService(
    service: string,
    operation: string,
    success: boolean,
    duration: number,
    error?: Error
  ): void {
    const context = {
      service,
      operation,
      duration: `${duration}ms`,
      success,
    };

    if (success) {
      this.debug(`${service} ${operation} completed in ${duration}ms`, context);
    } else {
      this.error(`${service} ${operation} failed`, context, error);
    }
  }

  // Performance monitoring
  logPerformance(
    operation: string,
    duration: number,
    memoryUsage?: NodeJS.MemoryUsage
  ): void {
    const context = {
      operation,
      duration: `${duration}ms`,
      memoryUsage: memoryUsage ? {
        heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`,
        heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)}MB`,
        external: `${(memoryUsage.external / 1024 / 1024).toFixed(2)}MB`,
      } : undefined,
    };

    if (duration > 1000) {
      this.warn(`Slow operation detected: ${operation} took ${duration}ms`, context);
    } else {
      this.debug(`Performance: ${operation} took ${duration}ms`, context);
    }
  }

  // Security logging
  logSecurityEvent(
    event: string,
    details: Record<string, unknown>,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): void {
    const context = {
      event,
      severity,
      ...details,
    };

    switch (severity) {
      case 'critical':
      case 'high':
        this.error(`Security event: ${event}`, context);
        break;
      case 'medium':
        this.warn(`Security event: ${event}`, context);
        break;
      case 'low':
        this.info(`Security event: ${event}`, context);
        break;
    }
  }

  private sendToExternalService(entry: LogEntry): void {
    // TODO: Implement external logging service integration
    // Example: Sentry, LogRocket, DataDog, etc.
    if (entry.level === 'error') {
      // Send critical errors to external service
      console.log('Would send to external service:', entry);
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Export types for use in other files
export type { LogEntry, LogLevel };
