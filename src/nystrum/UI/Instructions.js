import React from 'react';
import { SCREENS } from '../Screen/constants';

class Instructions extends React.Component {
  render() {
    let modeDetails = null;
    try {
      modeDetails = (
        <span>
          <div className='Instructions__block'>{`Wave ${this.props.game.mode.data.level}`}</div>
          <div className='Instructions__block'>
            {
              `${this.props.game.mode.countNpcSafe()} of  ${this.props.game.mode.getSaveCountRequirement()} are safe!`
            }
          </div>
        </span>
      );
    } catch { return }

    return (
      <div className="Instructions UI">
        <p className='flow-text'>
          Save all of the citizens from the burning keep and get them to the safe zone!
        </p>
        <div className='flow-text'>
          { modeDetails }
          <div 
            className='Instructions__block'
            onClick={() => this.props.setActiveScreen(SCREENS.TITLE)}
          >
            {/* <button className='btn btn-main' onClick={() => window.location.reload()}>
              Restart
            </button> */}
            {/* <button className='btn btn-main' onClick={() => this.props.setActiveScreen(SCREENS.TITLE)}>
              Restart
            </button> */}
            <button className='btn btn-main'>
              Restart
            </button>
          </div>
          <div 
            className='Instructions__block'
            onClick={() => this.props.toggleSpriteMode()}
          >
            <button className='btn btn-main'>
              {
                this.props.spriteMode ? (
                  'ASCII mode'
                ) : (
                  'Sprite mode'
                )
              }
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default Instructions;