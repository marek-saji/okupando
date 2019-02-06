#!/usr/bin/env python2.7

import RPi.GPIO as GPIO
import datetime
import time
import subprocess

sensorGPIOno = 17

GPIO.setmode(GPIO.BCM)
GPIO.setup(sensorGPIOno, GPIO.IN, pull_up_down=GPIO.PUD_UP)

lastState = 1

def log( message ):
    now = datetime.datetime.now()
    f = open('/var/log/wc-door.log', 'a')
    f.write( "[" + now.strftime("%Y-%m-%d %H:%M:%S") + "]: " + message + "\n" )
    f.close()

def saveState( state ):
    f = open('wc-door-state', 'w')
    f.write( str(state) )
    f.close()

def door_changed(channel):
    global lastState
    time.sleep(0.2)
    state = GPIO.input(channel)
    
    if lastState != state:
        lastState = state

        saveState( state )

        log( "  WC door state changed to " + str(state))
            

GPIO.add_event_detect(sensorGPIOno, GPIO.BOTH, callback=door_changed)

try:
    log( "WC door sensor listening..." )
    while True:
        time.sleep(2)

except KeyboardInterrupt:
    GPIO.cleanup()       # clean up GPIO on CTRL+C exit
    log( "WC door sensor stopped" );
    exit()

GPIO.cleanup()           # clean up GPIO on normal exit

log( "WC door sensor stopped" );

