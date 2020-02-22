import pythoncom, pyHook, os, pytz
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
            time = pytz.utc.localize(datetime.utcnow())
            output_file = open(output_file_directory, 'a')
            output_file.write(time.strftime('%Y-%m-%d %H:%M:%S %Z%z') + '\n')
            output_file.close()
        
    finally:
        return True

print('Starting StreamMarker.')

output_file_directory = shell.SHGetFolderPath(0, shellcon.CSIDL_DESKTOPDIRECTORY, None, 0) + '\\Stream Markers.txt'
data_folder = shell.SHGetFolderPath(0, shellcon.CSIDL_APPDATA, None, 0) + '\\T3\\StreamMarker\\'
twitch_user_file = data_folder + 'user'
hotkey_file = data_folder + 'hotkey'
twitch_user = None
hotkey = None

if not path.exists(data_folder):
    os.makedirs(data_folder)

if path.exists(twitch_user_file):
    twitch_user = open(twitch_user_file, 'r').read()
    print('Twitch user:', twitch_user)
else:
    twitch_user_file = open(twitch_user_file, 'w')
    twitch_user = input('Input the twitch user to link: ')
    twitch_user_file.write(twitch_user)
    twitch_user_file.close()

if path.exists(hotkey_file):
    hotkey = int(open(hotkey_file, 'r').read())
    print('Hotkey:', hotkey)
else:
    print('Press a key to set the hotkey.')

hook_manager = pyHook.HookManager()
hook_manager.KeyDown = KeydownEvent
hook_manager.HookKeyboard()
pythoncom.PumpMessages()
