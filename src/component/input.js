import Sprite from 'openfl/display/Sprite';
import TextField from 'openfl/text/TextField';
import AntiAliasType from 'openfl/text/AntiAliasType';
import TextFormat from 'openfl/text/TextFormat';
import F from '../constant/fonts';

class Input extends Sprite {
  constructor() {
    super();

    const format = new TextFormat(F.F, 30, 0xffffff);

    this.textField = new TextField();
    this.textField.defaultTextFormat = format;
    this.textField.embedFonts = true;
    this.textField.selectable = true;
    this.textField.antiAliasType = AntiAliasType.ADVANCED;
    this.addChild(this.textField);
  }
}

export default Input;
