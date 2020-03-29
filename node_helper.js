const mqtt = require('mqtt');
const NodeHelper = require("node_helper");
const dateFormat = require('dateformat');
var node_helper_config;

module.exports = NodeHelper.create({

    start: function() {
        console.log(this.name + ': Starting node helper');
        this.loaded = false;
    },

    makeServerKey: function(address, port, user){
        return '' + address + ':' + (port | '1883' + user);
    },

    log: function(...args) {
        if (node_helper_config.logging) {
            console.log(args);
        }
    },
	
    formatDateTime: function(secs) {
        this.log("Secs", secs);
        var epoch = new Date(0);
        epoch.setSeconds(parseInt(secs));
        this.log("Epoch", epoch);
        var date = epoch.toISOString();
        this.log("date", date); 
        this.log("toLocaleTime",epoch.toLocaleTimeString(node_helper_config.localeStr));
        var dateStr = date.split('.')[0].split('T')[0]
        return dateStr.split('-')[2]+'.'+dateStr.split('-')[1] + ' ' + epoch.toLocaleTimeString(node_helper_config.localeStr).split(':')[0]+":"+epoch.toLocaleTimeString(node_helper_config.localeStr).split(':')[1];
    },



    startClient: function(config) {

		node_helper_config = config;
		
        console.log(this.name + ': Starting client for: ', config.mqttServerAddress);

        var self = this;
		
		var serverKey = this.makeServerKey(config.mqttServerAddress, config.mqttServerPort, config.mqttServerUser);
        var server = {}
		
        server.serverKey = serverKey;
        server.address = config.mqttServerAddress;
        server.port = config.mqttServerPort;
        server.options = {};
        if(config.mqttServerUser) server.options.username = config.mqttServerUser;
        if(config.mqttServerPassword) server.options.password = config.mqttServerPassword;
        server.topics = config.mqttTopics;

        var mqttServer = (server.address.match(/^mqtts?:\/\//) ? '' : 'mqtt://') + server.address;
        if (server.port) {
            mqttServer = mqttServer + ':' + server.port
        }
        console.log(self.name + ': Connecting to ' + mqttServer);

        server.client = mqtt.connect(mqttServer, server.options);

        server.client.on('error', function (err) {
            console.log(self.name + ' ' + server.serverKey + ': Error: ' + err);
        });

        server.client.on('reconnect', function (err) {
            server.value = 'reconnecting'; // Hmmm...
            console.log(self.name + ': ' + server.serverKey + ' reconnecting');
        });

        server.client.on('connect', function (connack) {
            console.log(self.name + ' connected to ' + mqttServer);
            console.log(self.name + ': subscribing to ' + server.topics);
            server.client.subscribe(server.topics);
        });

        server.client.on('message', function (topic, payload) {
           self.log(self.name + ' ' + topic + payload.toString() );
		   var now = Date.now();
		   var nowStr = self.formatDateTime(now/1000);
           self.log(self.name + ' ' + topic + now + ' ' + nowStr);
           self.sendSocketNotification('MQTT_PAYLOAD', {
                serverKey: server.serverKey,
                topic: topic,
                value: payload.toString(),
                time: now,
                timeStr: nowStr
            });
        });

    },

    socketNotificationReceived: function(notification, payload) {
        var self = this;
        console.log(self.name + ' Notification received: ' + notification + ' ' + payload);
		
        if (notification === 'MQTT_CONFIG') {
            var config = payload;
            console.log(self.name + ' MQTT_CONFIG: ' + config);
            self.startClient(config);
            self.loaded = true;
        }
    },
});
