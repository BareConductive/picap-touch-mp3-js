/*******************************************************************************

  Bare Conductive Pi Cap
  ----------------------

  touch-mp3.js - monophonic touch triggered MP3 playback

  ****************************** IMPORTANT NOTE ********************************
  
  This code plays back files monophonically, unlike our other Pi Cap MP3 
  examples, which are polyphonic. This is due to restrictictions in availble
  Node.js libraries and techniques. If you want polyphonic playback, please 
  choose from an example written in another language. If you think you can do 
  polyphonic MP3 playback in Node.js, please let us know how!

  ******************************************************************************

  Written for Raspberry Pi.

  Bare Conductive code written by Szymon Kaliski.

  This work is licensed under a Creative Commons Attribution-ShareAlike 3.0
  Unported License (CC BY-SA 3.0) http://creativecommons.org/licenses/by-sa/3.0/

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE.

 *******************************************************************************/

var Gpio     = require('onoff').Gpio;
var leftPad  = require('left-pad');
var spawn    = require('child_process').spawn;
var execSync = require('child_process').execSync;

var MPR121 = require('node-picap');
var mpr121;

try {
  // correct address for the Pi Cap - other boards may vary
  mpr121 = new MPR121('0x5C'); 
}

catch (e) {
  console.log(e);
  process.exit(1);
}

// set up LED
var gpioRed   = new Gpio(6,  'out', 'none', { activeLow: true });
var gpioGreen = new Gpio(5,  'out', 'none', { activeLow: true });
var gpioBlue  = new Gpio(26, 'out', 'none', { activeLow: true });

function lightRGB(r, g, b) {
  gpioRed.writeSync(r);
  gpioGreen.writeSync(g);
  gpioBlue.writeSync(b);
}

function playFile(path) {
  execSync('aplay ' + path, { stdio: 'ignore' });
}

// convert MP3s to WAVs for easier playback - keep a blue LED on during this
lightRGB(0, 0, 1);
execSync('picap-samples-to-wav tracks', { stdio: 'inherit' });
lightRGB(0, 0, 0);

// play an appropriate track when we detect a touch
mpr121.on('data', function(data) {
  data.forEach(function(electrode, i) {
    if (!electrode.isNewTouch) { return; }

    console.log('playing sound ' + i);

    var path = 'tracks/.wavs/TRACK' + leftPad(i, 3, 0) + '.wav';

    // keep a red LED on during playback
    lightRGB(1, 0, 0);
    playFile(path);
    lightRGB(0, 0, 0);
  });
});

// this allows us to exit the program via Ctrl+C while still exiting elegantly
process.on('SIGINT', function () {
  lightRGB(0, 0, 0);
  process.exit(0);
});
