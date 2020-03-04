import React from 'react';
import { SCREENS } from './constants';

// const backgroundImage = require('/fireMan.png')
const CharacterSelect = (props) => {
  return (
    <div className='CharacterSelect'>
      {
        props.characters.map((character, index) => {
          let color = '';
          if (props.selectedCharacter) {
            color = props.selectedCharacter.name === character.name ? 'red' : ''
          }

          return (
            <button
              key={index}
              style={{
                color: 'red'
              }}
              className={`CharacterSelect__button btn ${color}`}
              onClick={() => {
                props.setSelectedCharacter(character)
                props.setActiveScreen(SCREENS.LEVEL)
              }}
            >
              {character.name}
            </button>
          )
        })
      }
    </div>
  );
}

class Title extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div className="Title">
        <div
          style={{

            width: '100vw',
            height: '100vh',
            backgroundColor: 'black',
            backgroundImage: `url("/fireMan.png")`,
            backgroundSize: '100vw 120vh'
          }}
        >
          {/* <img class="responsive-img" src="/fireMan.png"></img> */}
          
          <div class='blue-text' style={{
            textAlign: "center",
            paddingTop: '240px',
            paddingLeft: '50px',
            fontSize: '200px',
            fontFamily: 'glacial indifference',
            textShadow: 'black 20px 20px 10px',
          }}>FLUME</div>
          <CharacterSelect 
            characters={this.props.characters} 
            selectedCharacter={this.props.selectedCharacter} 
            setSelectedCharacter={this.props.setSelectedCharacter}
            setActiveScreen={this.props.setActiveScreen}
        />
          {/* <button 
            class='btn' 
            onClick={() => this.props.setActiveScreen(SCREENS.LEVEL)}
            disabled={!this.props.selectedCharacter}
          >
            Play
          </button> */}
        </div>
      </div>
    );
  }
}

export default Title;