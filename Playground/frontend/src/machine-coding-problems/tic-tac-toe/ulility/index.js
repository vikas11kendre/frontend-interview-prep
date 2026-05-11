

export function getGridList(size) {
    return Array.from({ length: size * size }, (_, i) => (""))
};
export function getWinner(resultArray, gridList) {
    for (const line of resultArray) {
        const first = gridList[line[0]];
        if (first === "") continue;
        if (line.every(idx => gridList[idx] === first)) {
            return first;
        }
    }
    return undefined;
}

function getWinnerRows(size){
    let rows=[];
    for(let row=0; row<size;row++){
        let arr=[];
        for(let col=0;col<size;col++){
            arr.push(row*size+col)
        };
        rows.push(arr)    
    };
    return rows

}
function getWinnerColumns(size){
        let cols=[];
    for(let col=0; col<size;col++){
        let arr=[];
        for(let row=0;row<size;row++){
            arr.push(row*size+col)
        };
        cols.push(arr)    
    };
    return cols
}

function getWinnerDiagonal(size){
    let diagonal=[];
    let left=[];
    let right=[];
    for(let i=0;i<size;i++){
        left.push(i*size+i)
    };
    let i=0,j=size-1;
    while(i<size&& j>=0){
        right.push(i*size+j);
        i++;
        j--;
    };
    diagonal.push(left);
    diagonal.push(right);
    return diagonal
}
export function getResultArray(size){
    let checkList = [...getWinnerRows(size),...getWinnerColumns(size),...getWinnerDiagonal(size)];
    return checkList
}
export function isDraw(gridList) {
    return gridList.every(cell => cell !== "");
}
