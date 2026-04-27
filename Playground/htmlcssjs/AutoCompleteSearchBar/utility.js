  
const useThrottle=(fn,delay)=>{
  let lastRequest=0;
    let time;
    return function(...args){
        console.log("lastRequest",lastRequest)
        let currentTime=Date.now();
        let remaining= delay-(currentTime-lastRequest);
        if(!lastRequest){
            remaining=delay;
        }
        if(remaining<=0 && lastRequest ){
            fn(...args);
            lastRequest=currentTime;
        }else{
            if(time){
                clearTimeout(time)
            }
            time=setTimeout(()=>{
                lastRequest=Date.now();
                fn(...args);
                clearTimeout(time);
            },remaining)
        }
    }
};
const useDebounce = (fn, delay) => {
  let timer;

  return function (...args) {
    clearTimeout(timer);

    timer = setTimeout(() => {
      fn(...args);
    }, delay);
  };
};

const getSearchUrl=(query)=>{
    let url=new URL("https://dummyjson.com/recipes/search");
    url.searchParams.set("q",query);
    return url
};


async function getSearchResult(input, signal) {

    let res = await fetch(getSearchUrl(input), { signal });
    if (!res.ok) {
        throw new Error("server issue")
    };
    let result = await res.json();
    return result; 
};
export {useThrottle,getSearchUrl,getSearchResult,useDebounce}
