- How to install
```
npm install map-on-app-web-client
```

- How to use?
```
import {MapOnAppWebClient} from "map-on-app-web-client";

let myMap = new MapOnAppWebClient('map', 'YOUR_API_TOKEN', false, 'https://maponapp.com/');
```

```
    @param {string} container in which map will be loaded.
    @param {string} token is used to consume MapOnApp APIs (visit https://maponapp.com). Get the api token from your account.
    @param {boolean} checkBrowserLocation is to get geo location of user's browser. using browser's geolocation api.
    @param {string} baseURL is optional parameter. If you want to connect some other host to get map data.

    @returns {null} Returns the rounded up number.
```