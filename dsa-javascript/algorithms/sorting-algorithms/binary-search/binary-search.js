function BinarySearch(array,target){
    let left=0;
    let right=array.length-1;
    while(left<=right){
        mid=Math.floor(left+right)/2;
        if(array[mid]===target){
            return mid
        };
        if(array[mid]<target){
            left=mid+1
        }else{
            right=mid-1
        }
    };
    return -1;
};

function binarySearchRecursive(array, target, left = 0, right = array.length - 1) {

    // Base condition
    if (left > right) {
        return -1;
    }

    let mid = Math.floor((left + right) / 2);

    // Target found
    if (array[mid] === target) {
        return mid;
    }

    // Search right half
    if (array[mid] < target) {
        return binarySearchRecursive(array, target, mid + 1, right);
    }

    // Search left half
    return binarySearchRecursive(array, target, left, mid - 1);
}