import Direction from './../../constant/direction';

const speed = 100;

let x = 0;
let y = 0;
let xSpeed = 0;
let ySpeed = 0;
let isWalking = false;
let isShooting = false;
let direction = Direction.NONE;

let walkingKeys = [
    37,
    38,
    39,
    40,
    65,
    68,
    83,
    87
]

let shootingKeys = [
    32
]

const getSpeed = () => {

    return {
        x: xSpeed,
        y: ySpeed
    }
}

const setSpeed = (x, y) => {

    xSpeed = x;
    ySpeed = y;
}

const resetDirection = () => {

    setDirection(Direction.NONE);
}

const getDirection = () => {

    return direction;
}

const setDirection = aDirection => {

    direction = aDirection;
}

const getPosition = () => {

    return {
        x,
        y
    }
}

const setPosition = (aX, aY) => {

    x = aX;
    y = aY;
}

export default {
    xSpeed,
    ySpeed,
    speed,
    setSpeed,
    getSpeed,
    isWalking,
    walkingKeys,
    isShooting,
    shootingKeys,
    resetDirection,
    getDirection,
    setDirection,
    getPosition,
    setPosition
}