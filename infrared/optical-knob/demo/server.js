var serialport = require('serialport'),
    ecstatic = require('ecstatic')(__dirname + '/static');

require('http').createServer(ecstatic).listen(10000);

require('binaryjs').createServer(function(stream) {
  serialport.list(function(err, sps) {
    var sp = new serialport.SerialPort(sps.pop().comName, {
      parser: serialport.parsers.readline('\n')
    });

    sp.pipe(stream);
  });

}).listen(10001);

console.log('point chrome at http://localhost:10000');
