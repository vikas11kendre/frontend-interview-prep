class Node {
    constructor(value) {
        this.value = value;
        this.left = null;
        this.right = null;
    }
}

class BinaryTree {
    constructor() {
        this.root = null;
    }

    insert(value) {
        const newNode = new Node(value);
        if (!this.root) { this.root = newNode; return; }

        let current = this.root;
        while (current) {
            if (value < current.value) {
                if (!current.left) { current.left = newNode; return; }
                current = current.left;
            } else {
                if (!current.right) { current.right = newNode; return; }
                current = current.right;
            }
        }
    }

    getHeight(node = this.root) {
        if (!node) return 0;
        return 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));
    }

    printTree() {
        if (!this.root) return console.log("Tree is empty");

        const height = this.getHeight();
        const levels = [];

        // Collect all levels including nulls for spacing
        this._fillLevels(this.root, 0, levels, height);

        // Each value is printed in a fixed-width cell
        // Bottom level has cells of width 4 (enough for 2-digit numbers)
        const cellWidth = 4;
        const bottomWidth = Math.pow(2, height - 1) * cellWidth;

        const lines = [];

        for (let i = 0; i < height; i++) {
            const level = levels[i];
            const nodesInLevel = Math.pow(2, i);
            const gap = bottomWidth / nodesInLevel;

            // Value line
            let valueLine = "";
            for (let j = 0; j < level.length; j++) {
                const val = level[j] !== null ? String(level[j]) : "";
                const pos = gap * j + gap / 2;
                // Pad valueLine to reach pos, then center the value
                while (valueLine.length < pos - Math.floor(val.length / 2)) {
                    valueLine += " ";
                }
                valueLine += val;
            }
            lines.push(valueLine);

            // Branch lines (draw / and \ connecting to children)
            if (i < height - 1) {
                const childGap = bottomWidth / Math.pow(2, i + 1);
                // Draw multiple rows of branches for better visual
                const branchRows = Math.max(1, Math.floor(childGap / 4));

                for (let r = 1; r <= branchRows; r++) {
                    let branchLine = "";
                    for (let j = 0; j < level.length; j++) {
                        const parentCenter = gap * j + gap / 2;
                        const leftPos = parentCenter - r;
                        const rightPos = parentCenter + r;

                        if (level[j] !== null) {
                            // Check if left child exists
                            const leftChild = levels[i + 1] && levels[i + 1][j * 2] !== null;
                            const rightChild = levels[i + 1] && levels[i + 1][j * 2 + 1] !== null;

                            if (leftChild) {
                                while (branchLine.length < leftPos) branchLine += " ";
                                branchLine += "/";
                            }
                            if (rightChild) {
                                while (branchLine.length < rightPos) branchLine += " ";
                                branchLine += "\\";
                            }
                        }
                    }
                    lines.push(branchLine);
                }
            }
        }

        console.log("\n" + lines.join("\n") + "\n");
    }

    _fillLevels(node, level, levels, maxHeight) {
        if (level === maxHeight) return;
        if (!levels[level]) levels[level] = [];

        if (node) {
            levels[level].push(node.value);
            this._fillLevels(node.left, level + 1, levels, maxHeight);
            this._fillLevels(node.right, level + 1, levels, maxHeight);
        } else {
            levels[level].push(null);
            this._fillLevels(null, level + 1, levels, maxHeight);
            this._fillLevels(null, level + 1, levels, maxHeight);
        }
    }
    // BFS
    find(value) {
        if (!this.root) return false;
        const queue = [this.root];
        const visited = [];
        while (queue.length) {
            const front = queue.shift();
            visited.push(front.value);
            if (front.value === value) return true;
            if (front.left) queue.push(front.left);
            if (front.right) queue.push(front.right);
        }
        return false;
    };
    findDFS(value){
        if(!this.root) return false;
        let queue=[];
        let stack=[];
        let visited=[]
        if(!queue.length){
            queue.push(this.root);
        };
        while(queue.length || stack.length){
            if(queue.length){
                let front=queue.shift();
                     visited.push(front.value)
                if(front.value===value){
                                   console.log(visited)

                    return true
                }else{
                    if(front.left){
                        queue.push(front.left);
                    }
                     if(front.right){
                        stack.push(front.right)
                    };
                }
            }else if(stack.length){
                let last=stack.pop();
                queue.push(last)
            }
            
        }
        console.log(visited)

        return false
    }//

    dfsPreOrder(value){
        var data=[];
        function traverse(node){
            data.push(node.value);
            if(node.left) traverse(node.left);
            if(node.right) traverse(node.right);
        };
        traverse(this.root);
        return data;
    };
    
    dfsPostOrder(value){
        var data=[];
        function traverse(node){
            if(node.left) traverse(node.left);
            if(node.right) traverse(node.right);
           data.push(node.value)

        };
        traverse(this.root);
        return data;
    };
    dfsInOrder(value){
        var data=[];
        function traverse(node){
            if(node.left) traverse(node.left);
            data.push(node.value)

            if(node.right) traverse(node.right);

        };
        traverse(this.root);
        return data;
    };
}

let tree = new BinaryTree();
const values = [10, 5, 15, 2, 7, 12, 20, 1, 3, 6, 8, 11, 13, 18, 25];
values.forEach(v => tree.insert(v));
tree.printTree();
console.log(tree.findDFS())// 
console.log(tree.dfsPostOrder())

console.log(tree.dfsPreOrder())//

console.log(tree.dfsInOrder())


// data=[10,5,2,1,3,7,6,8,15,12,11,13,20,18,25]