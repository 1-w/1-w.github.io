/**
 * Surface distance: a point's distance along the brain surface from the nearest ripple seed.
 * Model: the gltf meshes are fragmented, so the surface is a radius graph over the wm vertices:
 * an edge joins two vertices closer than GRAPH_RADIUS, with their distance as weight.
 * Multi-source Dijkstra from the ripple seeds gives each reached vertex its distance
 * (`surfaceDistances`). Every point then takes the distance of the nearest reached vertex plus
 * the gap to it (`extendSurfaceDistance`).
 */

export type Vec3 = readonly [number, number, number];

/** Largest gap (mm) between two wm vertices that the graph joins. */
export const GRAPH_RADIUS = 1.5;
/** Largest gap (mm) from a point to the nearest reached wm vertex; a farther point gets no ripple. */
export const MAX_GAP = 10;
/** Ripple seeds as fractions of the wm bbox: left and right, front and back, at the height of the camera path. */
export const RIPPLE_SEEDS: readonly Vec3[] = [
  [0.3, 0.35, 0.6],
  [0.7, 0.35, 0.6],
  [0.3, 0.7, 0.6],
  [0.7, 0.7, 0.6],
];

/** Cell size (mm) of the grid for the nearest search in `extendSurfaceDistance`. */
const NEAREST_CELL = 2;
/** Cells per axis in a grid key, centred on the grid origin. */
const KEY_CELLS = 2 ** 16;

/** Points of a stride-3 cloud, bucketed into cubic cells of size `cell` from `min`. */
interface Grid {
  readonly points: Float32Array;
  readonly cell: number;
  readonly min: Vec3;
  readonly buckets: ReadonlyMap<number, readonly number[]>;
}

/** Binary min-heap of items by key. */
interface Heap {
  readonly keys: number[];
  readonly items: number[];
}

interface Search {
  readonly grid: Grid;
  readonly radius: number;
  readonly distances: Float64Array;
  readonly heap: Heap;
}

function pointAt(points: Float32Array, i: number): Vec3 {
  return [points[i * 3], points[i * 3 + 1], points[i * 3 + 2]];
}

function gapTo(points: Float32Array, i: number, p: Vec3): number {
  return Math.hypot(points[i * 3] - p[0], points[i * 3 + 1] - p[1], points[i * 3 + 2] - p[2]);
}

function cellOf(grid: Grid, p: Vec3): Vec3 {
  const { cell, min } = grid;
  return [Math.floor((p[0] - min[0]) / cell), Math.floor((p[1] - min[1]) / cell), Math.floor((p[2] - min[2]) / cell)];
}

function cellKey([x, y, z]: Vec3): number {
  const half = KEY_CELLS / 2;
  return ((x + half) * KEY_CELLS + (y + half)) * KEY_CELLS + (z + half);
}

/** A grid over the `members` of `points`. */
function createGrid(points: Float32Array, members: ArrayLike<number>, cell: number): Grid {
  const min: [number, number, number] = members.length === 0 ? [0, 0, 0] : [Infinity, Infinity, Infinity];
  for (let k = 0; k < members.length; k++) {
    for (let axis = 0; axis < 3; axis++) {
      min[axis] = Math.min(min[axis], points[members[k] * 3 + axis]);
    }
  }
  const buckets = new Map<number, number[]>();
  const grid: Grid = { points, cell, min, buckets };
  for (let k = 0; k < members.length; k++) {
    const key = cellKey(cellOf(grid, pointAt(points, members[k])));
    const bucket = buckets.get(key);
    if (bucket === undefined) {
      buckets.set(key, [members[k]]);
    } else {
      bucket.push(members[k]);
    }
  }
  return grid;
}

/** Indices in the cells whose largest per-axis offset from the cell of `p` is `ring`. */
function ringMembers(grid: Grid, p: Vec3, ring: number): number[] {
  const [cx, cy, cz] = cellOf(grid, p);
  const out: number[] = [];
  for (let dx = -ring; dx <= ring; dx++) {
    for (let dy = -ring; dy <= ring; dy++) {
      for (let dz = -ring; dz <= ring; dz++) {
        const bucket = Math.max(Math.abs(dx), Math.abs(dy), Math.abs(dz)) === ring
          ? grid.buckets.get(cellKey([cx + dx, cy + dy, cz + dz]))
          : undefined;
        out.push(...(bucket ?? []));
      }
    }
  }
  return out;
}

