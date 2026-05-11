function reverse(x) {
    const MIN = -(2 ** 31);
    const MAX = 2 ** 31 - 1;

    let isNegative = x < 0;
    let n = Math.abs(x);
    let rev = 0;

    while (n > 0) {
        let remainder = n % 10;
        rev = rev * 10 + remainder;
        n = Math.floor(n / 10);
    }

    if (isNegative) {
        rev = -rev;
    }

    if (rev < MIN || rev > MAX) {
        return 0;
    }

    return rev;
}