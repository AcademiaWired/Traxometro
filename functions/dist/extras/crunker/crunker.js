"use strict";
/**
 * See: https://github.com/jackedgson/crunker/issues/4
 * This number should reflect the sample rate in Hz of the audio files.
 */

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const sampleRate = 48000; // or 48000 (Hz)

class Crunker {
  constructor() {
    this._context = this._createContext();
  }

  _createContext() {
    window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext;
    return new AudioContext();
  }

  fetchAudio(...filepaths) {
    var _this = this;

    return _asyncToGenerator(function* () {
      const files = filepaths.map(
      /*#__PURE__*/
      function () {
        var _ref = _asyncToGenerator(function* (filepath) {
          const buffer = yield fetch(new Request(filepath)).then(response => response.arrayBuffer());
          return yield _this._context.decodeAudioData(buffer);
        });

        return function (_x) {
          return _ref.apply(this, arguments);
        };
      }());
      return yield Promise.all(files);
    })();
  }

  mergeAudio(buffers) {
    let output = this._context.createBuffer(1, sampleRate * this._maxDuration(buffers), sampleRate); // eslint-disable-next-line


    buffers.map(buffer => {
      for (let i = buffer.getChannelData(0).length - 1; i >= 0; i--) {
        output.getChannelData(0)[i] += buffer.getChannelData(0)[i];
      }
    });
    return output;
  }

  concatAudio(buffers) {
    let output = this._context.createBuffer(1, this._totalLength(buffers), sampleRate),
        offset = 0; // eslint-disable-next-line


    buffers.map(buffer => {
      output.getChannelData(0).set(buffer.getChannelData(0), offset);
      offset += buffer.length;
    });
    return output;
  }

  play(buffer) {
    const source = this._context.createBufferSource();

    source.buffer = buffer;
    source.connect(this._context.destination);
    source.start();
    return source;
  }

  export(buffer, audioType) {
    const type = audioType || "audio/mp3";

    const recorded = this._interleave(buffer);

    const dataview = this._writeHeaders(recorded);

    const audioBlob = new Blob([dataview], {
      type: type
    });
    return {
      blob: audioBlob,
      url: this._renderURL(audioBlob),
      element: this._renderAudioElement(audioBlob, type)
    };
  }

  download(blob, filename) {
    const name = filename || "crunker";
    const a = document.createElement("a");
    a.style = "display: none";
    a.href = this._renderURL(blob);
    a.download = `${name}.${blob.type.split("/")[1]}`;
    a.click();
    return a;
  }

  notSupported(callback) {
    return !this._isSupported() && callback();
  }

  close() {
    this._context.close();

    return this;
  }

  _maxDuration(buffers) {
    return Math.max.apply(Math, buffers.map(buffer => buffer.duration));
  }

  _totalLength(buffers) {
    return buffers.map(buffer => buffer.length).reduce((a, b) => a + b, 0);
  }

  _isSupported() {
    return "AudioContext" in window;
  }

  _writeHeaders(buffer) {
    let arrayBuffer = new ArrayBuffer(44 + buffer.length * 2),
        view = new DataView(arrayBuffer);

    this._writeString(view, 0, "RIFF");

    view.setUint32(4, 32 + buffer.length * 2, true);

    this._writeString(view, 8, "WAVE");

    this._writeString(view, 12, "fmt ");

    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 2, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 4, true);
    view.setUint16(32, 4, true);
    view.setUint16(34, 16, true);

    this._writeString(view, 36, "data");

    view.setUint32(40, buffer.length * 2, true);
    return this._floatTo16BitPCM(view, buffer, 44);
  }

  _floatTo16BitPCM(dataview, buffer, offset) {
    for (var i = 0; i < buffer.length; i++, offset += 2) {
      let tmp = Math.max(-1, Math.min(1, buffer[i]));
      dataview.setInt16(offset, tmp < 0 ? tmp * 0x8000 : tmp * 0x7fff, true);
    }

    return dataview;
  }

  _writeString(dataview, offset, header) {
    for (var i = 0; i < header.length; i++) {
      dataview.setUint8(offset + i, header.charCodeAt(i));
    }
  }

  _interleave(input) {
    let buffer = input.getChannelData(0),
        length = buffer.length * 2,
        result = new Float32Array(length),
        index = 0,
        inputIndex = 0;

    while (index < length) {
      result[index++] = buffer[inputIndex];
      result[index++] = buffer[inputIndex];
      inputIndex++;
    }

    return result;
  }

  _renderAudioElement(blob, type) {
    const audio = document.createElement("audio");
    audio.controls = "controls";
    audio.type = type;
    audio.src = this._renderURL(blob);
    return audio;
  }

  _renderURL(blob) {
    return (window.URL || window.webkitURL).createObjectURL(blob);
  }

}

exports.default = Crunker;