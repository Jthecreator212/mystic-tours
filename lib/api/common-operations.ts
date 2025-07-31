import { apiHandler } from '@/lib/api/response-handlers';
import { DatabaseOperations } from '@/lib/database/operations';
import { schemas } from '@/lib/schemas/api-schemas';
import { PaginationParams, SearchParams } from '@/lib/types/api-types';
import { NextRequest } from 'next/server';

export class CommonApiOperations {
  /**
   * Extract and validate pagination parameters from request
   */
  static extractPaginationParams(request: NextRequest): PaginationParams {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const paginationResult = schemas.pagination.safeParse({ limit, offset });
    if (!paginationResult.success) {
      throw new Error('Invalid pagination parameters');
    }

    return paginationResult.data;
  }

  /**
   * Extract search parameters from request
   */
  static extractSearchParams(request: NextRequest): SearchParams {
    const { searchParams } = new URL(request.url);
    return {
      search: searchParams.get('search') || undefined,
      category: searchParams.get('category') || undefined,
      status: searchParams.get('status') || undefined,
    };
  }

  /**
   * Generic GET operation for any table
   */
  static async getAll<T>(
    table: string,
    request: NextRequest,
    transformData?: (data: unknown) => T
  ) {
    try {
      const pagination = this.extractPaginationParams(request);
      const search = this.extractSearchParams(request);

      const queryOptions = {
        orderBy: { column: 'created_at', ascending: false },
        limit: pagination.limit,
        offset: pagination.offset,
        filters: {} as Record<string, unknown>,
      };

      if (search.status) {
        queryOptions.filters.status = search.status;
      }

      const { data, error, count } = await DatabaseOperations.getAll(table, queryOptions);

      if (error) {
        return apiHandler.databaseError(error, `fetch ${table}`);
      }

      const transformedData = transformData 
        ? data?.map(transformData) || []
        : data || [];

      return apiHandler.paginated(transformedData, pagination.limit, pagination.offset, count || 0);
    } catch (error) {
      if (error instanceof Error && error.message === 'Invalid pagination parameters') {
        return apiHandler.error('Invalid pagination parameters', 400);
      }
      console.error(`Unexpected error fetching ${table}:`, error);
      return apiHandler.error('Internal server error');
    }
  }

  /**
   * Generic GET by ID operation
   */
  static async getById<T>(
    table: string,
    id: string | number,
    transformData?: (data: unknown) => T
  ) {
    const { data, error } = await DatabaseOperations.getById(table, id);

    if (error) {
      return apiHandler.databaseError(error, `fetch ${table} by ID`);
    }

    if (!data) {
      return apiHandler.notFound(table.slice(0, -1)); // Remove 's' from table name
    }

    const transformedData = transformData ? transformData(data) : data;
    return apiHandler.success(transformedData);
  }

  /**
   * Generic POST operation
   */
  static async create<T>(
    table: string,
    request: Request,
    schema: unknown,
    transformForDatabase?: (data: unknown) => Record<string, unknown>,
    transformForResponse?: (data: unknown) => T
  ) {
    try {
      const body = await request.json();
      
      const parsedData = schema.safeParse(body);
      if (!parsedData.success) {
        return apiHandler.validationError(parsedData);
      }

      const dataToInsert = transformForDatabase 
        ? transformForDatabase(parsedData.data)
        : parsedData.data;

      const { data, error } = await DatabaseOperations.create(table, dataToInsert);

      if (error) {
        return apiHandler.databaseError(error, `create ${table}`);
      }

      const transformedData = transformForResponse 
        ? transformForResponse(data!)
        : data;

      return apiHandler.success(transformedData, 201);
    } catch (error) {
      console.error(`Unexpected error creating ${table}:`, error);
      return apiHandler.error('Internal server error');
    }
  }

  /**
   * Generic PUT operation
   */
  static async update<T>(
    table: string,
    request: Request,
    schema: unknown,
    transformForDatabase?: (data: unknown) => Record<string, unknown>,
    transformForResponse?: (data: unknown) => T
  ) {
    try {
      const body = await request.json();
      const { id, ...updateData } = body;
      
      if (!id) {
        return apiHandler.error(`${table.slice(0, -1)} ID is required`, 400);
      }

      const parsedData = schema.safeParse(updateData);
      if (!parsedData.success) {
        return apiHandler.validationError(parsedData);
      }

      const dataToUpdate = transformForDatabase 
        ? transformForDatabase(parsedData.data)
        : parsedData.data;

      const { data, error } = await DatabaseOperations.update(table, id, dataToUpdate);

      if (error) {
        return apiHandler.databaseError(error, `update ${table}`);
      }

      if (!data) {
        return apiHandler.notFound(table.slice(0, -1));
      }

      const transformedData = transformForResponse 
        ? transformForResponse(data)
        : data;

      return apiHandler.success(transformedData);
    } catch (error) {
      console.error(`Unexpected error updating ${table}:`, error);
      return apiHandler.error('Internal server error');
    }
  }

  /**
   * Generic DELETE operation
   */
  static async delete(table: string, id: string | number) {
    const { error } = await DatabaseOperations.delete(table, id);

    if (error) {
      return apiHandler.databaseError(error, `delete ${table}`);
    }

    return apiHandler.success({ message: `${table.slice(0, -1)} deleted successfully` });
  }
} 