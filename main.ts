/******************************************************
 * PART 0: Global stubs & utilities
 ******************************************************/

// Replace these with your Finch Robot APIs
async function moveCell(): Promise<void> {
    // Stub: Move 1 cell forward
    console.log("moveCell() called");
}

async function turnRight(): Promise<void> {
    // Stub: Turn robot 90° right
    console.log("turnRight() called");
}

async function turnLeft(): Promise<void> {
    // Stub: Turn robot 90° left
    console.log("turnLeft() called");
}

/** 
 * Stub for distance sensor reading. 
 * Return -1 if no obstacle or a number representing distance in mm. 
 */
function getDistance(): number {
    // Stub: Return fake distance sensor reading
    return -1; // -1 → no obstacle detected
}

/** Helper to convert row/col to string keys for object maps */
function nodeKey(r: number, c: number): string {
    return `${r},${c}`;
}

/** Helper to parse string keys back into [row, col] arrays */
function parseKey(k: string): [number, number] {
    const parts = k.split(",");
    return [parseInt(parts[0]), parseInt(parts[1])];
}

/******************************************************
 * PART 1: Abstract real-world data into a graph
 ******************************************************/

type Graph = {
    [key: string]: Array<[string, number]>;
};

function gridToGraph(grid: number[][]): Graph {
    const rows = grid.length;
    const cols = grid[0].length;
    const graph: Graph = {};

    const directions: Array<[number, number]> = [
        [-1, 0], // Up
        [1, 0],  // Down
        [0, -1], // Left
        [0, 1]   // Right
    ];

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            // Skip barriers
            if (grid[r][c] === 9) {
                continue;
            }

            // Current node key
            const currentKey = nodeKey(r, c);
            graph[currentKey] = [];

            // Check neighbors
            for (const [dr, dc] of directions) {
                const nr = r + dr;
                const nc = c + dc;
                if (
                    nr >= 0 && nr < rows &&
                    nc >= 0 && nc < cols &&
                    grid[nr][nc] !== 9
                ) {
                    const neighborKey = nodeKey(nr, nc);
                    const cost = grid[nr][nc];
                    graph[currentKey].push([neighborKey, cost]);
                }
            }
        }
    }

    return graph;
}

/******************************************************
 * PART 2: Dijkstra's Algorithm
 ******************************************************/

type DijkstraResult = {
    path: Array<[number, number]>;
    cost: number;
};

function dijkstra(
    graph: Graph,
    start: [number, number],
    end: [number, number]
): DijkstraResult {
    // Convert start/end nodes to keys
    const startKey = nodeKey(start[0], start[1]);
    const endKey = nodeKey(end[0], end[1]);

    // Priority queue (cost, nodeKey)
    const pq: Array<[number, string]> = [];
    pq.push([0, startKey]);

    // Distances map: nodeKey -> cost
    const distances: { [key: string]: number } = {};
    for (const node in graph) {
        distances[node] = Infinity;
    }
    distances[startKey] = 0;

    // Path reconstruction map: nodeKey -> came_from(nodeKey)
    const cameFrom: { [key: string]: string } = {};

    while (pq.length > 0) {
        // Pop the smallest-cost item
        pq.sort((a, b) => a[0] - b[0]);
        const [currentCost, currentNodeKey] = pq.shift()!;

        // If reached target, stop
        if (currentNodeKey === endKey) {
            break;
        }

        // For each neighbor
        for (const [neighborKey, weight] of graph[currentNodeKey]) {
            const newCost = currentCost + weight;
            if (newCost < distances[neighborKey]) {
                distances[neighborKey] = newCost;
                cameFrom[neighborKey] = currentNodeKey;
                pq.push([newCost, neighborKey]);
            }
        }
    }

    // Reconstruct path
    const path: Array<[number, number]> = [];
    let node = endKey;
    while (cameFrom[node] !== undefined) {
        path.push(parseKey(node));
        node = cameFrom[node];
    }
    path.push(parseKey(startKey));
    path.reverse();

    return {
        path: path,
        cost: distances[endKey]
    };
}

/******************************************************
 * PART 3: Robot Movement
 ******************************************************/

/**
 * Moves the Finch one cell forward (no color logic).
 */
async function moveOneCell(): Promise<void> {
    // Stub call (1 cell forward)
    await moveCell();
}

/**
 * Moves the Finch along a path of grid cells.
 * Returns an index if blocked and needs recalculation, 
 * or undefined if completed.
 */
