import Sprite from 'openfl/display/Sprite';
import TextField from 'openfl/text/TextField';
import AntiAliasType from 'openfl/text/AntiAliasType';
import TextFieldAutoSize from 'openfl/text/TextFieldAutoSize';
import TextFormat from 'openfl/text/TextFormat';
import F from '../constant/fonts';

class Text extends Sprite {
  constructor(text, font = F.F, size = 10, color = 0xffffff) {
    super();

    this.text = text;
    this.font = font;
    this.size = size;
    this.color = color;

    const format = new TextFormat(font, size, color);

    this.textField = new TextField();
    this.textField.defaultTextFormat = format;
    this.textField.embedFonts = true;
    this.textField.selectable = false;
    this.textField.antiAliasType = AntiAliasType.ADVANCED;
    this.textField.autoSize = TextFieldAutoSize.LEFT;
    this.textField.text = text;
    this.addChild(this.textField);
  }

  setText = (value) => {
    this.text = value;
    this.textField.text = value;
  };

  setFont = (aFont) => {
    this.font = aFont;

    this.update();
  };

  setSize = (aSize) => {
    this.size = aSize;

    this.update();
  };

  update = () => {
    this.textField.defaultTextFormat = new TextFormat(
      this.font,
      this.size,
      this.color,
    );

    this.textField.text = this.text;
  };
}

export default Text;
