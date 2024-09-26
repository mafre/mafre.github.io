import Sprite from 'openfl/display/Sprite'
import Engine from './engine'
import Physics from './physics'
import View from './view'
import States from './states'
import AppState from './constant/appState'
import Helper from './util/helper'
import Input from './entity/input'

class Game extends Sprite {
  constructor () {
    super()

    this.view = new View()
    this.engine = new Engine(this.view)
    this.states = new States()

    this.addChild(this.view)

    this.engine.start()

    Helper.addEntity(new Physics())
    Helper.addEntity(new Input())
    Helper.setState(AppState.FIBONACCI)
  }
}

export default Game
