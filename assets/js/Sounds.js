export default
class Sounds {
  constructor() {
    this.sounds = {
      idle: document.getElementById('audio_idle'),
      move: document.getElementById('audio_move'),
      shoot: document.getElementById('audio_shoot'),
      explosion: document.getElementById('audio_explosion'),
      hit: document.getElementById('audio_hit'),
      start: document.getElementById('audio_start'),
      levelUp: document.getElementById('audio_level_up'),
      collect: document.getElementById('audio_collect'),
      bomb: document.getElementById('audio_bomb')
    };
  }

  play(name, stopSounds = []) {
    for (const soundName in this.sounds) {
      const sound = this.sounds[soundName];

      if (soundName === name) {
        sound.play();
      } else if (stopSounds.includes(soundName)) {
        sound.pause();
        sound.currentTime = 0;
      }
    }
  }

  stop() {
    for (const soundName in this.sounds) {
      const sound = this.sounds[soundName];

      sound.pause();
      sound.currentTime = 0;
    }
  }
}
