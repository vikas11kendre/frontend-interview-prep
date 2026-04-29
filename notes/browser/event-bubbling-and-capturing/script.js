const list=document.getElementById("list");
const listItems=document.querySelectorAll("#list-item");

listItems.forEach((i)=>
    i.addEventListener('click',(e)=>{
        e.stopImmediatePropagation();
        console.log("log",{target:e.target,value:e.target.innerText})
    },false)
);
list.addEventListener('click',(e)=>{
        console.log("log2",{target:e.target,value:e.target.innerText})
    },false);
