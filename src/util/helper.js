import MessageBus from './../message/bus'
import MessageType from './../constant/messageType'
import S from './../model/stage'
import Key from '../model/key';
import A from './../model/app'

const addEntity = entity => {

    MessageBus.dispatch(MessageType.ADD_ENTITY, entity);
}

const removeEntity = entity => {

    MessageBus.dispatch(MessageType.REMOVE_ENTITY, entity);
}

const removeType = type => {

    MessageBus.dispatch(MessageType.REMOVE_TYPE, type);
}

const setState = state => {

    MessageBus.dispatch(MessageType.SET_STATE, state);
}

const setScale = scale => {

    S.scale = scale;
    S.width = S.windowWidth / S.scale;
    S.height = S.windowHeight / S.scale;

    MessageBus.dispatch(MessageType.SET_SCALE, scale);
}

const setFPS = fps => {

    A.fps = fps;

    MessageBus.dispatch(MessageType.SET_FPS, fps);
}

const setLayerVisibility = (layer, visible) => {

    visible ?
        MessageBus.dispatch(MessageType.SHOW_LAYER, layer):
        MessageBus.dispatch(MessageType.HIDE_LAYER, layer);
}

const showOverlay = content => {

    MessageBus.dispatch(MessageType.SHOW_OVERLAY, content);
}

const hideOverlay = () => {

    MessageBus.dispatch(MessageType.HIDE_OVERLAY);
}

const keyDown = keyCode => {

    Key.down(keyCode);
    MessageBus.dispatch(MessageType.KEY_DOWN, keyCode);
}

const keyUp = keyCode => {

    Key.up(keyCode);
    MessageBus.dispatch(MessageType.KEY_UP, keyCode);
}

const enableKeys = target => {

    MessageBus.dispatch(MessageType.ENABLE_KEYS, target);
}

const disableKeys = () => {

    MessageBus.dispatch(MessageType.DISABLE_KEYS);
}

const createBody = (entity, shape, bodyDef, fixDef) => {

    MessageBus.dispatch(MessageType.CREATE_BODY, { entity, shape, bodyDef, fixDef });
}

const destroyBody = body => {

    MessageBus.dispatch(MessageType.DESTROY_BODY, body);
}

export default {

    addEntity,
    removeEntity,
    removeType,
    setState,
    setScale,
    setFPS,
    setLayerVisibility,
    showOverlay,
    hideOverlay,
    keyDown,
    keyUp,
    enableKeys,
    disableKeys,
    createBody,
    destroyBody
}