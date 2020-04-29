import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { SCREENS } from './Screen/constants';
import Level from './Screen/Level';
import Title from './Screen/Title';
import Lose from './Screen/Lose';
import Win from './Screen/Win';
import Characters from './Characters/index';
import SOUNDS from './sounds';

class Nystrum extends React.Component {
  constructor() {
    super();
    let characterKey = Characters();
    let characters = Object.keys(characterKey).map((key, i) => {
      return {
        // [key]: characterKey[key],
        initialize: characterKey[key],
        selected: false,
        name: key,
      }
    });
    this.state = {
      activeScreen: SCREENS.TITLE,
      characters,
      selectedCharacter: null,
    };
  }

  setActiveScreen (activeScreen) {
    if (activeScreen === SCREENS.TITLE) {
      Object.keys(SOUNDS).forEach(key => {
        SOUNDS[key].stop();
      });
    }
    this.setState({activeScreen})
  }

  setSelectedCharacter (character) {
    this.setState({selectedCharacter: {...character}})
  }

  getActiveScreen () {
    const titleScreen = <Title 
      key={SCREENS.TITLE} 
      setActiveScreen={this.setActiveScreen.bind(this)}
      setSelectedCharacter={this.setSelectedCharacter.bind(this)}
      selectedCharacter={this.state.selectedCharacter}
      characters={this.state.characters}
    />
    const loseScreen = <Lose 
      key={SCREENS.LOSE} 
      setActiveScreen={this.setActiveScreen.bind(this)}
      setSelectedCharacter={this.setSelectedCharacter.bind(this)}
      selectedCharacter={this.state.selectedCharacter}
      characters={this.state.characters}
    />
    const winScreen = <Win 
      key={SCREENS.WIN} 
      setActiveScreen={this.setActiveScreen.bind(this)}
      setSelectedCharacter={this.setSelectedCharacter.bind(this)}
      selectedCharacter={this.state.selectedCharacter}
      characters={this.state.characters}
    />
    const levelScreen = <Level 
      key={SCREENS.LEVEL} 
      setActiveScreen={this.setActiveScreen.bind(this)}
      selectedCharacter={this.state.selectedCharacter}
    />

    switch (this.state.activeScreen) {
      case SCREENS.TITLE:
        return titleScreen
      case SCREENS.LOSE:
        return loseScreen
      case SCREENS.WIN:
        return winScreen
      case SCREENS.LEVEL:
        return levelScreen
      default:
        return titleScreen
    }
  }

  render() {
    const activeScreen = this.getActiveScreen();
    return (
      <div className="Nystrum">
        <ReactCSSTransitionGroup
          transitionName="fade"
          transitionAppear={true}
          transitionEnter={true}
          transitionLeave={true}
          transitionAppearTimeout={500}
          transitionEnterTimeout={500}
          transitionLeaveTimeout={300}
        >
          { activeScreen }
        </ReactCSSTransitionGroup>
      </div>
    );
  }
}

export default Nystrum;
