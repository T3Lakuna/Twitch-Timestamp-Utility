# StreamMarker v1.0 by Travis Martin.

import os, sys, json, requests, re, time, keyboard
from os import path
from win32com.shell import shell, shellcon
from datetime import datetime

def HotkeyEvent():
	output_file = open(output_file_directory, 'a')
	output_file.write(TimeSinceStreamStart() + '\n')
	output_file.close()

def TimeSinceStreamStart():
	return time.strftime('%H:%M:%S', time.gmtime((datetime.utcnow() - stream_start_time).total_seconds()))

# Program start
print('Starting StreamMarker at ' + str(datetime.utcnow()))

session = requests.Session()
session.headers.update({ 'Client-ID': '2be6yrftbjgdrs0hov5lhz3uszezzv' })

output_file_directory = shell.SHGetFolderPath(0, shellcon.CSIDL_DESKTOPDIRECTORY, None, 0) + '\\StreamMarkers.txt'

# Make data folder.
data_folder = shell.SHGetFolderPath(0, shellcon.CSIDL_APPDATA, None, 0) + '\\T3\\StreamMarker\\'

if not path.exists(data_folder):
	os.makedirs(data_folder)

# Assign hotkey.
hotkey_file = data_folder + 'hotkey'
if path.exists(hotkey_file):
	hotkey = open(hotkey_file, 'r').read()
	print('Hotkey:', hotkey)
else:
	hotkey = input('Input the hotkey to use with this program: ')
	hotkey_file = open(hotkey_file, 'w')
	hotkey_file.write(hotkey)
	hotkey_file.close()

# Assign exit hotkey.
exit_hotkey_file = data_folder + 'exit_hotkey'
if path.exists(exit_hotkey_file):
	exit_hotkey = open(exit_hotkey_file, 'r').read()
	print('Exit hotkey:', exit_hotkey)
else:
	exit_hotkey = input('Input the hotkey to close this program with: ')
	exit_hotkey_file = open(exit_hotkey_file, 'w')
	exit_hotkey_file.write(exit_hotkey)
	exit_hotkey_file.close()

# Get Twitch user information.
twitch_user_file = data_folder + 'user'

if path.exists(twitch_user_file):
	twitch_login_name = open(twitch_user_file, 'r').read()
	print('Linked Twitch user login name:', twitch_login_name)
else:
	twitch_login_name = input('Input the login name of the Twitch user to link: ')
	twitch_user_file = open(twitch_user_file, 'w')
	twitch_user_file.write(twitch_login_name)
	twitch_user_file.close()

response = session.get('https://api.twitch.tv/helix/users?login=' + twitch_login_name)
twitch_user_id = json.loads(response.text)['data'][0]['id']
print('Linked Twitch user ID:', twitch_user_id)

# Get live Twitch stream information.
user_is_live = False
while not user_is_live:
	try:
		response = session.get('https://api.twitch.tv/helix/streams?user_id=' + twitch_user_id)
		stream_start_time = re.split('-|T|:|Z', json.loads(response.text)['data'][0]['started_at'])
		stream_start_time = datetime(int(stream_start_time[0]), int(stream_start_time[1]), int(stream_start_time[2]), int(stream_start_time[3]), int(stream_start_time[4]), int(stream_start_time[5]))
		time_since_stream_start = time.strftime('%H:%M:%S', time.gmtime((datetime.utcnow() - stream_start_time).total_seconds()))
		print('Time since current stream start: ', time_since_stream_start)
		user_is_live = True
	except:
		print('User is not live. Please note that it may take a few minutes after the stream starts for this to update. Trying again in one minute.')
		time.sleep(60) # Wait one minute before trying again.

# Setup hotkey detector.
keyboard.add_hotkey(hotkey, HotkeyEvent)
keyboard.wait(exit_hotkey)
