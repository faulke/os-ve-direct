from serial import Serial
import json, multiprocessing, websockets

class Vedirect(multiprocessing.Process):
    def __init__(self, serialport, timeout, queue):
        multiprocessing.Process.__init__(self)
        self.queue = queue
        self.serialport = serialport
        self.ser = Serial(serialport, 19200, timeout=timeout)
        self.header1 = b'\r'
        self.header2 = b'\n'
        self.hexmarker = b':'
        self.delimiter = b'\t'
        self.key = ''
        self.value = ''
        self.bytes_sum = 0
        self.state = self.WAIT_HEADER
        self.dict = {}


    (HEX, WAIT_HEADER, IN_KEY, IN_VALUE, IN_CHECKSUM) = range(5)

    def input(self, byte):
        if byte == self.hexmarker and self.state != self.IN_CHECKSUM:
            self.state = self.HEX
            
        
        if self.state == self.WAIT_HEADER:
            self.bytes_sum += ord(byte)
            if byte == self.header1:
                self.state = self.WAIT_HEADER
            elif byte == self.header2:
                self.state = self.IN_KEY

            return None
        elif self.state == self.IN_KEY:
            self.bytes_sum += ord(byte)
            if byte == self.delimiter:
                if (self.key == 'Checksum'):
                    self.state = self.IN_CHECKSUM
                else:
                    self.state = self.IN_VALUE
            else:
                self.key += byte.decode("utf-8")
            return None
        elif self.state == self.IN_VALUE:
            self.bytes_sum += ord(byte)
            if byte == self.header1:
                self.state = self.WAIT_HEADER
                self.dict[self.key] = self.value;
                self.key = '';
                self.value = '';
            else:
                self.value += byte.decode("utf-8")
            return None
        elif self.state == self.IN_CHECKSUM:
            self.bytes_sum += ord(byte)
            self.key = ''
            self.value = ''
            self.state = self.WAIT_HEADER
            if (self.bytes_sum % 256 == 0):
                self.bytes_sum = 0
                return self.dict
            else:
                print('Malformed packet')
                self.bytes_sum = 0
        elif self.state == self.HEX:
            self.bytes_sum = 0
            if byte == self.header2:
                self.state = self.WAIT_HEADER
        else:
            raise AssertionError()
            
    def run(self):
        while True:
            byte = self.ser.read(1)
            if byte:
                packet = self.input(byte)
                if (packet != None):
                    js = json.dumps(packet)
                    self.queue.put(js)
