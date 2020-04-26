import { Howl, Howler } from 'howler';

const sound = new Howl({
  src: ['/sounds/explosion-00.wav']
});

export default {
  test: sound,
}