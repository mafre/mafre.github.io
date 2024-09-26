import Direction from './../../constant/direction';

const acc = 6;
const deacc = 2;
const maxSpeed = 10;
const div = 10;

let x = 100;
let y = 100;
let xAcc = 0;
let yAcc = 0;
let xSpeed = 0;
let ySpeed = 0;
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

const isWalkingKey = key => {

    const result = walkingKeys.find(aKey => {

        return aKey === key;
    });

    return result;
}

const getAcc = () => {

    return {
        x: xAcc,
        y: yAcc
    }
}

const getSpeed = () => {

    return {
        x: xSpeed,
        y: ySpeed
    }
}

const updateSpeed = () => {

    xSpeed += xAcc;
    ySpeed += yAcc;

    if(xSpeed > 0)
    {
        xSpeed -= deacc;

        if(xSpeed < 0)
        {
            xSpeed = 0;
        }
        else if(xSpeed > maxSpeed)
        {
            xSpeed = maxSpeed;
        }
    }
    else
    {
        xSpeed += deacc;

        if(xSpeed > 0)
        {
            xSpeed = 0;
        }
        else if(xSpeed < -maxSpeed)
        {
            xSpeed = -maxSpeed;
        }
    }

    if(ySpeed > 0)
    {
        ySpeed -= deacc;

        if(ySpeed < 0)
        {
            ySpeed = 0;
        }
        else if(ySpeed > maxSpeed)
        {
            ySpeed = maxSpeed;
        }
    }
    else
    {
        ySpeed += deacc;

        if(ySpeed > 0)
        {
            ySpeed = 0;
        }
        else if(ySpeed < -maxSpeed)
        {
            ySpeed = -maxSpeed;
        }
    }
}

const getPosition = () => {

    return {
        x,
        y
    }
}

const updatePosition = () => {

    x += xSpeed / div;
    y += ySpeed / div;
}

const getDirection = () => {

    return direction;
}

const setDirection = aDirection => {

    direction = aDirection;

    if (direction === Direction.NONE) {

        xAcc = 0;
        yAcc = 0;

        return;
    }

    switch (direction) {

        case Direction.LEFT:

            xAcc = -acc;
            yAcc = 0;
            break;

        case Direction.LEFT_UP:

            xAcc = -acc/2;
            yAcc = -acc/2;
            break;

        case Direction.UP:

            xAcc = 0;
            yAcc = -acc;
            break;

        case Direction.UP_RIGHT:

            xAcc = acc/2;
            yAcc = -acc/2;
            break;

        case Direction.RIGHT:

            xAcc = acc;
            yAcc = 0;
            break;

        case Direction.RIGHT_DOWN:

            xAcc = acc/2;
            yAcc = acc/2;
            break;

        case Direction.DOWN:

            xAcc = 0;
            yAcc = acc;
            break;

        case Direction.DOWN_LEFT:

            xAcc = -acc/2;
            yAcc = acc/2;
            break;
    }
}

export default {
    isWalkingKey,
    walkingKeys,
    shootingKeys,
    xAcc,
    yAcc,
    acc,
    getAcc,
    getSpeed,
    updateSpeed,
    getPosition,
    updatePosition,
    getPosition,
    getDirection,
    setDirection
}