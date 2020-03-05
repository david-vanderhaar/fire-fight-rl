import React from 'react';
import Button from './Button';

class Keymap extends React.Component {
  render() {
    return (  
      <div className="Keymap UI">
        <div className='flow-text center'>Keymap</div>
        {
          
          this.props.keymap && (
            Object.entries(this.props.keymap).map(([key, value], index) => {
              const hidden = value.hasOwnProperty('hidden') ? value.hidden : false;
              if (!hidden) {
                return (
                  <Button key={index} onClick={() => null} color='grey darken-1'>
                    {key} {value.label}
                  </Button>
                )
              }
            })
          )
        }
      </div>
    );
  }
}

export default Keymap;