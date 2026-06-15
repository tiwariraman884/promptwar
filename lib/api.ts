import { NextResponse } from "next/server";

/* ─── Types ─── */

export type ApiSuccess<T> = {
  success: true;
  data: T;
  error: null;
};

export type ApiFailure = {
  success: false;
  data: null;
  error: string;
};

export type ApiPaginated<T> = ApiSuccess<T> & {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

/* ─── Helpers ─── */

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json<ApiSuccess<T>>(
    { success: true, data, error: null },
    { status }
  );
}

export function apiPaginated<T>(
  data: T,
  pagination: { page: number; limit: number; total: number },
  status = 200
) {
  return NextResponse.json<ApiPaginated<T>>(
    {
      success: true,
      data,
      error: null,
      pagination: {
        ...pagination,
        totalPages: Math.ceil(pagination.total / pagination.limit),
      },
    },
    { status }
  );
}

export function apiError(error: string, status = 400) {
  return NextResponse.json<ApiFailure>(
    { success: false, data: null, error },
    { status }
  );
}
