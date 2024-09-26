let keys = {};

const key = aKey => {

    return keys[aKey];
}

const down = key => {

    keys[key] = true;
}

const up = key => {

    keys[key] = false;
}

export default {
    down,
    up,
    key
}