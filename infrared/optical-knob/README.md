# optical knob

video demo: http://www.youtube.com/embed/K9jOTFbbufA

## hardware

The electronics behind this hack are quite simple. Albeit you may not have everything on hand to build this straight away.  To help, here's a shopping list

 * ball bearings (http://www.ebay.com/itm/ws/eBayISAPI.dll?ViewItem&item=180865214510&ssPageName=ADME:L:OC:US:3160)
 * m6 socket cap nuts and bolts (http://mcmaster.com or your local hardware store)
 * OPB706 (http://octopart.com/parts/search?q=OPB706C) x 2 
 * laser priter compatible transparencies
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