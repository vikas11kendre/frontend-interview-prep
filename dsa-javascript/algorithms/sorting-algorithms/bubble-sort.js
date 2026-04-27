// let a =[9,4,6,2,6,7,1];
// let b =[1,2,3,4,5,6,7,8];


// function bubbleSort(array){
//     for(let i=0;i<array.length;i++){
//         let sorted=true;
//         for(let j=0; j<array.length-i-1; j++){
//             if(array[j]>array[j+1]){
//                 [array[j],array[j+1]]=[array[j+1],array[j]];
//                 sorted=false;
//             }
//         }
//         if(sorted){
//             return array
//         }
//     }
//     return array;
// }

// console.log(bubbleSort(b)) 
// Time: O(n²) worst/avg | O(n) best (with sorted flag)
// Space: O(1) — in-place


// let a =[9,4,6,2,6,7,1];

// function SelectionSort(array){
// if(array.length<=1) return array;
//     let i=0;
//     let min
//     while(i<array.length){
//          min=i;
//         for(let j=i+1;j<array.length;j++){
//             if(array[min]>array[j]){
//                 min=j;
//             }
//         };
//         if (i !== min){
//         [array[i],array[min]]=[array[min],array[i]];

//         }
//         i++;
//     }
//     return array
// };

// console.log(SelectionSort(a))



// update the code onlt to store the index of min remove the min variable
 
//update the
// console.log(SelectionSort(a1));

// Time: O(n²) always — always scans the full unsorted portion, no early exit possible
// Space: O(1) — in-place

// function insertionSort(array) {
//     for (let i = 1; i < array.length; i++) {
//         let current = array[i];  // pull element out
//         let j = i - 1;
        
//         while (j >= 0 && array[j] > current) {
//             array[j + 1] = array[j];  // shift right
//             j--;
//         }
        
//         array[j + 1] = current;  // drop in the gap
//     }
//     return array;
// }
// let a2 =[9,4,6,2,6,7,1];

// console.log(insertionSort(a2))



//merge sort()


function merge(array1,array2){
    let i=0;
    let j=0;
    let result=[];
        while( i<array1.length && j<array2.length){
            if(array1[i]<array2[j]){
                result.push(array1[i]);
                i++;
            }else{
                result.push(array2[j]);
                j++
            }
        }
        while(i<array1.length){
            result.push(array1[i]);
            i++
        }
        while(j<array2.length){
            result.push(array2[j]);
            j++
        }
        return result
};

function mergerSort(array){
    if(array.length<=1) return array;
    let mid= Math.floor(array.length/2);
    let left= mergerSort(array.slice(0,mid))
    let right =mergerSort(array.slice(mid));
    return merge(left,right)
};

let a =[9,4,6,2,6,7,1];
console.log(mergerSort(a))


//quick sort