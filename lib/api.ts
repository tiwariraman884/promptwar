import { NextResponse } from "next/server";

export type ApiSuccess<T> = {
  data: T;
  error: null;
};

export type ApiFailure = {
  data: null;
  error: string;
};

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json<ApiSuccess<T>>({ data, error: null }, { status });
}

export function apiError(error: string, status = 400) {
  return NextResponse.json<ApiFailure>({ data: null, error }, { status });
}
