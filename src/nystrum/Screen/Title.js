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
                color: '#641b10',
                fontSize: '20px',
                fontWeight: 'bold',
                backgroundColor: '#e9a195',
                position: 'relative',
                top: '50px'
              }}
              className={`CharacterSelect__button btn ${color}`}
              onClick={() => {
                props.setSelectedCharacter(character)
                props.setActiveScreen(SCREENS.LEVEL)
              }}
            >
              {/* {character.name} */}
              Play Game
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
            backgroundColor: '#641b10',
            backgroundImage: `url("/flume_2.jpg")`,
            // backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundPositionY: '10px'

          }}
        >
          {/* <img class="responsive-img" src="/fireMan.png"></img> */}
          
          <div  style={{
            color: '#2aa198',
            textAlign: "center",
            paddingTop: '240px',
            paddingLeft: '50px',
            fontSize: '200px',
            fontFamily: 'glacial indifference',
            textShadow: 'black 10px 5px 0px',
          }}></div>
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