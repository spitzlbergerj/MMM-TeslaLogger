Module.register("MMM-TeslaLogger", {
	
   // Default module config
   defaults: {
      logging: false,
	  style: "lines",
	  maxAgeSeconds: 36000,    // Reduce intensity if values are older than 10 hours
	  localeStr: 'de-DE',

	  
	  // TeslaLogger posts MQTT with topic "Tesla"
      mqttTopics: [
         "Tesla",
      ],
	  
	  displayState: true,
      displaySpeed: false,
      displayPower: false,
      displayOdometer: false,
      displayIdeal_battery_range_km: false,
      displayOutside_temp: false,
      displayBattery_level: false,
      displayCharger_voltage: false,
      displayCharger_phases: false,
      displayCharger_actual_current: false,
      displayCharge_energy_added: false,
      displayCharger_power: false,
      displayCar_version: false,
      displayTrip_start: false,
      displayTrip_max_speed: false,
      displayTrip_max_power: false,
      displayTrip_duration_sec: false,
      displayTrip_kwh: false,
      displayTrip_avg_kwh: false,
      displayTrip_distance: false,
      displayTs: false,
      displayLatitude: false,
      displayLongitude: false,
      displayCharge_limit_soc: false,
      displayInside_temperature: false,
      displayBattery_heater: false,
      displayIs_preconditioning: false,
      displaySentry_mode: false,
	  
      unitSpeed: "km/h",
      unitPower: "kW",
      unitOdometer: "km",
      unitIdeal_battery_range_km: "km",
      unitOutside_temp: "°C",
      unitBattery_level: "%",
      unitCharger_voltage: "V",
      unitCharger_phases: "",
      unitCharger_actual_current: "A",
      unitCharge_energy_added: "kWh",
      unitCharger_power: "kW",
      unitCar_version: "",
      unitTrip_start: "Uhr",
      unitTrip_max_speed: "km/h",
      unitTrip_max_power: "kW",
      unitTrip_duration_sec: "Sek.",
      unitTrip_kwh: "kWh",
      unitTrip_avg_kwh: "kWh",
      unitTrip_distance: "km",
      unitTs: "Uhr",
      unitLatitude: "",
      unitLongitude: "",
      unitCharge_limit_soc: "%",
      unitInside_temperature: "°C",
      unitBattery_heater: "",
      unitIs_preconditioning: "",
      unitSentry_mode: "",

   },
   
   // TeslaLogger posts MQTT payload with these JSON elements
   TeslaLoggerJSON: {
      timeOfStatus: 0,
      charging: false,
      driving: false,
      online: false,
      sleeping: false,
      speed: 0,
      power: 0,
      odometer: 0,
      ideal_battery_range_km: 0,
      outside_temp: 0,
      battery_level: 0,
      charger_voltage: 0,
      charger_phases: 0,
      charger_actual_current: 0,
      charge_energy_added: 0,
      charger_power: 0,
      car_version: "0.0",
      trip_start: "00:00",
      trip_max_speed: 0,
      trip_max_power: 0,
      trip_duration_sec: 0,
      trip_kwh: 0,
      trip_avg_kwh: 0,
      trip_distance: 0,
      ts: "00:00",
      latitude: 0,
      longitude: 0,
      charge_limit_soc: 0,
      inside_temperature: 0,
      battery_heater: false,
      is_preconditioning: true,
      sentry_mode: false,
   },

   log: function(...args) {
      if (this.config.logging) {
         console.log(args);
      }
   },

   getStyles: function() {
      return ["MMM-TeslaLogger.css"];
   },

   getScripts: function() {
      return [
         this.file("node_modules/jsonpointer/jsonpointer.js"),
            "topics_match.js"
      ];
   },

   getTranslations: function() {
      return {
         en: "translations/en.json",
         de: "translations/de.json"
      }
   },
	
   makeServerKey: function(address, port, user) {
      return "" + address + ":" + (port | ("1883" + user));
   },

   start: function() {
      console.log(this.name + " started.");
      console.log(this.name + ": Setting up connection to TeslaLogger MQTT Broker " + this.config.mqttServerAddress + " at port " + this.config.mqttServerPort);
      console.log(this.name + ": TeslaLoggerJSON = " + this.TeslaLoggerJSON.car_version);

      this.TeslaLoggerJSON.timeOfStatus = Date.now();
	  
      this.sendSocketNotification("MQTT_CONFIG", this.config);
	  
      var self = this;
      setInterval(function() {
         self.updateDom(100);
      }, 50000);
   },

   socketNotificationReceived: function(notification, payload) {
	  this.log(this.name + " socketNotificationReceived " + notification + " JSON: " + payload.value);
      if (notification === "MQTT_PAYLOAD") {
         if (payload != null) {
            var value = payload.value;

            this.TeslaLoggerJSON.Charging = get(JSON.parse(value), "/charging");
            this.TeslaLoggerJSON.Driving = get(JSON.parse(value), "/driving");
            this.TeslaLoggerJSON.Online = get(JSON.parse(value), "/online");
            this.TeslaLoggerJSON.Sleeping = get(JSON.parse(value), "/sleeping");
            this.TeslaLoggerJSON.Speed = get(JSON.parse(value), "/speed");
            this.TeslaLoggerJSON.Power = get(JSON.parse(value), "/power");
            this.TeslaLoggerJSON.Odometer = get(JSON.parse(value), "/odometer");
            this.TeslaLoggerJSON.Ideal_battery_range_km = get(JSON.parse(value), "/ideal_battery_range_km");
            this.TeslaLoggerJSON.Outside_temp = get(JSON.parse(value), "/outside_temp");
            this.TeslaLoggerJSON.Battery_level = get(JSON.parse(value), "/battery_level");
            this.TeslaLoggerJSON.Charger_voltage = get(JSON.parse(value), "/charger_voltage");
            this.TeslaLoggerJSON.Charger_phases = get(JSON.parse(value), "/charger_phases");
            this.TeslaLoggerJSON.Charger_actual_current = get(JSON.parse(value), "/charger_actual_current");
            this.TeslaLoggerJSON.Charge_energy_added = get(JSON.parse(value), "/charge_energy_added");
            this.TeslaLoggerJSON.Charger_power = get(JSON.parse(value), "/charger_power");
            this.TeslaLoggerJSON.Car_version = get(JSON.parse(value), "/car_version");
            this.TeslaLoggerJSON.Trip_start = get(JSON.parse(value), "/trip_start");
            this.TeslaLoggerJSON.Trip_max_speed = get(JSON.parse(value), "/trip_max_speed");
            this.TeslaLoggerJSON.Trip_max_power = get(JSON.parse(value), "/trip_max_power");
            this.TeslaLoggerJSON.Trip_duration_sec = get(JSON.parse(value), "/trip_duration_sec");
            this.TeslaLoggerJSON.Trip_kwh = get(JSON.parse(value), "/trip_kwh");
            this.TeslaLoggerJSON.Trip_avg_kwh = get(JSON.parse(value), "/trip_avg_kwh");
            this.TeslaLoggerJSON.Trip_distance = get(JSON.parse(value), "/trip_distance");
            this.TeslaLoggerJSON.Ts = get(JSON.parse(value), "/ts");
            this.TeslaLoggerJSON.Latitude = get(JSON.parse(value), "/latitude");
            this.TeslaLoggerJSON.Longitude = get(JSON.parse(value), "/longitude");
            this.TeslaLoggerJSON.Charge_limit_soc = get(JSON.parse(value), "/charge_limit_soc");
            this.TeslaLoggerJSON.Inside_temperature = get(JSON.parse(value), "/inside_temperature");
            this.TeslaLoggerJSON.Battery_heater = get(JSON.parse(value), "/battery_heater");
            this.TeslaLoggerJSON.Is_preconditioning = get(JSON.parse(value), "/is_preconditioning");
            this.TeslaLoggerJSON.Sentry_mode = get(JSON.parse(value), "/sentry_mode");
			
			this.TeslaLoggerJSON.TimeOfStatus = payload.time;
			this.TeslaLoggerJSON.TimeOfStatusStr = payload.timeStr;
			
            this.updateDom();
         } 
         else 
         {
            this.log(this.name + ": MQTT_PAYLOAD - No payload");
         }
      }
   },

   getDom: function() {
      self = this;
      var wrapper;
      var table;
	  var row;
	  var label;
	  var value;
	  var suffix;
	  
	  var tooOld = self.isValueTooOld(self.config.maxAgeSeconds, self.TeslaLoggerJSON.TimeOfStatus);

	  wrapper = document.createElement("div");
	  wrapper.className = "MMM-TeslaLogger-wrap";
	  
	  table = document.createElement("table");
      table.className = "small";
	  
      if (self.config.displayState) {
         row = document.createElement("tr");
		  
		 label = document.createElement("td");
		 label.innerHTML = self.translate("STATE");
         label.className = "align-left TeslaLogger-label";

		 value = document.createElement("td");
		 if (self.TeslaLoggerJSON.Charging) {
            value.innerHTML = self.translate("CHARGING");
		 }
		 else if (self.TeslaLoggerJSON.Driving) {
            value.innerHTML = self.translate("DRIVING");
		 }
		 else if (self.TeslaLoggerJSON.Online) {
            value.innerHTML = self.translate("ONLINE");
		 }
		 else if (self.TeslaLoggerJSON.Sleeping) {
            value.innerHTML = self.translate("SLEEPING");
		 }
		 else {
            value.innerHTML = self.translate("UNDEFINED");
		 }
         value.className = "align-right TeslaLogger-value " + (tooOld ? "dimmed" : "bright");
		
 		 suffix = document.createElement("td");
		 suffix.innerHTML = "";
         suffix.className = "align-left TeslaLogger-suffix";
		 
		 row.appendChild(label);
		 row.appendChild(value);
		 row.appendChild(suffix);
		 
		 table.appendChild(row);
     }

      if (self.config.displaySpeed) {
         row = document.createElement("tr");
		  
		 label = document.createElement("td");
		 label.innerHTML = self.translate("SPEED");
         label.className = "align-left TeslaLogger-label";

		 value = document.createElement("td");
		 value.innerHTML = self.TeslaLoggerJSON.Speed;
         value.className = "align-right TeslaLogger-value " + (tooOld ? "dimmed" : "bright");
		 
 		 suffix = document.createElement("td");
		 suffix.innerHTML = self.config.unitSpeed;
         suffix.className = "align-left TeslaLogger-suffix";
		 
		 row.appendChild(label);
		 row.appendChild(value);
		 row.appendChild(suffix);
		 
		 table.appendChild(row);
     }

      if (self.config.displayPower) {
         row = document.createElement("tr");
		  
		 label = document.createElement("td");
		 label.innerHTML = self.translate("POWER");
         label.className = "align-left TeslaLogger-label";

		 value = document.createElement("td");
		 value.innerHTML = self.TeslaLoggerJSON.Power;
         value.className = "align-right TeslaLogger-value " + (tooOld ? "dimmed" : "bright");
		 
 		 suffix = document.createElement("td");
		 suffix.innerHTML = self.config.unitPower;
         suffix.className = "align-left TeslaLogger-suffix";
		 
		 row.appendChild(label);
		 row.appendChild(value);
		 row.appendChild(suffix);
		 
		 table.appendChild(row);
     }

      if (self.config.displayOdometer) {
         row = document.createElement("tr");
		  
		 label = document.createElement("td");
		 label.innerHTML = self.translate("ODOMETER");
         label.className = "align-left TeslaLogger-label";

		 value = document.createElement("td");
		 value.innerHTML = Math.round(self.TeslaLoggerJSON.Odometer);
         value.className = "align-right TeslaLogger-value " + (tooOld ? "dimmed" : "bright");
		 
 		 suffix = document.createElement("td");
		 suffix.innerHTML = self.config.unitOdometer;
         suffix.className = "align-left TeslaLogger-suffix";
		 
		 row.appendChild(label);
		 row.appendChild(value);
		 row.appendChild(suffix);
		 
		 table.appendChild(row);
     }
 
      if (self.config.displayIdeal_battery_range_km) {
         row = document.createElement("tr");
		  
		 label = document.createElement("td");
		 label.innerHTML = self.translate("IDEAL_BATTERY_RANGE_KM");
         label.className = "align-left TeslaLogger-label";

		 value = document.createElement("td");
		 value.innerHTML = Math.round(self.TeslaLoggerJSON.Ideal_battery_range_km);
         value.className = "align-right TeslaLogger-value " + (tooOld ? "dimmed" : "bright");
		 
 		 suffix = document.createElement("td");
		 suffix.innerHTML = self.config.unitIdeal_battery_range_km;
         suffix.className = "align-left TeslaLogger-suffix";
		 
		 row.appendChild(label);
		 row.appendChild(value);
		 row.appendChild(suffix);
		 
		 table.appendChild(row);
     }

      if (self.config.displayOutside_temp) {
         row = document.createElement("tr");
		  
		 label = document.createElement("td");
		 label.innerHTML = self.translate("OUTSIDE_TEMP");
         label.className = "align-left TeslaLogger-label";

		 value = document.createElement("td");
		 value.innerHTML = self.TeslaLoggerJSON.Outside_temp;
         value.className = "align-right TeslaLogger-value " + (tooOld ? "dimmed" : "bright");
		 
 		 suffix = document.createElement("td");
		 suffix.innerHTML = self.config.unitOutside_temp;
         suffix.className = "align-left TeslaLogger-suffix";
		 
		 row.appendChild(label);
		 row.appendChild(value);
		 row.appendChild(suffix);
		 
		 table.appendChild(row);
     }

      if (self.config.displayBattery_level) {
         row = document.createElement("tr");
		  
		 label = document.createElement("td");
		 label.innerHTML = self.translate("BATTERY_LEVEL");
         label.className = "align-left TeslaLogger-label";

		 value = document.createElement("td");
		 value.innerHTML = self.TeslaLoggerJSON.Battery_level;
         value.className = "align-right TeslaLogger-value " + (tooOld ? "dimmed" : "bright");
		 
 		 suffix = document.createElement("td");
		 suffix.innerHTML = self.config.unitBattery_level;
         suffix.className = "align-left TeslaLogger-suffix";
		 
		 row.appendChild(label);
		 row.appendChild(value);
		 row.appendChild(suffix);
		 
		 table.appendChild(row);
     }

      if (self.config.displayCharger_voltage) {
         row = document.createElement("tr");
		  
		 label = document.createElement("td");
		 label.innerHTML = self.translate("CHARGER_VOLTAGE");
         label.className = "align-left TeslaLogger-label";

		 value = document.createElement("td");
		 value.innerHTML = self.TeslaLoggerJSON.Charger_voltage;
         value.className = "align-right TeslaLogger-value " + (tooOld ? "dimmed" : "bright");
		 
 		 suffix = document.createElement("td");
		 suffix.innerHTML = self.config.unitCharger_voltage;
         suffix.className = "align-left TeslaLogger-suffix";
		 
		 row.appendChild(label);
		 row.appendChild(value);
		 row.appendChild(suffix);
		 
		 table.appendChild(row);
     }

      if (self.config.displayCharger_phases) {
         row = document.createElement("tr");
		  
		 label = document.createElement("td");
		 label.innerHTML = self.translate("CHARGER_PHASES");
         label.className = "align-left TeslaLogger-label";

		 value = document.createElement("td");
		 value.innerHTML = self.TeslaLoggerJSON.Charger_phases;
         value.className = "align-right TeslaLogger-value " + (tooOld ? "dimmed" : "bright");
		 
 		 suffix = document.createElement("td");
		 suffix.innerHTML = self.config.unitCharger_phases;
         suffix.className = "align-left TeslaLogger-suffix";
		 
		 row.appendChild(label);
		 row.appendChild(value);
		 row.appendChild(suffix);
		 
		 table.appendChild(row);
     }

      if (self.config.displayCharger_actual_current) {
         row = document.createElement("tr");
		  
		 label = document.createElement("td");
		 label.innerHTML = self.translate("CHARGER_ACTUAL_CURRENT");
         label.className = "align-left TeslaLogger-label";

		 value = document.createElement("td");
		 value.innerHTML = self.TeslaLoggerJSON.Charger_actual_current;
         value.className = "align-right TeslaLogger-value " + (tooOld ? "dimmed" : "bright");
		 
 		 suffix = document.createElement("td");
		 suffix.innerHTML = self.config.unitCharger_actual_current;
         suffix.className = "align-left TeslaLogger-suffix";
		 
		 row.appendChild(label);
		 row.appendChild(value);
		 row.appendChild(suffix);
		 
		 table.appendChild(row);
     }

      if (self.config.displayCharge_energy_added) {
         row = document.createElement("tr");
		  
		 label = document.createElement("td");
		 label.innerHTML = self.translate("CHARGE_ENERGY_ADDED");
         label.className = "align-left TeslaLogger-label";

		 value = document.createElement("td");
		 value.innerHTML = self.TeslaLoggerJSON.Charge_energy_added;
         value.className = "align-right TeslaLogger-value " + (tooOld ? "dimmed" : "bright");
		 
 		 suffix = document.createElement("td");
		 suffix.innerHTML = self.config.unitCharge_energy_added;
         suffix.className = "align-left TeslaLogger-suffix";
		 
		 row.appendChild(label);
		 row.appendChild(value);
		 row.appendChild(suffix);
		 
		 table.appendChild(row);
     }

      if (self.config.displayCharger_power) {
         row = document.createElement("tr");
		  
		 label = document.createElement("td");
		 label.innerHTML = self.translate("CHARGER_POWER");
         label.className = "align-left TeslaLogger-label";

		 value = document.createElement("td");
		 value.innerHTML = self.TeslaLoggerJSON.Charger_power;
         value.className = "align-right TeslaLogger-value " + (tooOld ? "dimmed" : "bright");
		 
 		 suffix = document.createElement("td");
		 suffix.innerHTML = self.config.unitCharger_power;
         suffix.className = "align-left TeslaLogger-suffix";
		 
		 row.appendChild(label);
		 row.appendChild(value);
		 row.appendChild(suffix);
		 
		 table.appendChild(row);
     }

      if (self.config.displayCar_version) {
         row = document.createElement("tr");
		  
		 label = document.createElement("td");
		 label.innerHTML = self.translate("CAR_VERSION");
         label.className = "align-left TeslaLogger-label";

		 value = document.createElement("td");
		 value.innerHTML = self.TeslaLoggerJSON.Car_version;
         value.className = "align-right TeslaLogger-value " + (tooOld ? "dimmed" : "bright");
		 
 		 suffix = document.createElement("td");
		 suffix.innerHTML = self.config.unitCar_version;
         suffix.className = "align-left TeslaLogger-suffix";
		 
		 row.appendChild(label);
		 row.appendChild(value);
		 row.appendChild(suffix);
		 
		 table.appendChild(row);
     }

      if (self.config.displayTrip_start) {
         row = document.createElement("tr");
		  
		 label = document.createElement("td");
		 label.innerHTML = self.translate("TRIP_START");
         label.className = "align-left TeslaLogger-label";

		 value = document.createElement("td");
		 value.innerHTML = self.TeslaLoggerJSON.Trip_start;
         value.className = "align-right TeslaLogger-value " + (tooOld ? "dimmed" : "bright");
		 
 		 suffix = document.createElement("td");
		 suffix.innerHTML = self.config.unitTrip_start;
         suffix.className = "align-left TeslaLogger-suffix";
		 
		 row.appendChild(label);
		 row.appendChild(value);
		 row.appendChild(suffix);
		 
		 table.appendChild(row);
     }

      if (self.config.displayTrip_max_speed) {
         row = document.createElement("tr");
		  
		 label = document.createElement("td");
		 label.innerHTML = self.translate("TRIP_MAX_SPEED");
         label.className = "align-left TeslaLogger-label";

		 value = document.createElement("td");
		 value.innerHTML = self.TeslaLoggerJSON.Trip_max_speed;
         value.className = "align-right TeslaLogger-value " + (tooOld ? "dimmed" : "bright");
		 
 		 suffix = document.createElement("td");
		 suffix.innerHTML = self.config.unitTrip_max_speed;
         suffix.className = "align-left TeslaLogger-suffix";
		 
		 row.appendChild(label);
		 row.appendChild(value);
		 row.appendChild(suffix);
		 
		 table.appendChild(row);
     }

      if (self.config.displayTrip_max_power) {
         row = document.createElement("tr");
		  
		 label = document.createElement("td");
		 label.innerHTML = self.translate("Trip_max_power");
         label.className = "align-left TeslaLogger-label";

		 value = document.createElement("td");
		 value.innerHTML = self.TeslaLoggerJSON.Trip_max_power;
         value.className = "align-right TeslaLogger-value " + (tooOld ? "dimmed" : "bright");
		 
 		 suffix = document.createElement("td");
		 suffix.innerHTML = self.config.unitTrip_max_power;
         suffix.className = "align-left TeslaLogger-suffix";
		 
		 row.appendChild(label);
		 row.appendChild(value);
		 row.appendChild(suffix);
		 
		 table.appendChild(row);
     }

      if (self.config.displayTrip_duration_sec) {
         row = document.createElement("tr");
		  
		 label = document.createElement("td");
		 label.innerHTML = self.translate("TRIP_DURATION_SEC");
         label.className = "align-left TeslaLogger-label";

		 value = document.createElement("td");
		 value.innerHTML = self.TeslaLoggerJSON.Trip_duration_sec;
         value.className = "align-right TeslaLogger-value " + (tooOld ? "dimmed" : "bright");
		 
 		 suffix = document.createElement("td");
		 suffix.innerHTML = self.config.unitTrip_duration_sec;
         suffix.className = "align-left TeslaLogger-suffix";
		 
		 row.appendChild(label);
		 row.appendChild(value);
		 row.appendChild(suffix);
		 
		 table.appendChild(row);
     }

      if (self.config.displayTrip_kwh) {
         row = document.createElement("tr");
		  
		 label = document.createElement("td");
		 label.innerHTML = self.translate("TRIP_KWH");
         label.className = "align-left TeslaLogger-label";

		 value = document.createElement("td");
		 value.innerHTML = Math.round(self.TeslaLoggerJSON.Trip_kwh);
         value.className = "align-right TeslaLogger-value " + (tooOld ? "dimmed" : "bright");
		 
 		 suffix = document.createElement("td");
		 suffix.innerHTML = self.config.unitTrip_kwh;
         suffix.className = "align-left TeslaLogger-suffix";
		 
		 row.appendChild(label);
		 row.appendChild(value);
		 row.appendChild(suffix);
		 
		 table.appendChild(row);
     }

      if (self.config.displayTrip_avg_kwh) {
         row = document.createElement("tr");
		  
		 label = document.createElement("td");
		 label.innerHTML = self.translate("TRIP_AVG_KWH");
         label.className = "align-left TeslaLogger-label";

		 value = document.createElement("td");
		 value.innerHTML = Math.round(self.TeslaLoggerJSON.Trip_avg_kwh);
         value.className = "align-right TeslaLogger-value " + (tooOld ? "dimmed" : "bright");
		 
 		 suffix = document.createElement("td");
		 suffix.innerHTML = self.config.unitTrip_avg_kwh;
         suffix.className = "align-left TeslaLogger-suffix";
		 
		 row.appendChild(label);
		 row.appendChild(value);
		 row.appendChild(suffix);
		 
		 table.appendChild(row);
     }

      if (self.config.displayTrip_distance) {
         row = document.createElement("tr");
		  
		 label = document.createElement("td");
		 label.innerHTML = self.translate("TRIP_DISTANCE");
         label.className = "align-left TeslaLogger-label";

		 value = document.createElement("td");
		 value.innerHTML = Math.round(self.TeslaLoggerJSON.Trip_distance);
         value.className = "align-right TeslaLogger-value " + (tooOld ? "dimmed" : "bright");
		 
 		 suffix = document.createElement("td");
		 suffix.innerHTML = self.config.unitTrip_distance;
         suffix.className = "align-left TeslaLogger-suffix";
		 
		 row.appendChild(label);
		 row.appendChild(value);
		 row.appendChild(suffix);
		 
		 table.appendChild(row);
     }

      if (self.config.displayTs) {
         row = document.createElement("tr");
		  
		 label = document.createElement("td");
		 label.innerHTML = self.translate("TS");
         label.className = "align-left TeslaLogger-label";

		 value = document.createElement("td");
		 value.innerHTML = self.TeslaLoggerJSON.Ts;
         value.className = "align-right TeslaLogger-value " + (tooOld ? "dimmed" : "bright");
		 
 		 suffix = document.createElement("td");
		 suffix.innerHTML = self.config.unitTs;
         suffix.className = "align-left TeslaLogger-suffix";
		 
		 row.appendChild(label);
		 row.appendChild(value);
		 row.appendChild(suffix);
		 
		 table.appendChild(row);
     }

      if (self.config.displayLatitude) {
         row = document.createElement("tr");
		  
		 label = document.createElement("td");
		 label.innerHTML = self.translate("LATITUDE");
         label.className = "align-left TeslaLogger-label";

		 value = document.createElement("td");
		 value.innerHTML = self.TeslaLoggerJSON.Latitude;
         value.className = "align-right TeslaLogger-value " + (tooOld ? "dimmed" : "bright");
		 
 		 suffix = document.createElement("td");
		 suffix.innerHTML = self.config.unitLatitude;
         suffix.className = "align-left TeslaLogger-suffix";
		 
		 row.appendChild(label);
		 row.appendChild(value);
		 row.appendChild(suffix);
		 
		 table.appendChild(row);
     }

      if (self.config.displayLongitude) {
         row = document.createElement("tr");
		  
		 label = document.createElement("td");
		 label.innerHTML = self.translate("LONGITUDE");
         label.className = "align-left TeslaLogger-label";

		 value = document.createElement("td");
		 value.innerHTML = self.TeslaLoggerJSON.Longitude;
         value.className = "align-right TeslaLogger-value " + (tooOld ? "dimmed" : "bright");
		 
 		 suffix = document.createElement("td");
		 suffix.innerHTML = self.config.unitLongitude;
         suffix.className = "align-left TeslaLogger-suffix";
		 
		 row.appendChild(label);
		 row.appendChild(value);
		 row.appendChild(suffix);
		 
		 table.appendChild(row);
     }

      if (self.config.displayCharge_limit_soc) {
         row = document.createElement("tr");
		  
		 label = document.createElement("td");
		 label.innerHTML = self.translate("CHARGE_LIMIT_SOC");
         label.className = "align-left TeslaLogger-label";

		 value = document.createElement("td");
		 value.innerHTML = self.TeslaLoggerJSON.Charge_limit_soc;
         value.className = "align-right TeslaLogger-value " + (tooOld ? "dimmed" : "bright");
		 
 		 suffix = document.createElement("td");
		 suffix.innerHTML = self.config.unitCharge_limit_soc;
         suffix.className = "align-left TeslaLogger-suffix";
		 
		 row.appendChild(label);
		 row.appendChild(value);
		 row.appendChild(suffix);
		 
		 table.appendChild(row);
     }

      if (self.config.displayInside_temperature) {
         row = document.createElement("tr");
		  
		 label = document.createElement("td");
		 label.innerHTML = self.translate("INSIDE_TEMPERATURE");
         label.className = "align-left TeslaLogger-label";

		 value = document.createElement("td");
		 value.innerHTML = self.TeslaLoggerJSON.Inside_temperature;
         value.className = "align-right TeslaLogger-value " + (tooOld ? "dimmed" : "bright");
		 
 		 suffix = document.createElement("td");
		 suffix.innerHTML = self.config.unitInside_temperature;
         suffix.className = "align-left TeslaLogger-suffix";
		 
		 row.appendChild(label);
		 row.appendChild(value);
		 row.appendChild(suffix);
		 
		 table.appendChild(row);
     }

      if (self.config.displayBattery_heater) {
         row = document.createElement("tr");
		  
		 label = document.createElement("td");
		 label.innerHTML = self.translate("BATTERY_HEATER");
         label.className = "align-left TeslaLogger-label";

		 value = document.createElement("td");
		 value.innerHTML = self.TeslaLoggerJSON.Battery_heater;
         value.className = "align-right TeslaLogger-value " + (tooOld ? "dimmed" : "bright");
		 
 		 suffix = document.createElement("td");
		 suffix.innerHTML = self.config.unitBattery_heater;
         suffix.className = "align-left TeslaLogger-suffix";
		 
		 row.appendChild(label);
		 row.appendChild(value);
		 row.appendChild(suffix);
		 
		 table.appendChild(row);
     }

      if (self.config.displayIs_preconditioning) {
         row = document.createElement("tr");
		  
		 label = document.createElement("td");
		 label.innerHTML = self.translate("Is_preconditioning");
         label.className = "align-left TeslaLogger-label";

		 value = document.createElement("td");
		 value.innerHTML = self.TeslaLoggerJSON.Is_preconditioning;
         value.className = "align-right TeslaLogger-value " + (tooOld ? "dimmed" : "bright");
		 
 		 suffix = document.createElement("td");
		 suffix.innerHTML = self.config.unitIs_preconditioning;
         suffix.className = "align-left TeslaLogger-suffix";
		 
		 row.appendChild(label);
		 row.appendChild(value);
		 row.appendChild(suffix);
		 
		 table.appendChild(row);
     }

      if (self.config.displaySentry_mode) {
         row = document.createElement("tr");
		  
		 label = document.createElement("td");
		 label.innerHTML = self.translate("SENTRY_MODE");
         label.className = "align-left TeslaLogger-label";

		 value = document.createElement("td");
		 value.innerHTML = self.TeslaLoggerJSON.Sentry_mode;
         value.className = "align-right TeslaLogger-value " + (tooOld ? "dimmed" : "bright");
		 
 		 suffix = document.createElement("td");
		 suffix.innerHTML = self.config.unitSentry_mode;
         suffix.className = "align-left TeslaLogger-suffix";
		 
		 row.appendChild(label);
		 row.appendChild(value);
		 row.appendChild(suffix);
		 
		 table.appendChild(row);
     }

 

	 // time of MQTT Message
	 row = document.createElement("tr");
	  
	 label = document.createElement("td");
	 label.innerHTML = self.translate("STATUS");
	 label.className = "align-left xsmall TeslaLogger-label";

	 value = document.createElement("td");
	 value.innerHTML = self.TeslaLoggerJSON.timeOfStatusStr;
	 value.className = "align-right xsmall TeslaLogger-value ";
	 
	 suffix = document.createElement("td");
	 suffix.innerHTML = "";
	 suffix.className = "align-left xsmall TeslaLogger-suffix";
	 
	 row.appendChild(label);
	 row.appendChild(value);
	 row.appendChild(suffix);
		 
	 table.appendChild(row);

      wrapper.appendChild(table);
      return wrapper;
   },
   

  isValueTooOld: function(maxAgeSeconds, updatedTime) {
    this.log(this.name + ': maxAgeSeconds = ', maxAgeSeconds);
    this.log(this.name + ': updatedTime = ', updatedTime);
    this.log(this.name + ': Date.now() = ', Date.now());
    if (maxAgeSeconds) {
      if (updatedTime + maxAgeSeconds * 1000 < Date.now()) {
        return true;
      }
    }
    return false;
  },


// ------------------------------------------------------------------------
// the next three functions are not adapted to the 
// variable label structure of MMM-TeslaLogger 
// and come unchanged from MMM-MQTT
// They were left in the code to make future needs easier to realize. :-)
// -------------------------------------------------------------------------

  getColors: function(sub) {
    this.log(sub.topic);
    this.log("Colors:", sub.colors);
    this.log("Value: ", sub.value);
    if (!sub.colors || sub.colors.length == 0) {
      return {};
    }

    let colors;
    for (i = 0; i < sub.colors.length; i++) {
      colors = sub.colors[i];
      if (sub.value < sub.colors[i].upTo) {
        break;
      }
    }

    return colors;
  },

   multiply: function(sub, value) {
      if (!sub.multiply && !sub.divide) {
         return value;
      }
      if (!value) {
         return value;
      }
      if (isNaN(value)) {
         return value;
      }
      let res = (+value * (sub.multiply || 1)) / (sub.divide || 1);
      return isNaN(res) ? value : "" + res;
   },

   convertValue: function(sub) {
      if (!sub.conversions || sub.conversions.length == 0) {
         return sub.value;
      }
      for (i = 0; i < sub.conversions.length; i++) {
         if (sub.value == sub.conversions[i].from) {
            return sub.conversions[i].to;
         }
      }
      return sub.value;
   },

// ------------------------------------------------------------------------
// the previous three functions are not adapted to the 
// variable label structure of MMM-TeslaLogger 
// and come unchanged from MMM-MQTT
// They were left in the code to make future needs easier to realize. :-)
// ------------------------------------------------------------------------

});
