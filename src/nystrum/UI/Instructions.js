import React from 'react';
import { SCREENS } from '../Screen/constants';

class Instructions extends React.Component {
  render() {
    return (
      <div className="Instructions UI">
        <p className='flow-text'>
          Save all of the citizens from the burning building and get them to the safe zone!
        </p>
        <div className='flow-text'>
          <div className='Instructions__block'>{`Wave ${this.props.game.mode.data.level}`}</div>
          <div className='Instructions__block'>{`${this.props.game.countNpcSafe()} of ${this.props.game.mode.data.npcCount} are safe!`}</div>
          <div 
            className='Instructions__block'
            onClick={() => this.props.setActiveScreen(SCREENS.TITLE)}
          >
            <button className='btn btn-main' onClick={() => this.props.setActiveScreen(SCREENS.TITLE)}>
              Restart
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default Instructions;