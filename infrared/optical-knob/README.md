# optical knob

video demo: http://www.youtube.com/embed/K9jOTFbbufA

## hardware

The mechanics behind this hack are quite simple. Albeit you may not have everything on hand to build this straight away.  To help, here's a shopping list

 * ball bearings (http://www.ebay.com/itm/ws/eBayISAPI.dll?ViewItem&item=180865214510&ssPageName=ADME:L:OC:US:3160)
 * m6 socket cap nuts and bolts (http://mcmaster.com or your local hardware store)
 * OPB706 (http://octopart.com/parts/search?q=OPB706C) x 2 
 * laser printer compatible transparencies (and laser printer)
 * cat5 cable or a bunch of different colored wire
 * 2 resistors (~50ohm) almost any value should work ok
 * wood. doesn't have to be in the same same shape as the video as long as you can make 2 peices spin independently of each other

Here's how we're going to be hooking this whole thing up

<img src="https://github.com/tmpvar/hardware/raw/master/infrared/optical-knob/img/optical-knob.schematic.png" />

Here's an ideal sensor placement.

<img src="https://raw.github.com/tmpvar/hardware/master/infrared/optical-knob/img/knob-sensors-top.jpeg" />

Notice how the sensors are offset.. I got extremely lucky that they were in suitable positions.

Next up is the rotary encoder wheel

<img src="https://raw.github.com/tmpvar/hardware/master/infrared/optical-knob/img/encoder-wheel.jpeg" />

You can generate your own wheels here: http://tmpvar.com/tmp/encoder-generator.html - I printed this wheel out at 25%


## software 

### arduino sketch

```c

void setup() {
 pinMode(13, OUTPUT);
 Serial.begin(9600);
}

int lasta=0, lastb=0;
int peaka=346, peakb=349;
int position = 0, lastposition = 0;

void loop() {
  digitalWrite(13, HIGH);
  
  int currenta = analogRead(0);
  int currentb = analogRead(1);
  
  if (currenta == lasta || currentb == lastb) {
    return; 
  }
  
  //Serial.print(currenta);
  //Serial.print(" - ");
  //Serial.println(currentb);
  
  if (currenta > currentb) {
    if (currenta == peaka) {
      // CW
      if (currentb > lastb) {
        position++;
      // CCW
      } else if (currentb < lastb) {
        position--;
      }     
    }
  } else if (currentb > currenta) {
    if (currentb == peakb) {
      // CW
      if (currenta < lasta) {
        position++;
      // CCW
      } else if (currenta > lasta) {
        position--;
      }     
    }
  }
  if (position != lastposition) {
    Serial.println(position);
  }
  lastposition = position;
  lasta = currenta;
  lastb = currentb;
}

```

### node

```javascript

var serialport = require('serialport'),
serialport.list(function(err, sps) {
  var sp = new serialport.SerialPort(sps.pop().comName, {
    parser: serialport.parsers.readline('\n')
  });

  sp.on('data', function(value) {
    // turning the knob clockwise will increment value
    // turning it counter-clockwise will decrement the value
  });
});

```

see: https://github.com/tmpvar/hardware/tree/master/infrared/optical-knob/demo for the demo used in the video

## GCODE

If you happen to have access to a cnc machine and want to cut the mdf parts out, here's a the gcode generator that I used with a 1/4" bit.

```javascript

var gcode = [];
var feed = 10000;
var zfeed = 1000;


function generateCircle(diameter, startz, endz) {
  var radius = diameter / 2;
  gcode.push('G1 Z0 F1000');

  gcode.push('G1 X-' + radius + 'F' + feed);
  for (var i=startz; i<endz; i+=2) {

    gcode.push(['G1', 'Z' + i, 'F' + zfeed].join(' '));
    gcode.push('G02' +  'X0. Y' + radius + ' I' + radius + ' J0. F' + feed);
    gcode.push('G02' +  'X' + radius + 'Y0. I0. J-' + radius);
    gcode.push('G02' +  'X0. Y-' + radius + ' I-' + radius + ' J0');
    gcode.push('G02' +  'X-' + radius + ' Y0. I0. J' + radius);

  }

  gcode.push('G1 Z0 F1000');
  gcode.push('G1 Y0 X0 F10000');


}

/*
cap
generateCircle(10, 0, 1+25.4*(1/4));
generateCircle(20, 0, 1+25.4*(1/2));
generateCircle(30, 0, 1+25.4*(1/2));
generateCircle(50, 0, 1+25.4*(3/4));
*/
generateCircle(40, 0, 1+25.4*(3/8));
generateCircle(50, 0, 1+25.4*(3/4));


gcode.push('G1 Z20.05 F' + zfeed);
gcode.push('G1 Z0 F' + zfeed);


console.log(gcode.join('\n'));


```