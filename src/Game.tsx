import Clock from "./game/Clock";
import TopMenu from "./game/TopMenu";
import Container from "./time/Container";

export default function Game() {
  return <div className="game">
    <div className="header">
      <TopMenu />
    </div>
    <div className="content">
      <div className="flex justify-center">
        <Container>
          <Clock />
        </Container>
      </div>
    </div>
    <div className="footer">
    </div>
  </div>
}
