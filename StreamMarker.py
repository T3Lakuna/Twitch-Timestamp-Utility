import pythoncom, pyHook, os, pytz, sys, json, requests, webbrowser, re
from os import path
from win32com.shell import shell, shellcon
from datetime import datetime

def KeydownEvent(event):
	# Windows with weird names can cause keylogging errors, so this try-finally keeps the program running smoothly.
	try:
		global hotkey
		if hotkey == None:
			global hotkey_file
			hotkey = event.KeyID
			hotkey_file = open(hotkey_file, 'w')
			hotkey_file.write(str(hotkey))
			hotkey_file.close()
			print('Hotkey:', hotkey)
		
		if event.KeyID == hotkey:
			# TODO
			time = pytz.utc.localize(datetime.utcnow())
			output_file = open(output_file_directory, 'a')
			output_file.write(time.strftime('%Y-%m-%d %H:%M:%S %Z%z') + '\n')
			output_file.close()
	finally:
		return True

print('Starting StreamMarker.')

client_id = '[REDACTED]'
token = None
output_file_directory = shell.SHGetFolderPath(0, shellcon.CSIDL_DESKTOPDIRECTORY, None, 0) + '\\Stream Markers.txt'
data_folder = shell.SHGetFolderPath(0, shellcon.CSIDL_APPDATA, None, 0) + '\\T3\\StreamMarker\\'
twitch_user_file = data_folder + 'user'
hotkey_file = data_folder + 'hotkey'
twitch_user_id = None
hotkey = None

# Authenticate program with Twitch.
webbrowser.open_new('https://id.twitch.tv/oauth2/authorize?client_id=' + client_id + '&redirect_uri=http://localhost&response_type=token&scope=')
print('You will be redirected to a link that looks like [http://localhost/#access_token=<TOKEN>&scope=&token_type=bearer].')
token = input('Please input your access token here: ')
if token == '':
	print('Cannot run without a token.')
	sys.exit()

if not path.exists(data_folder):
	os.makedirs(data_folder)

if path.exists(twitch_user_file):
	twitch_user = open(twitch_user_file, 'r').read()
	print('Twitch user:', twitch_user)
else:
	twitch_user_file = open(twitch_user_file, 'w')
	while twitch_user_id == None:
		twitch_username = input('Input the Twitch login name to link: ')
		response = requests.post('https://api.twitch.tv/helix/users?login=' + twitch_username, headers={'Client-ID' : client_id, 'Authorization' : token})
		if response.status_code == 200:
			twitch_user_id = json.loads(response.json()).id
			print('Got Twitch user ID:', twitch_user_id)
		else:
			print('Request failed with status code:', response.status_code)
	twitch_user_file.write(twitch_user_id)
	twitch_user_file.close()

if path.exists(hotkey_file):
	hotkey = int(open(hotkey_file, 'r').read())
	print('Hotkey:', hotkey)
else:
	print('Press a key to set the hotkey.')

# Check if stream is started before running the program.
response = requests.get('https://api.twitch.tv/helix/streams?user_id=' + twitch_user_id)
print(response.status_code)

# hook_manager = pyHook.HookManager()
# hook_manager.KeyDown = KeydownEvent
# hook_manager.HookKeyboard()
# pythoncom.PumpMessages()
