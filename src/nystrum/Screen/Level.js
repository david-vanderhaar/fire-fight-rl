import React from 'react';
import { SCREENS } from './constants';
import * as Engine from '../engine';
import * as Game from '../game';
import Instructions from '../UI/Instructions';
import Information from '../UI/Information';
import Equipment from '../UI/Equipment';
import Inventory from '../UI/Inventory';
import KeymapUI from '../UI/Keymap';
import Messages from '../UI/Messages';

class Level extends React.Component {
  constructor(props) {
    super(props);
    let ENGINE = new Engine.Engine({});
    let game = new Game.Game({ engine: ENGINE, getSelectedCharacter: () => this.props.selectedCharacter.initialize(ENGINE)})

    this.state = {
      game: game,
      activeTab: 0,
      spriteMode: game.spriteMode,
    };
    this.presserRef = React.createRef();
  }

  async componentDidMount() {
    this.state.game.initialize(this.presserRef, document)
    this.state.game['backToTitle'] = () => this.props.setActiveScreen(SCREENS.TITLE);
    this.state.game['toLose'] = () => this.props.setActiveScreen(SCREENS.LOSE);
    this.state.game.updateReact = (newGameState) => { this.setState({game: newGameState}) }
    this.state.game.engine.start()
  }

  toggleSpriteMode () {
    this.state.game.spriteMode = !this.state.game.spriteMode;
    this.state.game.draw();
    this.presserRef.current.focus();
    this.setState({ spriteMode: this.state.game.spriteMode})
  }

  render() {
    let currentActor = this.state.game.engine.actors[this.state.game.engine.currentActor];
    let data = [
      {
        label: 'Wave',
        value: `Current: ${this.state.game.mode.data.level}, Highest: ${this.state.game.mode.data.highestLevel}`,
      },
    ];

    data = data.concat(
      [
        ...this.state.game.engine.actors.map((actor, index) => {
          let result = {
            label: actor.name,
            value: index,
            value: `HP: ${actor.durability}, En/Sp: ${actor.energy}/${actor.speed}`,
          };
          if (index === this.state.game.engine.currentActor) {
            result['color'] = 'red';
          }
          return result;
        })
      ]
    )

    return (
      <div className="Level">
        <div className='row'>
          <div className='col s10'>
            <div className='game_display_container'>
              {Game.DisplayElement(this.presserRef, Game.handleKeyPress, this.state.game.engine)}
              {/* <Information data={data} /> */}
            </div>
            <Instructions game={this.state.game} spriteMode={this.state.game.spriteMode} setActiveScreen={this.props.setActiveScreen} toggleSpriteMode={this.toggleSpriteMode.bind(this)} />
          </div>
          <div className='col s2'>
            <KeymapUI keymap={this.state.game.visibleKeymap} />
            <Messages messages={this.state.game.messages.slice(-5).reverse()} />
          </div>
          {/* <button className='btn' onClick={() => this.props.setActiveScreen(SCREENS.TITLE)}>Quit</button> */}
        </div>
      </div>
    );
  }
}

export default Level;
