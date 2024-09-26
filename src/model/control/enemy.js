import Direction from './../../constant/direction';

class EnemyControl {

    constructor() {

        this.speed = 10;
        this.xSpeed = 0;
        this.ySpeed = 0;
        this.isWalking = false;
        this.isShooting = false;
        this.direction = Direction.NONE;
        this.walkingKeys = []
        this.shootingKeys = []
    }

    getSpeed = () => {

        return {
            x: this.xSpeed,
            y: this.ySpeed
        }
    }

    setSpeed = (x, y) => {

        this.xSpeed = x;
        this.ySpeed = y;
    }

    resetDirection = () => {

        this.setDirection(Direction.NONE);
    }

    getDirection = () => {

        return this.direction;
    }

    setDirection = aDirection => {

        this.direction = aDirection;
    }
}

export default EnemyControl;
