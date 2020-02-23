# Python Stream Marker v1.0 by Travis Martin

import webbrowser

auth_url = 'https://id.twitch.tv/oauth2/authorize?client_id=v4r18uzz8695qn0b10jtmqnbmeh0sz&redirect_uri=http://localhost:8080&response_type=token&scope='
webbrowser.open_new(auth_url)