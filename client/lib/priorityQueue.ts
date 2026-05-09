// ============================================================
// MIN-HEAP PRIORITY QUEUE
// Used in real OS schedulers, hospital triage, network QoS.
// Time complexity: insert O(log n), extractMin O(log n)
// ============================================================

export type AlertPriority = "critical" | "high" | "medium" | "low";

const PRIORITY_MAP: Record<AlertPriority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

interface HeapNode<T> {
  priority: number;
  item: T;
  insertOrder: number; // tie-breaker
}

export class MinHeapPriorityQueue<T> {
  private heap: HeapNode<T>[] = [];
  private counter = 0;

  get size(): number {
    return this.heap.length;
  }

  get isEmpty(): boolean {
    return this.heap.length === 0;
  }

  /** Insert an item with a numeric priority (lower = higher priority). */
  insert(item: T, priority: number): void {
    this.heap.push({ priority, item, insertOrder: this.counter++ });
    this._bubbleUp(this.heap.length - 1);
  }

  /** Insert using named alert priority level. */
  insertWithLevel(item: T, level: AlertPriority): void {
    this.insert(item, PRIORITY_MAP[level]);
  }

  /** Remove and return the highest-priority (lowest number) item. */
  extractMin(): T | undefined {
    if (this.heap.length === 0) return undefined;
    const min = this.heap[0].item;
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this._sinkDown(0);
    }
    return min;
  }

  peek(): T | undefined {
    return this.heap[0]?.item;
  }

  /** Return all items sorted by priority without modifying the heap. */
  toSortedArray(): T[] {
    return [...this.heap]
      .sort((a, b) => a.priority - b.priority || a.insertOrder - b.insertOrder)
      .map((n) => n.item);
  }

  clear(): void {
    this.heap = [];
    this.counter = 0;
  }

  private _bubbleUp(idx: number): void {
    while (idx > 0) {
      const parent = Math.floor((idx - 1) / 2);
      if (this._compare(parent, idx) <= 0) break;
      this._swap(parent, idx);
      idx = parent;
    }
  }

  private _sinkDown(idx: number): void {
    const n = this.heap.length;
    while (true) {
      let smallest = idx;
      const l = 2 * idx + 1;
      const r = 2 * idx + 2;
      if (l < n && this._compare(l, smallest) < 0) smallest = l;
      if (r < n && this._compare(r, smallest) < 0) smallest = r;
      if (smallest === idx) break;
      this._swap(smallest, idx);
      idx = smallest;
    }
  }

  private _compare(a: number, b: number): number {
    const pa = this.heap[a].priority;
    const pb = this.heap[b].priority;
    if (pa !== pb) return pa - pb;
    return this.heap[a].insertOrder - this.heap[b].insertOrder;
  }

  private _swap(a: number, b: number): void {
    [this.heap[a], this.heap[b]] = [this.heap[b], this.heap[a]];
  }
}

export { PRIORITY_MAP };
