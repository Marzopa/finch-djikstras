let rows = 0
let cols = 0
let node = ""
let directions: number[][] = []
let dr = 0
let dc = 0
let nextRow = 0
let nextCol = 0
let neighbor = ""
let cost = 0
function gridToGraph (grid: any[]) {
    rows = grid.length
    cols = grid[0].length
    let graph: { [key: string]: [string, number][] } = {};
for (let r = 0; r <= rows - 1; r++) {
        for (let c = 0; c <= cols - 1; c++) {
            if (grid[r][c] == 9) {
                continue;
            }
            node = "" + r + "," + c
            graph[node] = []
            // Up
            // Down
            // Left
            // Right
            directions = [
            [-1, 0],
            [1, 0],
            [0, -1],
            [0, 1]
            ]
            for (let i = 0; i <= directions.length - 1; i++) {
                dr = directions[i][0]
                dc = directions[i][1]
                nextRow = r + dr
                nextCol = c + dc
                if (nextRow >= 0 && nextRow < rows && nextCol >= 0 && nextCol < cols && grid[nextRow][nextCol] != 9) {
                    neighbor = "" + nextRow + "," + nextCol
                    cost = grid[nextRow][nextCol]
                    graph[node].push([neighbor, cost])
                }
            }
        }
    }
    return graph
}
