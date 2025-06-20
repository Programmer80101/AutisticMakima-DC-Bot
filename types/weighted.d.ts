declare module "weighted" {
  function select<T>(
    items: readonly T[],
    weights?: readonly number[],
    opts?: { rand?: () => number; normal?: boolean; total?: number }
  ): T;
  export default select;
}
