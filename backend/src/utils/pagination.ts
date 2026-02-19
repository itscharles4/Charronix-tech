export interface PaginationParams {
    page: number;
    limit: number;
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export interface PaginatedResult<T> {
    data: T[];
    pagination: PaginationMeta;
}

export const parsePaginationParams = (
    pageStr?: string,
    limitStr?: string
): PaginationParams => {
    const page = Math.max(1, parseInt(pageStr || '1', 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(limitStr || '20', 10) || 20));
    return { page, limit };
};

export const buildPaginationMeta = (
    page: number,
    limit: number,
    total: number
): PaginationMeta => {
    const totalPages = Math.ceil(total / limit);
    return {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
    };
};

export const getPrismaSkipTake = (page: number, limit: number) => ({
    skip: (page - 1) * limit,
    take: limit,
});
