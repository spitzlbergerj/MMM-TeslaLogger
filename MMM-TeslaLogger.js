Module.register("MMM-TeslaLogger", {
	
   // Default module config
   defaults: {
      logging: false,
	  style: "lines",			// lines, groupedLines, image
	  maxAgeSeconds: 36000,    // Reduce intensity if values are older than 10 hours
	  localeStr: 'de-DE',
      imageURL: 'modules/MMM-TeslaLogger/img/teslaModelSBlack.png',
	  imageSize: "70%",
      sentryImageURL: 'modules/MMM-TeslaLogger/img/HAL9000.png',
	  
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
      displayLock: false,
	  
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
	  lock: false,
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
      this.TeslaLoggerJSON.timeOfStatusStr = this.formatDateTime(this.TeslaLoggerJSON.timeOfStatus/1000);;
	  
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
	  
	  if (self.config.style === "lines") {
		  table = self.getDomLines(table);
	  }
	  else if (self.config.style === "groupedLines") {
		  table = self.getDomGroupedLines(table);
	  }
	  else {
		  table = self.getDomImage(table);
	  }
	  
      // time of MQTT Message
      row = document.createElement("tr");
	  
      label = document.createElement("td");
      label.innerHTML = self.translate("STATUS");
      label.className = "align-left xsmall dimmed TeslaLogger-MQTT-time-label";

      value = document.createElement("td");
      value.innerHTML = self.TeslaLoggerJSON.TimeOfStatusStr;
      value.className = "align-left xsmall dimmed TeslaLogger-MQTT-time-value ";
	 
      row.appendChild(label);
      row.appendChild(value);
		 
      table.appendChild(row);

      wrapper.appendChild(table);
      return wrapper;
   },
   

   getDomLines: function(table) {
      self = this;
	  var row;
	  var symbolCell;
	  var symbol;
	  var value;
	  
	  var tooOld = self.isValueTooOld(self.config.maxAgeSeconds, self.TeslaLoggerJSON.TimeOfStatus);

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
		 var versionStr;
		 if (self.TeslaLoggerJSON.Car_version) {
		    versionStr = self.TeslaLoggerJSON.Car_version;
		 } else {
		    versionStr = self.translate("UNKNOWN");
		 }
		 
         row = document.createElement("tr");
		  
		 label = document.createElement("td");
		 label.innerHTML = self.translate("CAR_VERSION");
         label.className = "align-left TeslaLogger-label";

		 value = document.createElement("td");
		 value.innerHTML = versionStr.substr(0, versionStr.indexOf(" "));
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
		 value.innerHTML = ( self.TeslaLoggerJSON.Battery_heater ? self.translate("ON") :self.translate("OFF") );
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
		 label.innerHTML = self.translate("IS_PRECONDITIONING");
         label.className = "align-left TeslaLogger-label";

		 value = document.createElement("td");
		 value.innerHTML = ( self.TeslaLoggerJSON.Is_preconditioning ? self.translate("ON") :self.translate("OFF") );
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
		 value.innerHTML = ( self.TeslaLoggerJSON.Sentry_mode ? self.translate("ON") :self.translate("OFF") );
         value.className = "align-right TeslaLogger-value " + (tooOld ? "dimmed" : "bright");
		 
 		 suffix = document.createElement("td");
		 suffix.innerHTML = self.config.unitSentry_mode;
         suffix.className = "align-left TeslaLogger-suffix";
		 
		 row.appendChild(label);
		 row.appendChild(value);
		 row.appendChild(suffix);
		 
		 table.appendChild(row);
      }
	 
      return table;
   },
   
   getDomGroupedLines: function(table) {
      self = this;
	  var row;
	  var symbolCell;
	  var symbol;
	  var value;
	  var content;
	  var contentDiv;
	  
	  var tooOld = self.isValueTooOld(self.config.maxAgeSeconds, self.TeslaLoggerJSON.TimeOfStatus);

      // --------------------------------------------------------
	  // state and speed
	  // --------------------------------------------------------
		 
      if (self.config.displayState) {
         row = document.createElement("tr");
		  
		 symbolCell = document.createElement("td");
         symbolCell.className = "align-left TeslaLogger-label";
		 
		 symbol = document.createElement("i");
         symbol.className = "fa fa-fw fa-toggle-off";
		 
		 symbolCell.appendChild(symbol);

		 value = document.createElement("td");
		 
		 if (self.TeslaLoggerJSON.Charging) {
            value.innerHTML = self.translate("CHARGING");
		 }
		 else if (self.TeslaLoggerJSON.Online) {
            value.innerHTML = self.translate("ONLINE");
		 }
		 else if (self.TeslaLoggerJSON.Sleeping) {
            value.innerHTML = self.translate("SLEEPING");
		 }
		 else if (self.TeslaLoggerJSON.Driving) {
            content = self.translate("DRIVING")
			if (self.config.displaySpeed) {
				content = content + " " + self.translate("WITH") + " " + self.TeslaLoggerJSON.Speed + " " + self.config.unitSpeed;
			}
			value.innerHTML = content;
		 }
		 else {
            value.innerHTML = self.translate("UNDEFINED");
		 }
         value.className = "align-left TeslaLogger-value " + (tooOld ? "dimmed" : "bright");
		
		 row.appendChild(symbolCell);
		 row.appendChild(value);
		 
		 table.appendChild(row);
      }

      // --------------------------------------------------------
	  // battery level, ideal battery range km, max level
	  // --------------------------------------------------------
		 

       if (self.config.displayBattery_level) {
         row = document.createElement("tr");
		  
		 symbolCell = document.createElement("td");
         symbolCell.className = "align-left TeslaLogger-label";
		 
		 symbol = document.createElement("i");
         symbol.className = "fa fa-fw fa-battery-three-quarters";
		 
		 symbolCell.appendChild(symbol);


		 value = document.createElement("td");
		 
		 content = self.TeslaLoggerJSON.Battery_level + " " + self.config.unitBattery_level;
		 
		 if (self.config.displayIdeal_battery_range_km) {
			 content = content + ", " + Math.round(self.TeslaLoggerJSON.Ideal_battery_range_km) + " " + self.config.unitIdeal_battery_range_km;
		  }
		 
		 if (self.config.displayCharge_limit_soc) {
			 content = content + ", " + self.translate("MAX") + " " + self.TeslaLoggerJSON.Charge_limit_soc + " " + self.config.unitCharge_limit_soc;
		  }

		 value.innerHTML = content;
         value.className = "align-left TeslaLogger-value " + (tooOld ? "dimmed" : "bright");
		 
		 row.appendChild(symbolCell);
		 row.appendChild(value);
		 
		 table.appendChild(row);
      }


      // --------------------------------------------------------
	  // charging
	  // --------------------------------------------------------
		 
      if (self.config.displayCharger_voltage) {
         row = document.createElement("tr");
		  
		 symbolCell = document.createElement("td");
         symbolCell.className = "align-left TeslaLogger-label";
		 
		 symbol = document.createElement("i");
         symbol.className = "fa fa-fw fa-charging-station";
		 
		 symbolCell.appendChild(symbol);


		 value = document.createElement("td");
		 
         if (self.TeslaLoggerJSON.Charger_voltage == 0) {
			 content = self.translate("NOTCHARGING");
		 }
		 else {
			 content = self.TeslaLoggerJSON.Charger_voltage + " " + self.config.unitCharger_voltage;
			 
			 if (self.config.displayCharger_phases) {
			    content = content + ", " + self.TeslaLoggerJSON.Charger_phases + self.translate("PHASES");
			 }

			 if (self.config.displayCharger_actual_current) {
			    content = content + ", " + self.TeslaLoggerJSON.Charger_actual_current + " " + self.config.unitCharger_actual_current;
			 }			 

			 if (self.config.displayCharge_energy_added) {
			    content = content + ", + " + self.TeslaLoggerJSON.Charge_energy_added + " " + self.config.unitCharge_energy_added;
			 }			 
		 }
		 
		 value.innerHTML = content;
         value.className = "align-left TeslaLogger-value " + (tooOld ? "dimmed" : "bright");
		 		 
		 row.appendChild(symbolCell);
		 row.appendChild(value);
		 
		 table.appendChild(row);
      }


      // --------------------------------------------------------
	  // Lock
	  // --------------------------------------------------------
		 
      if (self.config.displayLock) {
         row = document.createElement("tr");
		  
		 symbolCell = document.createElement("td");
         symbolCell.className = "align-left TeslaLogger-label";
		 
		 symbol = document.createElement("i");
         symbol.className = "fa fa-fw fa-unlock-alt";
		 
		 symbolCell.appendChild(symbol);


		 value = document.createElement("td");
		 
		 contentDiv = document.createElement("div");
 		 contentDiv.style.display = "inline";	
		 
         if (self.TeslaLoggerJSON.lock === false) {
			 content = self.translate("OPEN");
		 }
		 else {
			 content = self.translate("CLOSED");
		 }
			 
		 contentDiv.innerHTML = content + "&nbsp;&nbsp;&nbsp;&nbsp;";  
		 value.appendChild(contentDiv);
		 
		 
		 if (self.config.displaySentry_mode && self.TeslaLoggerJSON.Sentry_mode) {
	   	    symbol = document.createElement('img');
			symbol.src = self.config.sentryImageURL;
			symbol.width = '18';
			symbol.style.display = "inline";	
		
		    value.appendChild(symbol);
		 }
		 
         value.className = "align-left TeslaLogger-value " + (tooOld ? "dimmed" : "bright");
		 		 
		 row.appendChild(symbolCell);
		 row.appendChild(value);
		 
		 table.appendChild(row);
      }

      // --------------------------------------------------------
	  // temperatures
	  // --------------------------------------------------------
		 
      if (self.config.displayOutside_temp) {
         row = document.createElement("tr");
		  
		 symbolCell = document.createElement("td");
         symbolCell.className = "align-left TeslaLogger-label";
		 
		 symbol = document.createElement("i");
         symbol.className = "fa fa-fw fa-thermometer-half";
		 
		 symbolCell.appendChild(symbol);

		 row.appendChild(symbolCell);

		 value = document.createElement("td");
		 
		 contentDiv = document.createElement("div");
 		 contentDiv.style.display = "inline";		 
		 content = self.TeslaLoggerJSON.Outside_temp + " " + self.config.unitOutside_temp;
		 
		 if (self.config.displayInside_temperature) {
			 content = content + ", " + self.TeslaLoggerJSON.Inside_temperature + " " + self.config.unitInside_temperature;
		  }
		  // Abstand zu den Symbolen
		  content = content + "&nbsp;&nbsp;&nbsp;&nbsp;";
		  
		 contentDiv.innerHTML = content;  
		 value.appendChild(contentDiv);
		  
		 
		 if (self.config.displayIs_preconditioning && self.TeslaLoggerJSON.Is_preconditioning) {
	   	    symbol = document.createElement("i");
            symbol.className = "fa fa-fw fa-snowflake";
			symbol.style.color = (self.TeslaLoggerJSON.Is_preconditioning ? "red" : "grey");
			symbol.style.display = "inline";		 
		    value.appendChild(symbol);
		  }
		  
		  
		 if (self.config.displayBattery_heater && self.TeslaLoggerJSON.Battery_heater) {
			// Abstand zwischen den beiden Symbolen (falls es zwei sind)
	   	    if (self.config.displayIs_preconditioning && self.TeslaLoggerJSON.Is_preconditioning) {
	   	       contentDiv = document.createElement("div");
	   	       contentDiv.style.display = "inline";		 
	   	       content = "&nbsp;&nbsp;&nbsp;&nbsp;";
	   	       contentDiv.innerHTML = content;
		       value.appendChild(contentDiv);
			}
		  
	   	    symbol = document.createElement("i");
            symbol.className = "fa fa-fw fa-car-battery";
			symbol.style.color = (self.TeslaLoggerJSON.Battery_heater ? "red" : "grey");
			symbol.style.display = "inline";		 
		    value.appendChild(symbol);
		  }
		  
		 
         value.className = "align-left TeslaLogger-value " + (tooOld ? "dimmed" : "bright");
		 		 
		 row.appendChild(value);
		 
		 table.appendChild(row);
      }

      // --------------------------------------------------------
	  // trip
	  // --------------------------------------------------------
		 
      if (self.config.displayTrip_distance) {
         row = document.createElement("tr");
		  
		 symbolCell = document.createElement("td");
         symbolCell.className = "align-left TeslaLogger-label";
		 
		 symbol = document.createElement("i");
         symbol.className = "fa fa-fw fa-suitcase";
		 
		 symbolCell.appendChild(symbol);


		 value = document.createElement("td");
		 
		 content = Math.round(self.TeslaLoggerJSON.Trip_distance) + " " + self.config.unitTrip_distance;
		 
		 if (self.config.displayTrip_duration_sec) {
			 content = content + ", " + Math.round(self.TeslaLoggerJSON.Trip_duration_sec/60) + " " + self.translate("MINUTES");
		  }
		 
		 if (self.config.displayTrip_max_speed) {
			 content = content + ", " + self.translate("MAX") + " " + self.TeslaLoggerJSON.Trip_max_speed + " " + self.config.unitTrip_max_speed;
		  }

		 if (self.config.displayTrip_kwh) {
			 content = content + ", " + Math.round(self.TeslaLoggerJSON.Trip_kwh) + " " + self.config.unitTrip_kwh;
		  }

		 value.innerHTML = content;
         value.className = "align-left TeslaLogger-value " + (tooOld ? "dimmed" : "bright");
		 
		 row.appendChild(symbolCell);
		 row.appendChild(value);
		 
		 table.appendChild(row);
      }




      // --------------------------------------------------------
	  // others
	  // --------------------------------------------------------
		 
      if (self.config.displayOdometer) {
         row = document.createElement("tr");
		  
		 symbolCell = document.createElement("td");
         symbolCell.className = "align-left TeslaLogger-label";
		 
		 symbol = document.createElement("i");
         symbol.className = "fa fa-fw fa-code-branch";
		 
		 symbolCell.appendChild(symbol);


		 value = document.createElement("td");
		 
		 content = Math.round(self.TeslaLoggerJSON.Odometer) + " " + self.config.unitOdometer;
		 
		 if (self.config.displayCar_version) {
			 var versionStr;
			 if (self.TeslaLoggerJSON.Car_version) {
				 versionStr = self.TeslaLoggerJSON.Car_version;
			 } else {
				 versionStr = self.translate("UNKNOWN");
			 }
			 content = content + ", " + self.translate("VERSION") + " "+ versionStr.substr(0, versionStr.indexOf(" "));
		  }
		 
		 value.innerHTML = content;
         value.className = "align-left TeslaLogger-value " + (tooOld ? "dimmed" : "bright");
		 
		 row.appendChild(symbolCell);
		 row.appendChild(value);
		 
		 table.appendChild(row);
      }




      return table;
   },
   
   getDomImage: function(table) {
      self = this;
	  var symbol;
	  var value;
	  var content;
	  var contentDiv;
	  var imgStr = "url("+self.config.imageURL+")"
	  
	  var tooOld = self.isValueTooOld(self.config.maxAgeSeconds, self.TeslaLoggerJSON.TimeOfStatus);

	  table.style.width = "100%";
	  table.style.height = "200px";
	  table.style.backgroundImage = imgStr;
	  table.style.backgroundPosition = "center center";
	  table.style.backgroundRepeat = "no-repeat";
	  table.style.backgroundSize = self.config.imageSize; 
	  
	  var row1 = document.createElement("tr");
	  row1.className = 'odometer-version';
	  row1.align = 'center';
	  row1.vAlign = 'top';
	  row1.border = "0px";
	  row1.margin_bottom = "5px";
	
	  var rowElement = document.createElement("td");
	  rowElement.className = 'align-left symbol-odometer';

	  symbol = document.createElement("i");
      symbol.className = "fa fa-fw fa-code-branch";	 
	  rowElement.appendChild(symbol);
	  row1.appendChild(rowElement);

	  rowElement = document.createElement("td");
	  rowElement.className = 'align-left odometer';
      rowElement.appendChild(document.createTextNode(Math.round(self.TeslaLoggerJSON.Odometer) + " " + self.config.unitOdometer));
	  row1.appendChild(rowElement);

	  rowElement = document.createElement("td");
	  rowElement.className = 'space';
	  row1.appendChild(rowElement);

      var versionStr;
      if (self.TeslaLoggerJSON.Car_version) {
         versionStr = self.TeslaLoggerJSON.Car_version;
      } else {
         versionStr = self.translate("UNKNOWN");
      }

	  rowElement = document.createElement("td");
	  rowElement.className = 'align-right version';
      rowElement.appendChild(document.createTextNode(self.translate("VERSION") + " "+ versionStr.substr(0, versionStr.indexOf(" "))));
	  row1.appendChild(rowElement);

	  var row2 = document.createElement("tr");
	  row2.className = 'level-lock';
	  row2.align = 'center';
	  row2.vAlign = 'top';
	  row2.border = "0px";
	  row2.margin_bottom = "5px";
	
	  var rowElement = document.createElement("td");
	  rowElement.className = 'align-left symbol-level';

	  symbol = document.createElement("i");
      symbol.className = "fa fa-fw fa-battery-three-quarters";	 
	  rowElement.appendChild(symbol);
	  row2.appendChild(rowElement);

	  rowElement = document.createElement("td");
	  rowElement.className = 'align-left battery';
      rowElement.appendChild(document.createTextNode(self.TeslaLoggerJSON.Battery_level + " " + self.config.unitBattery_level));
	  row2.appendChild(rowElement);

	  rowElement = document.createElement("td");
	  rowElement.className = 'space';
	  row2.appendChild(rowElement);

	  rowElement = document.createElement("td");
	  rowElement.className = 'align-right lock';
	  symbol = document.createElement("i");
      symbol.className = "fa fa-fw " + (self.TeslaLoggerJSON.lock ? "fa-lock-open" : "fa-lock");	 
	  rowElement.appendChild(symbol);
	  row2.appendChild(rowElement);

	  var row3 = document.createElement("tr");
	  row3.className = 'charge-sentry';
	  row3.align = 'center';
	  row3.vAlign = 'top';
	  row3.border = "0px";
	  row3.margin_bottom = "5px";
	
	  var rowElement = document.createElement("td");
	  rowElement.className = 'align-left symbol-charging';

	  symbol = document.createElement("i");
      symbol.className = "fa fa-fw fa-charging-station";	 
	  rowElement.appendChild(symbol);
	  row3.appendChild(rowElement);

	  rowElement = document.createElement("td");
	  rowElement.className = 'align-left charging';
      rowElement.appendChild(document.createTextNode(self.TeslaLoggerJSON.Charger_actual_current + " " + self.config.unitCharger_actual_current));
	  row3.appendChild(rowElement);

	  rowElement = document.createElement("td");
	  rowElement.className = 'space';
	  row3.appendChild(rowElement);

	  rowElement = document.createElement("td");
	  rowElement.className = 'align-right sentry';
	  if (self.TeslaLoggerJSON.Sentry_mode) {
	     symbol = document.createElement('img');
	     symbol.src = self.config.sentryImageURL;
	     symbol.width = '18';
	     rowElement.appendChild(symbol);
	  }
	  row3.appendChild(rowElement);

	  var row4 = document.createElement("tr");
	  row4.className = 'temp-precond';
	  row4.align = 'center';
	  row4.vAlign = 'top';
	  row4.border = "0px";
	  row4.margin_bottom = "5px";
	
	  var rowElement = document.createElement("td");
	  rowElement.className = 'align-left symbol-temp';

	  symbol = document.createElement("i");
      symbol.className = "fa fa-fw fa-thermometer-three-quarters";	 
	  rowElement.appendChild(symbol);
	  row4.appendChild(rowElement);

	  rowElement = document.createElement("td");
	  rowElement.className = 'align-left tempi';
      rowElement.appendChild(document.createTextNode(self.TeslaLoggerJSON.Inside_temperature + " " + self.config.unitInside_temperature));
	  row4.appendChild(rowElement);

	  rowElement = document.createElement("td");
	  rowElement.className = 'space';
	  row4.appendChild(rowElement);

	  rowElement = document.createElement("td");
	  rowElement.className = 'align-right precond';
	  symbol = document.createElement("i");
      symbol.className = "fa fa-fw fa-snowflake";	 
      symbol.style.color = (self.TeslaLoggerJSON.Is_preconditioning ? "red" : "grey");
	  rowElement.appendChild(symbol);
	  row4.appendChild(rowElement);

	  var row5 = document.createElement("tr");
	  row5.className = 'level-lock';
	  row5.align = 'center';
	  row5.vAlign = 'top';
	  row5.border = "0px";
	  row5.margin_bottom = "5px";
	
	  var rowElement = document.createElement("td");
	  rowElement.className = 'align-left temp-batt-heat';

	  symbol = document.createElement("i");
      symbol.className = "fa fa-fw fa-thermometer-low";	 
	  rowElement.appendChild(symbol);
	  row5.appendChild(rowElement);

	  rowElement = document.createElement("td");
	  rowElement.className = 'align-left tempo';
      rowElement.appendChild(document.createTextNode(self.TeslaLoggerJSON.Outside_temp + " " + self.config.unitOutside_temp));
	  row5.appendChild(rowElement);

	  rowElement = document.createElement("td");
	  rowElement.className = 'space';
	  row5.appendChild(rowElement);

	  rowElement = document.createElement("td");
	  rowElement.className = 'align-right lock';
	  symbol = document.createElement("i");
      symbol.className = "fa fa-fw fa-car-battery";	 
      symbol.style.color = (self.TeslaLoggerJSON.Battery_heater ? "red" : "grey");
	  rowElement.appendChild(symbol);
	  row5.appendChild(rowElement);

	  var row6 = document.createElement("tr");
	  row6.className = 'trip';
	  row6.align = 'center';
	  row6.vAlign = 'top';
	  row6.border = "0px";
	  row6.margin_bottom = "5px";
	
	  var rowElement = document.createElement("td");
	  rowElement.className = 'align-left symbol-trip';

	  symbol = document.createElement("i");
      symbol.className = "fa fa-fw fa-suitcase";	 
	  rowElement.appendChild(symbol);
	  row6.appendChild(rowElement);

	  rowElement = document.createElement("td");
	  rowElement.className = 'align-left odometer';
      rowElement.appendChild(document.createTextNode(
	     Math.round(self.TeslaLoggerJSON.Trip_distance) + " " + self.config.unitTrip_distance + ", " +
		 Math.round(self.TeslaLoggerJSON.Trip_duration_sec/60) + " " + self.translate("MINUTES") + ", " +
		 self.translate("MAX") + " " + self.TeslaLoggerJSON.Trip_max_speed + " " + self.config.unitTrip_max_speed + ", " +
		 Math.round(self.TeslaLoggerJSON.Trip_kwh) + " " + self.config.unitTrip_kwh
	  ));
	  row6.appendChild(rowElement);

	  rowElement = document.createElement("td");
	  rowElement.className = 'space';
	  row6.appendChild(rowElement);

	  rowElement = document.createElement("td");
	  rowElement.className = 'align-right empty';
	  row6.appendChild(rowElement);


		 		 
      // Building of the table rows
      table.appendChild(row1);
      table.appendChild(row2);
      table.appendChild(row3);
      table.appendChild(row4);
      table.appendChild(row5);
      table.appendChild(row6);		 

      return table;
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


	
   formatDateTime: function(secs) {
      this.log("Secs", secs);
      var epoch = new Date(0);
      epoch.setSeconds(parseInt(secs));
      this.log("Epoch", epoch);
      var date = epoch.toISOString();
      this.log("date", date); 
	  this.log("toLocaleTime",epoch.toLocaleTimeString());
	  var dateStr = date.split('.')[0].split('T')[0]
      return dateStr.split('-')[2]+'.'+dateStr.split('-')[1] + ' ' + epoch.toLocaleTimeString().split(':')[1]+":"+epoch.toLocaleTimeString().split(':')[2];
   },

   toDateTime: function(secs) {
      var t = new Date(1970, 0, 1); 
      t.setSeconds(secs);
      return t;
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
