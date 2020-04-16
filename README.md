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
            "poll_interval": 30,
            "pet_occupancy": true,
            "occupancy_flipped": true
        }
    ]

### Note:
#### poll_interval (optional) 
If poll_interval it is not defined in the config it will default to 30. Adjusting this number will lengthen or shorten the amount of time between status checks for each accessory. I would recommend keeping this to above 5 seconds, but feel free to adjust this to your liking.

#### pet_occupancy (optional)
pet_occupancy will default to false. If this is true it will enable an occupancy sensor for each of your pets. During each "poll interval" the occupancy sensor will be updated to reflect if the app says the pet is inside or outside the house. "Occupancy Detected" means they are inside the house, "No Occupancy" means they are outside the house.

#### occupancy_flipped (optional)
occupancy_flipped will default to false. If you set this to true, the occupancy sensors state will be flipped. This means if your pet is outside, the sensor will read "occupancy detected". If a pet is inside the house occupancy will not be detected.

## Supports:
* Cat Door Connect
* Pet Door Connect

