import Model from './model/app';
import MessageBus from './message/bus';
import MessageType from './constant/messageType';

class Engine {
  constructor(view) {
    this.view = view;
    this.entities = [];
    this.remove = [];
    this.delay = Math.round(1000 / Model.fps);
    this.counter = 0;
    this.entityCount = 0;
    this.paused = false;

    MessageBus.subscribe(MessageType.PAUSE_APP, this.pause);
    MessageBus.subscribe(MessageType.RESUME_APP, this.resume);
    MessageBus.subscribe(MessageType.SET_FPS, this.onSetFPS);
    MessageBus.subscribe(MessageType.ADD_ENTITY, this.addEntity);
    MessageBus.subscribe(MessageType.REMOVE_ENTITY, this.removeEntity);
    MessageBus.subscribe(MessageType.REMOVE_TYPE, this.removeType);
    MessageBus.subscribe(MessageType.COLLISION, this.onCollision);
  }

  pause = () => {
    this.paused = true;
  };

  resume = () => {
    this.paused = false;
  };

  onSetFPS = () => {
    this.stop();
    this.delay = Math.round(1000 / Model.fps);
    this.start();
  };

  addEntity = (entity) => {
    // Add the entity to the entities array
    this.entities.push(entity);

    if (entity.id === 0) entity.id = Model.entityCount;

    this.entities.push(entity);

    if (entity.view) {
      this.view.add(entity);
    }

    entity.init();

    Model.entityCount++;
  };

  removeEntity = (entity) => {
    const result = this.entities.find((aEntity) => {
      return aEntity === entity;
    });

    if (!result) {
      return;
    }

    entity.dispose();

    const index = this.entities.indexOf(entity);

    this.entities.splice(index, 1);

    if (entity.view) {
      this.view.remove(entity);
    }

    Model.entityCount -= 1;
  };

  removeType = (type) => {
    const result = this.entities.filter((aEntity) => {
      return aEntity.type === type;
    });

    result.forEach((e) => {
      this.removeEntity(e);
    });
  };

  onCollision = (collision) => {
    const entityA = this.findById(collision.uA.id);
    const entityB = this.findById(collision.uB.id);

    if (!entityA || !entityB) {
      return;
    }

    entityA.handleCollision(entityB);
    entityB.handleCollision(entityA);
  };

  findById = (id) => {
    return this.entities.find((aEntity) => {
      return aEntity.id === id;
    });
  };

  start = () => {
    this.interval = setInterval(() => {
      this.counter += 1;
      this.update(this.counter);
    }, this.delay);
  };

  stop = () => {
    clearInterval(this.interval);
  };

  update = (counter) => {
    if (this.paused) {
      return;
    }

    this.view.clear();

    this.entities.forEach((entity) => {
      entity.update(counter);

      if (!entity.remove) {
        if (entity.render) {
          this.view.render(entity);
        }
      }
    });

    this.entities.forEach((entity) => {
      if (entity.remove) {
        this.remove.push(entity);
      }
    });

    if (this.remove.length > 0) {
      this.remove.forEach((entity) => {
        this.removeEntity(entity);
      });

      this.remove = [];
    }
  };
}

export default Engine;
