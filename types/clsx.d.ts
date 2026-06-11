declare module "clsx" {
  export type ClassValue =
    | string
    | number
    | null
    | boolean
    | undefined
    | ClassValue[]
    | { [key: string]: boolean };

  export default function clsx(...inputs: ClassValue[]): string;
}
