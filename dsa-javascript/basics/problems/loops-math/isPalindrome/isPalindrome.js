
function isPalindrome(number){
  if (number < 0 || (number !== 0 && number % 10 === 0)) {
        return false;
    }
    let rev=0;
    let n=number;
    while(n>0){
        let remainder=n%10;
        rev=rev*10+remainder;
        n=Math.floor(n/10);
    };
    if(rev===number){
        return true
    }else{
        return false
    }

}