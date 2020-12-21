# Rosé Music Bot

A Discord bot that streams audio to voice channels and features many other useful commands and utilities.

A lightweight aggregator, currently deployed and hosted on Heroku. Even when hosted locally, Rosé is low-impact on system resources and still features quick response times. 

For any questions, concerns, or assistance in getting this bot into your server - contact:

(e-mail) johnnie.tan27@gmail.com

(Discord) j o n#4444


## Table of Contents

* [Features](#features)
* [Requirements](#requirements)
* [Getting started](#getting-started)
* [Author](#author)

## Features

- Play music
- Skip songs
  - ![](./util/instructions/skip-function.gif)
- Pause and Resume playback
- Seeking and Looping
- Dynamic playlists 
  - ![](./util/instructions/queue-function.gif)
  - ![](./util/instructions/playlist-function.gif)
- YouTube queryable searches
  - ![](./util/instructions/search-function.gif)
- Lyrics by Genius-API
- Search up song, album, artist information using Spotify-API
- Scrobble audio, get listening trends, and history using LastFM-API

- Weekly/Daily server reminders

## Requirements

- [Node](https://nodejs.org/en/)
- [NPM](https://www.npmjs.com/)
- [Mongoose-ODM](https://www.npmjs.com/package/mongoose)

- [FFMPEG](https://www.ffmpeg.org/)
- [ytdl-core](https://www.npmjs.com/package/ytdl-core)
- [Simple-Youtube-API](https://www.npmjs.com/package/simple-youtube-api)
- [Youtube-Search](https://www.npmjs.com/package/youtube-search)

# Optional
- [Spotify-API](https://developer.spotify.com/documentation/web-api/)
- [LastFM-API](https://www.last.fm/api)
- [Genius-API](https://docs.genius.com/)
- [Cron](https://www.npmjs.com/package/cron) 

## Getting Started

First, make sure you have all the required modules and dependencies then continue with the following steps!

### Installation

```bash
# Clone the respository
git clone https://github.com/jcheonsa/rose-music-bot

# Enter into the directory
cd rose-music-bot/

# Install the dependencies
See the requirements above!
```
1) open 'config.json' in Rosé's root directory
2) configure your desired command prefix, place all of your API keys and Rosé/guild/channel IDs in the corresponding areas

### Configuration
After cloning the project and installing all of the dependencies, you're going to need to add your Discord API token in the config.json file as well.

https://discord.com/developers/applications to create your own Rosé clone and get your token!


## To Do

- [x] adding instructional gifs
- [x] fix seeking
- [ ] modular dependencies
- [x] Kaiba-bot

## Author

Johnnie Tan