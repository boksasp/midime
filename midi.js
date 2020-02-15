
var context = new AudioContext()

// try to set gain
const masterGain = context.createGain();
masterGain.connect(context.destination)

const oscillators = [];

const notes = {
  21: 27.5,
  22: 29.1,
  23: 30.9,
  24: 32.7,
  25: 34.6,
  26: 36.7,
  27: 38.9,
  28: 41.2,
  29: 43.7,
  30: 46.2,
  31: 49.0,
  32: 51.9,
  33: 55.0,
  34: 58.3,
  35: 61.7,
  36: 65.4,
  37: 69.3,
  38: 73.4,
  39: 77.8,
  40: 82.4,
  41: 87.3,
  42: 92.5,
  43: 98.0,
  44: 103.8,
  45: 110.0,
  46: 116.5,
  47: 123.5,
  48: 130.8,
  49: 138.6,
  50: 146.8,
  51: 155.6,
  52: 164.8,
  53: 174.6,
  54: 185.0,
  55: 196.0,
  56: 207.7,
  57: 220.0,
  58: 233.1,
  59: 246.9,
  60: 261.6,
  61: 277.2,
  62: 293.7,
  63: 311.1,
  64: 329.6,
  65: 349.2,
  66: 370.0,
  67: 392.0,
  68: 415.3,
  69: 440.0,
  70: 466.2,
  71: 493.9,
  72: 523.3,
  73: 554.4,
  74: 587.3,
  75: 622.3,
  76: 659.3,
  77: 698.5,
  78: 740.0,
  79: 784.0,
  80: 830.6,
  81: 880.0,
  82: 932.3,
  83: 987.8,
  84: 1046.5,
  85: 1108.7,
  86: 1174.7,
  87: 1244.5,
  88: 1318.5,
  89: 1396.9,
  90: 1480.0,
  91: 1568.0,
  92: 1661.2,
  93: 1760.0,
  94: 1864.7,
  95: 1975.5,
  96: 2093.0,
  97: 2217.5,
  98: 2349.3,
  99: 2489.0,
  100: 2637.0,
  101: 2793.8,
  102: 2960.0,
  103: 3136.0,
  104: 3322.4,
  105: 3520.0,
  106: 3729.3,
  107: 3951.1,
  108: 4186.0
};

const adjustVolume = () => {
  const volumeControl = document.getElementById('knob1');
  const volume = volumeControl !== null ? volumeControl.value : 100;
  console.log(`volume: ${volume}`)
  console.log(masterGain)
  masterGain.gain.value = volume / 100;
};

const playNote = (note, velocity) => {
  const osc = context.createOscillator();
  const keyGain = context.createGain();
  keyGain.connect(masterGain);
  keyGain.gain.value = velocity / 127;

  osc.type = "square"
  osc.connect(keyGain);
  osc.frequency.value = notes[note];
  osc.start();
  oscillators.push({
    key: note,
    osc
  });
};

const stopNote = note => {
  console.log(oscillators);
  const oscillator = oscillators.find(e => e.key === note);
  if (!oscillators) return null;
  console.log(oscillator.osc);
  oscillator.osc.stop();
  const index = oscillators.findIndex(e => e.key === note);
  oscillators.splice(index, 1);
}

const displayPortInfo = port => {
  console.log('inside loop')
  const portInfo = document.createElement('li');
  portInfo.innerText = `Manufacturer: ${port.manufacturer}, Name: ${port.name}, State: ${port.state}`;
  const inputList = document.getElementById('midiInputs');
  inputList.appendChild(portInfo);
};

const handleKnob = data => {
  const note = data[1];
  const velocity = data[2];

  const value = velocity / 127 * 100;

  const sliderSelector = `knob${note}`;
  const valueSelector = `knob${note}value`;
  const knobSlider = document.getElementById(sliderSelector);
  const knobValue = document.getElementById(valueSelector);

  console.log('handling knob')
  knobSlider.value = value;
  knobValue.innerText = knobSlider.value;
  adjustVolume();
};

const incrementTotalPressed = () => {
  const numberElement = document.getElementById('number');
  const value = Number(numberElement.innerText);
  numberElement.innerText = value + 1;
};

const handleNoteOn = (data) => {
  incrementTotalPressed();
  const currentKeyInput = document.getElementById('currentKeyInput');
  const note = data[1];
  const velocity = data.length > 2 ? data[2] : null;

  const currentKeyInputDisplayText = `Pressing ${note} with a velocity of ${velocity}`;

  currentKeyInput.innerText = currentKeyInputDisplayText;
  playNote(note, velocity);
};

const handleNoteOff = note => {
  const currentKeyInput = document.getElementById('currentKeyInput');
  const currentKeyInputInnerText = currentKeyInput.innerText;

  const newText = `${currentKeyInputInnerText} (released)`;

  currentKeyInput.innerText = newText;
  stopNote(note);
};

const handleMidiMessage = midiMessage => {
  console.log(midiMessage);
  const { data } = midiMessage;

  const currentInputElement = document.getElementById('currentInput');

  if (data) {
    const command = data[0];
    const note = data[1];
    const velocity = data[2];

    switch (command) {
      case 176:
        handleKnob(data);
        break;
      case 144:
        handleNoteOn(data);
        break;
      case 128:
        handleNoteOff(note);
        break;
      default:
        console.log('default switch case')
    }
  }

};

const setupPort = port => {
  displayPortInfo(port);
  port.onmidimessage = handleMidiMessage;
};

const handleStateChange = e => {
  console.log(`Name: ${e.port.name}`);
  console.log(`Manufacturer: ${e.port.manufacturer}`);
  console.log(`State: ${e.port.state}`);

  console.log(e);


};

const onMIDISuccess = midiAccess => {
  console.log(midiAccess);

  var inputs = midiAccess.inputs;
  var outputs = midiAccess.outputs;

  if (outputs) {
    outputs.forEach(port => {
      console.log('MIDI OUTPUTS:')
      console.log(port);
    })
  }

  if (inputs) {
    inputs.forEach(port => setupPort(port));
  }
};

const onMIDIFailure = () => {
  console.log('Failed to access MIDI')
};

navigator.requestMIDIAccess()
  .then(onMIDISuccess, onMIDIFailure);