function push(heap: Heap, item: number, key: number): void {
  let i = heap.keys.length;
  heap.keys.push(key);
  heap.items.push(item);
  while (i > 0 && heap.keys[(i - 1) >> 1] > key) {
    const parent = (i - 1) >> 1;
    heap.keys[i] = heap.keys[parent];
    heap.items[i] = heap.items[parent];
    i = parent;
  }
  heap.keys[i] = key;
  heap.items[i] = item;
}

/** Removes the item with the smallest key and returns it. The heap must not be empty. */
function popMin(heap: Heap): number {
  const top = heap.items[0];
  const key = heap.keys.pop() as number;
  const item = heap.items.pop() as number;
  const size = heap.keys.length;
  let i = 0;
  while (size > 0) {
    const left = 2 * i + 1;
    const child = left + 1 < size && heap.keys[left + 1] < heap.keys[left] ? left + 1 : left;
    if (child >= size || heap.keys[child] >= key) {
      break;
    }
    heap.keys[i] = heap.keys[child];
    heap.items[i] = heap.items[child];
    i = child;
  }
  if (size > 0) {
    heap.keys[i] = key;
    heap.items[i] = item;
  }
  return top;
}

/** Index of the point nearest to `target`. `points` must not be empty. */
function nearestIndex(points: Float32Array, target: Vec3): number {
  let best = 0;
  for (let i = 1; i < points.length / 3; i++) {
    if (gapTo(points, i, target) < gapTo(points, best, target)) {
      best = i;
    }
  }
  return best;
}

/** Lowers the distance of each neighbour of `i` to which `i` gives a shorter path. */
function relaxNeighbours(search: Search, i: number): void {
  const { points } = search.grid;
  const p = pointAt(points, i);
  for (const j of [...ringMembers(search.grid, p, 0), ...ringMembers(search.grid, p, 1)]) {
    const gap = gapTo(points, j, p);
    const candidate = search.distances[i] + gap;
    if (gap <= search.radius && candidate < search.distances[j]) {
      search.distances[j] = candidate;
      push(search.heap, j, candidate);
    }
  }
}

/**
 * Distance of each point along the graph that joins points closer than `radius`, from the
 * nearest seed. Each seed first moves to the nearest point. Infinity if a point is not reached.
 */
export function surfaceDistances(points: Float32Array, seeds: readonly Vec3[], radius: number): Float64Array {
  const count = points.length / 3;
  const all = Uint32Array.from({ length: count }, (_, i) => i);
  const search: Search = {
    grid: createGrid(points, all, radius),
    radius,
    distances: new Float64Array(count).fill(Infinity),
    heap: { keys: [], items: [] },
  };
  for (const seed of count > 0 ? seeds : []) {
    const start = nearestIndex(points, seed);
    search.distances[start] = 0;
    push(search.heap, start, 0);
  }
  while (search.heap.items.length > 0) {
    const key = search.heap.keys[0];
    const i = popMin(search.heap);
    if (key <= search.distances[i]) {
      relaxNeighbours(search, i);
    }
  }
  return search.distances;
}

/** Distance of the grid point nearest to `p` within `maxGap`, plus the gap; Infinity if there is none. */
function extendedDistance(grid: Grid, graphDistance: Float64Array, p: Vec3, maxGap: number): number {
  let best = -1;
  let bestGap = Infinity;
  const lastRing = Math.ceil(maxGap / grid.cell);
  // A cell at ring r is at least (r - 1) * cell away from p.
  for (let ring = 0; ring <= lastRing && bestGap > (ring - 1) * grid.cell; ring++) {
    for (const j of ringMembers(grid, p, ring)) {
      const gap = gapTo(grid.points, j, p);
      if (gap < bestGap) {
        best = j;
        bestGap = gap;
      }
    }
  }
  return bestGap <= maxGap ? graphDistance[best] + bestGap : Infinity;
}

/**
 * For each point: the distance of the nearest `graph` vertex with a finite `graphDistance`,
 * plus the gap to it. Infinity if no such vertex lies within `maxGap`.
 */
export function extendSurfaceDistance(
  points: Float32Array,
  graph: Float32Array,
  graphDistance: Float64Array,
  maxGap: number,
): Float64Array {
  const reached: number[] = [];
  for (let i = 0; i < graphDistance.length; i++) {
    if (Number.isFinite(graphDistance[i])) {
      reached.push(i);
    }
  }
  const grid = createGrid(graph, reached, NEAREST_CELL);
  const out = new Float64Array(points.length / 3);
  for (let i = 0; i < out.length; i++) {
    out[i] = extendedDistance(grid, graphDistance, pointAt(points, i), maxGap);
  }
  return out;
}
