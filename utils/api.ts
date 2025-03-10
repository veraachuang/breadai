import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@/server/api/root';
import { inferRouterInputs, inferRouterOutputs } from '@trpc/server';

export const api = createTRPCReact<AppRouter>();

/**
 * Inference helper for inputs.
 *
 * @example type HelloInput = RouterInputs['example']['hello']
 */
export type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Inference helper for outputs.
 *
 * @example type HelloOutput = RouterOutputs['example']['hello']
 */
export type RouterOutputs = inferRouterOutputs<AppRouter>; 