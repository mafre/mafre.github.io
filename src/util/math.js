import S from '../model/stage'

const sqrt5 = Math.sqrt(5);
const phi = (sqrt5 + 1) / 2;
const hexSize = 45;
const hexOneThird = hexSize * (1 / 3);
const hexTwoThird = hexSize * (2 / 3);

const fib = n => {

    const p = Math.pow(phi, n);
    const m = Math.pow(-1, n);
    const r = (p - m) / sqrt5;

    return r
}

const a = (p1, p2) => {

    return Math.atan2(p2.y - p1.y, p2.x - p1.x) / Math.PI * 360;
}

const radians = (p1, p2) => {

    return Math.atan2(p2.y - p1.y, p2.x - p1.x);
}

const iso = (x, y) => {

    let isoX = x * hexTwoThird + y * hexTwoThird;
    let isoY = (y * hexTwoThird) / 2 - (x * hexTwoThird) / 2;

    return {
        x: isoX,
        y: isoY
    }
}

const depth = pos => {

    return iso(pos).y;
}

const angle = pos => {

    return radians({x: pos.x * S.scale, y: pos.y * S.scale}, {x: S.mouseX, y: S.mouseY});
}

const distance = (p1, p2) => {

    let a = p1.x - p2.x;
    let b = p1.y - p2.y;

    return Math.sqrt( a*a + b*b );
}

export default {
    fib,
    phi,
    angle,
    radians,
    hexSize,
    hexOneThird,
    hexTwoThird,
    iso,
    depth,
    angle,
    a,
    distance
}