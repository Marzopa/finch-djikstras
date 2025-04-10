namespace finchDijkstra {

    // ----------------------------------------------
    // Global Variables
    // ----------------------------------------------
    let grid: number[][] = []
    let path: string[] = [] // we'll store a path as ["row,col", "row,col", ...]

    // Stubs: replace with real Finch calls
    function moveForward(): void {
        finch.setMove(MoveDir.Forward, 15, 100)
        console.log("Moving forward 1 cell")
    }
    function turnLeft(): void {
        finch.setTurn(RLDir.Left, 90, 100)
        console.log("Turning left 90 degrees")
    }
    function turnRight(): void {
        finch.setTurn(RLDir.Right, 90, 100)
        console.log("Turning right 90 degrees")
    }

    // ----------------------------------------------
    // BLOCK 1: Initialize the Grid
    // ----------------------------------------------
    //% blockId="FD_initGrid" block="Initialize the grid"
    export function initGrid(): void {
        // Example grid with 7 rows and 9 columns
        // 0 = open, 9 = barrier
        grid = [
            [0, 0, 0, 9, 0, 0, 0, 0, 0],
            [0, 9, 0, 9, 0, 9, 0, 0, 0],
            [0, 9, 0, 9, 0, 9, 0, 0, 0],
            [0, 9, 0, 9, 0, 9, 0, 0, 0],
            [0, 9, 0, 0, 0, 9, 0, 0, 0],
            [0, 9, 9, 9, 9, 9, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0]
        ]
        path = [] // reset
        console.log("Grid initialized")
    }

    // ----------------------------------------------
    // Helper Functions for BFS
    // ----------------------------------------------
    function posToString(r: number, c: number): string {
        return r + "," + c
    }
    function stringToPos(pos: string): [number, number] {
        let parts = pos.split(",")
        let rr = parseInt(parts[0])
        let cc = parseInt(parts[1])
        return [rr, cc]
    }

    // 4 directions: up, down, left, right
    let directions = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1]
    ]

    // ----------------------------------------------
    // BLOCK 2: Compute BFS Path
    // ----------------------------------------------
    //% blockId="FD_computePath" block="Compute path from row $startR col $startC to row $endR col $endC"
    export function computePath(startR: number, startC: number, endR: number, endC: number): void {
        let rows = grid.length
        if (rows === 0) {
            console.log("Grid is empty, call initGrid first")
            return
        }
        let cols = grid[0].length

        // visited array
        let visited: boolean[][] = []
        for (let i = 0; i < rows; i++) {
            visited.push([])
            for (let j = 0; j < cols; j++) {
                visited[i][j] = false
            }
        }

        // cameFrom to reconstruct the path
        let cameFrom: { [key: string]: string } = {}

        // BFS queue using two pointers (no shift usage)
        let queue: string[] = []
        let front = 0 // index of next item

        // Start
        let startPos = posToString(startR, startC)
        queue.push(startPos)
        visited[startR][startC] = true

        let found = false
        while (front < queue.length) {
            let currentPosStr = queue[front]
            front++
            let currentRC = stringToPos(currentPosStr)
            let cr = currentRC[0]
            let cc2 = currentRC[1]

            // Check if we've reached the end
            if (cr === endR && cc2 === endC) {
                found = true
                break
            }

            // Explore neighbors
            for (let d = 0; d < directions.length; d++) {
                let rr2 = cr + directions[d][0]
                let cc22 = cc2 + directions[d][1]
                if (rr2 >= 0 && rr2 < rows && cc22 >= 0 && cc22 < cols) {
                    if (grid[rr2][cc22] !== 9 && !visited[rr2][cc22]) {
                        visited[rr2][cc22] = true
                        let neighborStr = posToString(rr2, cc22)
                        cameFrom[neighborStr] = currentPosStr
                        queue.push(neighborStr)
                    }
                }
            }
        }

        // Reconstruct path if found
        path = []
        if (found) {
            let endPos = posToString(endR, endC)
            let node = endPos
            // Instead of "while (node in cameFrom)", do a simpler check:
            while (cameFrom[node]) {
                path.push(node)
                node = cameFrom[node]
            }
            // Add start
            path.push(startPos)
            // Reverse
            let reversed: string[] = []
            for (let k = path.length - 1; k >= 0; k--) {
                reversed.push(path[k])
            }
            path = reversed
            console.log("Path found with BFS. Steps: " + path.length)
        } else {
            console.log("No path found with BFS.")
        }
    }

    // ----------------------------------------------
    // BLOCK 3: Move Robot Along the Path
    // ----------------------------------------------
    //% blockId="FD_moveRobot" block="Move robot along path"
    export function moveRobot(): void {
        if (path.length < 2) {
            console.log("Path is too short or not computed.")
            return
        }

        // Start facing "down" for example
        //  (rowDelta, colDelta)
        let currentDir: [number, number] = [1, 0]

        for (let l = 0; l < path.length - 1; l++) {
            let thisPos = stringToPos(path[l])
            let nextPos = stringToPos(path[l + 1])

            let moveDir: [number, number] = [
                nextPos[0] - thisPos[0],
                nextPos[1] - thisPos[1]
            ]

            // If moveDir != currentDir, we turn
            if (moveDir[0] !== currentDir[0] || moveDir[1] !== currentDir[1]) {
                // naive approach to guess left vs right turn
                if (
                    (currentDir[0] === 1 && moveDir[1] === 1) ||
                    (currentDir[1] === 1 && moveDir[0] === -1) ||
                    (currentDir[0] === -1 && moveDir[1] === -1) ||
                    (currentDir[1] === -1 && moveDir[0] === 1)
                ) {
                    turnRight()
                } else {
                    turnLeft()
                }
                currentDir = moveDir
            }

            // move forward
            moveForward()
        }

        console.log("Path movement complete.")
    }
}
