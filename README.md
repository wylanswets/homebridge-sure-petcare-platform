# homebridge-sure-petcare-platform

Enables Sure Petcare products (currently only doors) to work with Homekit. If you would like to see their other accessories supported feel free to reach out through this repo or to submit a pull request.

To install:

    npm install -g homebridge-sure-petcare-platform

To configure, add this to your homebridge config.json file:
    
    
    "platforms": [
        {
            "platform": "SurePetcare",
            "email": "your_email@email.com",
            "password": "your_password",
            "poll_interval": 30
        }
    ]

### Note:
poll_interval is optional. If it is not defined in the config it will default to 30. Adjusting this number will lengthen or shorten the amount of time between status checks for each accessory. I would recommend keeping this to above 5 seconds, but feel free to adjust this to your liking.

## Supports:
* Pet Doors
