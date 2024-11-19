import { HttpParams, HttpResponse } from "@angular/common/http";
import { PaginatedResult } from "../_models/pagination";
import { signal } from "@angular/core";

export function setPaginationResultFromHttpResponse<T>(response: HttpResponse<T>, paginatedResultSignal: ReturnType<typeof signal<PaginatedResult<T> | null>>): void {
    return paginatedResultSignal.set({
        items: response.body as T,
        pagination: JSON.parse(response.headers.get('Pagination')!!)
    });
}

export function setHttpPaginationParams(httpParams: HttpParams = new HttpParams(), pageNumber: number | undefined, pageSize: number | undefined) {
    let params = httpParams;
    if (pageNumber && pageSize) {
        params = params.append('pageNumber', pageNumber);
        params = params.append('pageSize', pageSize);
    }
    return params;
}