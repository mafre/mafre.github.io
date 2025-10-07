import Clock from "./game/Clock";
import { Modal } from "./game/Modal";
import Container from "./time/Container";

export default function Game() {
  return <div className="game">
    <div className="header">
    </div>
    <div className="content">
      <div className="flex justify-center">
        <Modal>
            <Container svgWidth={256} svgHeight={256} >
              <Clock />
            </Container>
          </Modal>
      </div>
    </div>
    <div className="footer">
    </div>
  </div>
}
