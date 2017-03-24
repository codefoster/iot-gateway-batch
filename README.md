# iot-gateway-compression-gzip-nodejs
NodeJS GZip Compression Module for Azure IoT Gateway

Using this module, developers can build [Azure IoT Gateway](https://github.com/Azure/azure-iot-gateway-sdk) solutions that send and receive compressed messages to/from Azure IoT Hub.  Additionally, this same module can be imported and leveraged on the cloud side, through Azure Functions, to provide similar compression and decompression functionality.  When using with the Gateway, compression and decompression modules come with the proper interface to read and re-publish messages to the gateway's message broker.

### Installation 

`npm install iot-gateway-compression-gzip-nodejs --save`

### Usage 

#### Gateway

Add the following module to the `modules` section of your gateway JSON configuration file:

```javascript 
{
    "modules": [
        {
        "name": "compressor",
            "loader": {
                "name": "node",
                "entrypoint": {
                    "main.path": ".\node_modules\iot-gateway-compression-gzip-nodejs\(de)compressor.js"
                }
            },
            "args": null
        },
        ...
```

Then in the `links` section, patch the module into the message flow:

```javascript 
    ],
    "links": [
        {"source": "{reader_module}", "sink": "(de)compressor"},
        {"source": "(de)compressor", "sink": "{writer_module}"},
        ...
    ]
}
```

#### Azure Function

Add the package to your function, [instructions here](https://docs.microsoft.com/en-us/azure/azure-functions/functions-reference-node#node-version--package-management) then import the module

```javascript 
var (de)compressor = require('(de)compressor');
```

and then in your code simply call 

```javascript
(de)compress({Buffer}, {callback});
```

### Tests

`npm test`

### License

This project is licensed under the [MIT License](LICENSE).

### Contributing

When contributing to this repository, please create a GitHub issue to discuss the change you would like to make.

Please note we have a [code of conduct](CONTRIBUTING.md), please follow it in all your interactions with the project.

## Release History

* 0.2.1 Pulled (de)compress function out for Azure Function use.
* 0.2.0 Added decompression capabilities.
* 0.1.2 ReadMe Updates, removed base64 encoding of compressed messages.
* 0.1.1 URL Updates
* 0.1.0 Initial release

## Maintainers

- [@williamberryiii](https://github.com/WilliamBerryiii)