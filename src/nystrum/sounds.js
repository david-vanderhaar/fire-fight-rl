import { Howl, Howler } from 'howler';

const sound = new Howl({
  src: ['/sounds/explosion-00.wav']
});

export default {
  fire_0: new Howl({
    src: ['/sounds/fire-00.mp3'],
    volume: 0.5,
    loop: true,
  }),
  fire_1: new Howl({
    src: ['/sounds/fire-01.mp3'],
    volume: 0.05,
    loop: true,
  }),
  scream_0: new Howl({
    src: ['/sounds/scream-00.wav']
  }),
  scream_1: new Howl({
    src: ['/sounds/scream-01.wav']
  }),
  scream_2: new Howl({
    src: ['/sounds/scream-02.wav']
  }),
  water_0: new Howl({
    src: ['/sounds/water-04.wav']
  }),
  water_1: new Howl({
    src: ['/sounds/water-05.wav']
  }),
  chop_0: new Howl({
    src: ['/sounds/chop-00.wav']
  }),
  chop_1: new Howl({
    src: ['/sounds/chop-01.wav']
  }),
  equip_0: new Howl({
    src: ['/sounds/equip-00.wav']
  }),
  equip_1: new Howl({
    src: ['/sounds/equip-01.wav']
  }),
  explosion_0: new Howl({
    src: ['/sounds/explosion-00.wav'],
    volume: 0.2,
  }),
  save: new Howl({
    src: ['/sounds/save.wav'],
  }),
  lose: new Howl({
    src: ['/sounds/lose-00.wav'],
  }),
  grab_0: new Howl({
    src: ['/sounds/grab-00.wav'],
  }),
  release_0: new Howl({
    src: ['/sounds/grab-01.wav'],
  }),
}