async function moveRobot(path: Array<[number, number]>): Promise<number | undefined> {
    if (path.length < 2) {
        console.log("Path is too short to move.");
        return;
    }

    // Current heading (rowDelta, colDelta), e.g. (0,1) = facing right
    let currentDirection: [number, number] = [0, 1];

    for (let i = 0; i < path.length - 1; i++) {
        const currentPos = path[i];
        const nextPos = path[i + 1];
        const moveDirection: [number, number] = [
            nextPos[0] - currentPos[0],
            nextPos[1] - currentPos[1]
        ];

        // Check if we need to turn
        if (
            moveDirection[0] !== currentDirection[0] ||
            moveDirection[1] !== currentDirection[1]
        ) {
            // Determine turn logic
            const facingRightToDown =
                currentDirection[0] === 0 && currentDirection[1] === 1 &&
                moveDirection[0] === 1 && moveDirection[1] === 0;
            const facingDownToLeft =
                currentDirection[0] === 1 && currentDirection[1] === 0 &&
                moveDirection[0] === 0 && moveDirection[1] === -1;
            const facingLeftToUp =
                currentDirection[0] === 0 && currentDirection[1] === -1 &&
                moveDirection[0] === -1 && moveDirection[1] === 0;
            const facingUpToRight =
                currentDirection[0] === -1 && currentDirection[1] === 0 &&
                moveDirection[0] === 0 && moveDirection[1] === 1;

            const facingRightToUp =
                currentDirection[0] === 0 && currentDirection[1] === 1 &&
                moveDirection[0] === -1 && moveDirection[1] === 0;
            const facingUpToLeft =
                currentDirection[0] === -1 && currentDirection[1] === 0 &&
                moveDirection[0] === 0 && moveDirection[1] === -1;
            const facingLeftToDown =
                currentDirection[0] === 0 && currentDirection[1] === -1 &&
                moveDirection[0] === 1 && moveDirection[1] === 0;
            const facingDownToRight =
                currentDirection[0] === 1 && currentDirection[1] === 0 &&
                moveDirection[0] === 0 && moveDirection[1] === 1;

            const isOppositeDirection =
                moveDirection[0] === -currentDirection[0] &&
                moveDirection[1] === -currentDirection[1];

            // Turn right
            if (
                facingRightToDown || facingDownToLeft ||
                facingLeftToUp || facingUpToRight
            ) {
                await turnRight();
            }
            // Turn left
            else if (
                facingRightToUp || facingUpToLeft ||
                facingLeftToDown || facingDownToRight
            ) {
                await turnLeft();
            }
            // 180° turn
            else if (isOppositeDirection) {
                await turnRight();
                await turnRight();
            }

            currentDirection = moveDirection; // update heading
        }

        // Check for obstacle
        const distanceReading = getDistance();
        if (distanceReading >= 200 || distanceReading === -1) {
            // Move if clear
            await moveOneCell();
        } else {
            // Obstruction
            console.log("Obstruction detected, recalculating...");
            // Realign to face right (0,1) if needed (simplified logic)
            if (!(currentDirection[0] === 0 && currentDirection[1] === 1)) {
                // Example: just reorient to right
                if (currentDirection[0] === -1 && currentDirection[1] === 0) {
                    await turnRight();
                } else if (currentDirection[0] === 1 && currentDirection[1] === 0) {
                    await turnLeft();
                } else {
                    await turnRight();
                    await turnRight();
                }
            }
            return i; // Return index where it stopped
        }
    }

    console.log("Path completed!");
    return undefined;
}

/******************************************************
 * PART 4: Main
 ******************************************************/

async function main() {
    // PART 1: Build the grid & graph
    const grid: number[][] = [
        [0, 1, 1, 9, 1, 1, 1, 3, 1],
        [1, 9, 1, 9, 1, 9, 1, 3, 1],
        [5, 9, 1, 9, 1, 9, 1, 3, 1],
        [6, 9, 1, 9, 1, 9, 1, 3, 1],
        [2, 9, 1, 1, 1, 9, 1, 3, 3],
        [2, 9, 9, 9, 9, 9, 1, 1, 1],
        [3, 5, 2, 6, 1, 4, 3, 2, 1]
    ];
    const graph = gridToGraph(grid);

    // PART 2: Solve for the shortest path
    const start: [number, number] = [0, 0];
    const end: [number, number] = [6, 8];
    let { path: shortestPath, cost } = dijkstra(graph, start, end);
    console.log("Initial shortest path:" + shortestPath + "cost:"+ cost);

    // PART 3: Implement the motion along that path
    let result = await moveRobot(shortestPath);

    // If obstacle encountered, recalc from partial path
    while (result !== undefined) {
        // Block that cell on the grid
        const blockedRow = shortestPath[result + 1][0];
        const blockedCol = shortestPath[result + 1][1];
        grid[blockedRow][blockedCol] = 9; // Barrier

        // Re-run Dijkstra from that point
        const newStart: [number, number] = shortestPath[result];
        const updatedGraph = gridToGraph(grid);
        const dRes = dijkstra(updatedGraph, newStart, end);
        shortestPath = dRes.path;
        cost = dRes.cost;
        console.log("Recalculated shortest path:" + shortestPath+ "cost:" + cost);

        // Attempt the new path
        result = await moveRobot(shortestPath);
    }

    console.log("All done!");
}

// Run
main();
