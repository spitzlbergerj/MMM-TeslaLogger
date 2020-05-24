Module.register("MMM-TeslaLogger", {

	// Default module config
	defaults: {
		logging: false,
		style: "lines", // lines, groupedLines, image
		maxAgeSeconds: 36000, // Reduce intensity if values are older than 10 hours
		localeStr: 'de-DE',
		imageURL: 'modules/MMM-TeslaLogger/img/teslaModelSBlack.png',
		sentryImageURL: 'modules/MMM-TeslaLogger/img/HAL9000.png',

		// TeslaLogger posts MQTT with topic "Tesla"
		mqttTopics: [
			"Tesla",
			"teslamate/cars/1/+",
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
		displayGeofence: false,
		displayUpdate_available: false,
		displayEst_battery_range_km: false,
		displayTime_to_full_charge: false,
		displayWindows_open: false,
		displayDoors_open: false,
		displayIs_user_present: false,
		displayPlugged_in: false,
		displayScheduled_charging_start_time: false,

		unitState: "",
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
		unitTs: "",
		unitLatitude: "",
		unitLongitude: "",
		unitCharge_limit_soc: "%",
		unitInside_temperature: "°C",
		unitBattery_heater: "",
		unitIs_preconditioning: "",
		unitSentry_mode: "",
		unitLock: "",
		unitGeofence: "",
		unitUpdate_available: "",
		unitEst_battery_range_km: "km",
		unitTime_to_full_charge: "min",
		unitWindows_open: "",
		unitDoors_open: "",
		unitIs_user_present: "",
		unitPlugged_in: "",
		unitScheduled_charging_start_time: "Uhr",

		calcToMiles: false,
	},

	// TeslaLogger and TeslaMate post MQTT payload with these JSON elements
	TeslaJSON: {
		TimeOfStatus: 0,
		Charging: false,
		Driving: false,
		Online: false,
		Sleeping: false,
		Speed: 0,
		Power: 0,
		Odometer: 0,
		Ideal_battery_range_km: 0,
		Outside_temp: 0,
		Battery_level: 0,
		Charger_voltage: 0,
		Charger_phases: 0,
		Charger_actual_current: 0,
		Charge_energy_added: 0,
		Charger_power: 0,
		Car_version: "",
		Trip_start: "",
		Trip_max_speed: 0,
		Trip_max_power: 0,
		Trip_duration_sec: 0,
		Trip_kwh: 0,
		Trip_avg_kwh: 0,
		Trip_distance: 0,
		Ts: "",
		Latitude: 0,
		Longitude: 0,
		Charge_limit_soc: 0,
		Inside_temperature: 0,
		Battery_heater: false,
		Is_preconditioning: false,
		Sentry_mode: false,
		Lock: false,
		Geofence: "",
		Update_available: false,
		Est_battery_range_km: 0,
		Time_to_full_charge: 0,
		Windows_open: false,
		Doors_open: false,
		Is_user_present: false,
		Plugged_in: false,
		Scheduled_charging_start_time: "",
	},

	log: function (...args) {
		if (this.config.logging) {
			console.log(args);
		}
	},

	getStyles: function () {
		return ["MMM-TeslaLogger.css"];
	},

	getScripts: function () {
		return [
			this.file("node_modules/jsonpointer/jsonpointer.js"),
			"topics_match.js"
		];
	},

	getTranslations: function () {
		return {
			en: "translations/en.json",
			de: "translations/de.json"
		}
	},

	makeServerKey: function (address, port, user) {
		return "" + address + ":" + (port | ("1883" + user));
	},

	start: function () {
		console.log(this.name + " started.");
		console.log(this.name + ": Setting up connection to MQTT Broker " + this.config.mqttServerAddress + " at port " + this.config.mqttServerPort);
		console.log(this.name + ": TeslaJSON = " + this.TeslaJSON.Car_version);

		this.TeslaJSON.TimeOfStatus = Date.now();
		this.TeslaJSON.TimeOfStatusStr = this.formatDateTime(this.TeslaJSON.TimeOfStatus / 1000);;

		this.sendSocketNotification("MQTT_CONFIG", this.config);

		var self = this;
		setInterval(function () {
			self.updateDom(100);
		}, 50000);
	},

	socketNotificationReceived: function (notification, payload) {
		this.log(this.name + " socketNotificationReceived " + notification + " Topic: " + payload.topic + " JSON: " + payload.value);
		if (notification === "MQTT_PAYLOAD") {
			if (payload != null) {
				var value = payload.value;

				// Processing the data of TeslaLogger MQTT telegrams
				if (payload.topic === "Tesla") {
					this.TeslaJSON.Charging = get(JSON.parse(value), "/charging");
					this.TeslaJSON.Driving = get(JSON.parse(value), "/driving");
					this.TeslaJSON.Online = get(JSON.parse(value), "/online");
					this.TeslaJSON.Sleeping = get(JSON.parse(value), "/sleeping");
					this.TeslaJSON.Speed = get(JSON.parse(value), "/speed");
					this.TeslaJSON.Power = get(JSON.parse(value), "/power");
					this.TeslaJSON.Odometer = get(JSON.parse(value), "/odometer");
					this.TeslaJSON.Ideal_battery_range_km = get(JSON.parse(value), "/ideal_battery_range_km");
					this.TeslaJSON.Outside_temp = get(JSON.parse(value), "/outside_temp");
					this.TeslaJSON.Battery_level = get(JSON.parse(value), "/battery_level");
					this.TeslaJSON.Charger_voltage = get(JSON.parse(value), "/charger_voltage");
					this.TeslaJSON.Charger_phases = get(JSON.parse(value), "/charger_phases");
					this.TeslaJSON.Charger_actual_current = get(JSON.parse(value), "/charger_actual_current");
					this.TeslaJSON.Charge_energy_added = get(JSON.parse(value), "/charge_energy_added");
					this.TeslaJSON.Charger_power = get(JSON.parse(value), "/charger_power");
					this.TeslaJSON.Car_version = get(JSON.parse(value), "/car_version");
					this.TeslaJSON.Trip_start = get(JSON.parse(value), "/trip_start");
					this.TeslaJSON.Trip_max_speed = get(JSON.parse(value), "/trip_max_speed");
					this.TeslaJSON.Trip_max_power = get(JSON.parse(value), "/trip_max_power");
					this.TeslaJSON.Trip_duration_sec = get(JSON.parse(value), "/trip_duration_sec");
					this.TeslaJSON.Trip_kwh = get(JSON.parse(value), "/trip_kwh");
					this.TeslaJSON.Trip_avg_kwh = get(JSON.parse(value), "/trip_avg_kwh");
					this.TeslaJSON.Trip_distance = get(JSON.parse(value), "/trip_distance");
					this.TeslaJSON.Ts = get(JSON.parse(value), "/ts");
					this.TeslaJSON.Latitude = get(JSON.parse(value), "/latitude");
					this.TeslaJSON.Longitude = get(JSON.parse(value), "/longitude");
					this.TeslaJSON.Charge_limit_soc = get(JSON.parse(value), "/charge_limit_soc");
					this.TeslaJSON.Inside_temperature = get(JSON.parse(value), "/inside_temperature");
					this.TeslaJSON.Battery_heater = get(JSON.parse(value), "/battery_heater");
					this.TeslaJSON.Is_preconditioning = get(JSON.parse(value), "/is_preconditioning");
					this.TeslaJSON.Sentry_mode = get(JSON.parse(value), "/sentry_mode");
				}

				// Processing the data of teslamate MQTT telegrams
				if (payload.topic.substr(0, 9) === "teslamate") {
					if (payload.topic.substr(17) === "locked") {
						if (value === "true") {
							this.TeslaJSON.lock = true;
						} else {
							this.TeslaJSON.lock = false;
						}
					}

					if (payload.topic.substr(17) === "state") {
						this.TeslaJSON.Charging = false;
						this.TeslaJSON.Driving = false;
						this.TeslaJSON.Online = false;
						this.TeslaJSON.Sleeping = false;

						if (value === "online") {
							this.TeslaJSON.Online = true;
						}
						if (value === "charging") {
							this.TeslaJSON.Charging = true;
						}
						if (value === "asleep") {
							this.TeslaJSON.Sleeping = true;
						}
						if (value === "driving") {
							this.TeslaJSON.Driving = true;
						}
					}

					if (payload.topic.substr(17) === "speed") {
						this.TeslaJSON.Speed = value;
					}

					if (payload.topic.substr(17) === "odometer") {
						this.TeslaJSON.Odometer = value;
					}

					if (payload.topic.substr(17) === "ideal_battery_range_km") {
						this.TeslaJSON.Ideal_battery_range_km = value;
					}

					if (payload.topic.substr(17) === "outside_temp") {
						this.TeslaJSON.Outside_temp = value;
					}

					if (payload.topic.substr(17) === "battery_level") {
						this.TeslaJSON.Battery_level = value;
					}

					if (payload.topic.substr(17) === "charger_voltage") {
						this.TeslaJSON.Charger_voltage = value;
					}

					if (payload.topic.substr(17) === "charger_phases") {
						this.TeslaJSON.Charger_phases = value;
					}

					if (payload.topic.substr(17) === "charger_actual_current") {
						this.TeslaJSON.Charger_actual_current = value;
					}

					if (payload.topic.substr(17) === "charge_energy_added") {
						this.TeslaJSON.Charge_energy_added = value;
					}

					if (payload.topic.substr(17) === "charger_power") {
						this.TeslaJSON.Charger_power = value;
					}

					if (payload.topic.substr(17) === "version") {
						this.TeslaJSON.Car_version = value;
					}

					if (payload.topic.substr(17) === "since") {
						this.TeslaJSON.Ts = value;
					}

					if (payload.topic.substr(17) === "latitude") {
						this.TeslaJSON.Latitude = value;
					}

					if (payload.topic.substr(17) === "longitude") {
						this.TeslaJSON.Longitude = value;
					}

					if (payload.topic.substr(17) === "charge_limit_soc") {
						this.TeslaJSON.Charge_limit_soc = value;
					}

					if (payload.topic.substr(17) === "inside_temp") {
						this.TeslaJSON.Inside_temperature = value;
					}

					if (payload.topic.substr(17) === "is_preconditioning") {
						if (value === "true") {
							this.TeslaJSON.Is_preconditioning = true;
						} else {
							this.TeslaJSON.Is_preconditioning = false;
						}
					}

					if (payload.topic.substr(17) === "sentry_mode") {
						if (value === "true") {
							this.TeslaJSON.Sentry_mode = true;
						} else {
							this.TeslaJSON.Sentry_mode = false;
						}
					}

					if (payload.topic.substr(17) === "geofence") {
						this.TeslaJSON.Geofence = value;
					}

					if (payload.topic.substr(17) === "update_available") {
						if (value === "true") {
							this.TeslaJSON.Update_available = true;
						} else {
							this.TeslaJSON.Update_available = false;
						}
					}

					if (payload.topic.substr(17) === "est_battery_range_km") {
						this.TeslaJSON.Est_battery_range_km = value;
					}

					if (payload.topic.substr(17) === "time_to_full_charge") {
						this.TeslaJSON.Time_to_full_charge = value;
					}

					if (payload.topic.substr(17) === "windows_open") {
						if (value === "true") {
							this.TeslaJSON.Windows_open = true;
						} else {
							this.TeslaJSON.Windows_open = false;
						}
					}

					if (payload.topic.substr(17) === "doors_open") {
						if (value === "true") {
							this.TeslaJSON.Doors_open = true;
						} else {
							this.TeslaJSON.Doors_open = false;
						}
					}

					if (payload.topic.substr(17) === "is_user_present") {
						if (value === "true") {
							this.TeslaJSON.Is_user_present = true;
						} else {
							this.TeslaJSON.Is_user_present = false;
						}
					}

					if (payload.topic.substr(17) === "plugged_in") {
						if (value === "true") {
							this.TeslaJSON.Plugged_in = true;
						} else {
							this.TeslaJSON.Plugged_in = false;
						}
					}

					if (payload.topic.substr(17) === "scheduled_charging_start_time") {
						this.TeslaJSON.Scheduled_charging_start_time = value;
					}
				}

				if (this.config.calcToMiles) {
					this.TeslaJSON.OdometerCalc = this.TeslaJSON.Odometer / 1.609;
				}
				else {
					this.TeslaJSON.OdometerCalc = this.TeslaJSON.Odometer;
					
				}

				this.TeslaJSON.TimeOfStatus = payload.time;
				this.TeslaJSON.TimeOfStatusStr = payload.timeStr;

				this.updateDom();
			} else {
				this.log(this.name + ": MQTT_PAYLOAD - No payload");
			}
		}
	},

	getDom: function () {
		self = this;
		var wrapper;
		var tableDom;
		var row;
		var label;
		var value;
		var suffix;

		var tooOld = self.isValueTooOld(self.config.maxAgeSeconds, self.TeslaJSON.TimeOfStatus);

		wrapper = document.createElement("div");
		wrapper.className = "MMM-TeslaLogger-wrap";

		if (self.config.style === "lines") {
			tableDom = self.getDomLines();
		} else if (self.config.style === "groupedLines") {
			tableDom = self.getDomGroupedLines();
		} else {
			tableDom = self.getDomImage();
		}

		// time of MQTT Message
		row = document.createElement("tr");

		label = document.createElement("td");
		label.innerHTML = self.translate("STATUS");
		label.className = "align-left xsmall dimmed TeslaLogger-MQTT-time-label";

		value = document.createElement("td");
		value.innerHTML = self.TeslaJSON.TimeOfStatusStr;
		value.className = "align-left xsmall dimmed TeslaLogger-MQTT-time-value ";

		row.appendChild(label);
		row.appendChild(value);

		tableDom.appendChild(row);

		wrapper.appendChild(tableDom);
		return wrapper;
	},


	getDomLines: function () {
		self = this;
		var table;
		table = document.createElement("table");
		table.className = "small";

		var row;
		var symbolCell;
		var symbol;
		var value;

		var tooOld = self.isValueTooOld(self.config.maxAgeSeconds, self.TeslaJSON.TimeOfStatus);

		if (self.config.displayState) {
			row = document.createElement("tr");

			label = document.createElement("td");
			label.innerHTML = self.translate("STATE");
			label.className = "align-left TeslaLogger-label";

			value = document.createElement("td");
			if (self.TeslaJSON.Charging) {
				value.innerHTML = self.translate("CHARGING");
			} else if (self.TeslaJSON.Driving) {
				value.innerHTML = self.translate("DRIVING");
			} else if (self.TeslaJSON.Online) {
				value.innerHTML = self.translate("ONLINE");
			} else if (self.TeslaJSON.Sleeping) {
				value.innerHTML = self.translate("SLEEPING");
			} else {
				value.innerHTML = self.translate("UNDEFINED");
			}
			value.className = "align-right TeslaLogger-value ";

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
			value.innerHTML = self.TeslaJSON.Speed;
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
			value.innerHTML = self.TeslaJSON.Power;
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
			value.innerHTML = Math.round(self.TeslaJSON.OdometerCalc);
			value.className = "align-right TeslaLogger-value " + (tooOld ? "dimmed" : "bright");

			suffix = document.createElement("td");
			suffix.innerHTML = self.config.unitOdometer;
			suffix.className = "align-left TeslaLogger-suffix";

			row.appendChild(label);
			row.appendChild(value);
			row.appendChild(suffix);

			table.appendChild(row);
		}

		if (self.config.displayGeofence) {
			row = document.createElement("tr");

			label = document.createElement("td");
			label.innerHTML = self.translate("GEOFENCE");
			label.className = "align-left TeslaLogger-label";

			value = document.createElement("td");
			value.innerHTML = self.TeslaJSON.Geofence;
			value.className = "align-right TeslaLogger-value " + (tooOld ? "dimmed" : "bright");

			suffix = document.createElement("td");
			suffix.innerHTML = self.config.unitGeofence;
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
			value.innerHTML = self.TeslaJSON.Latitude;
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
			value.innerHTML = self.TeslaJSON.Longitude;
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
			value.innerHTML = self.TeslaJSON.Charge_limit_soc;
			value.className = "align-right TeslaLogger-value " + (tooOld ? "dimmed" : "bright");

			suffix = document.createElement("td");
			suffix.innerHTML = self.config.unitCharge_limit_soc;
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
			value.innerHTML = self.TeslaJSON.Outside_temp;
			value.className = "align-right TeslaLogger-value " + (tooOld ? "dimmed" : "bright");

			suffix = document.createElement("td");
			suffix.innerHTML = self.config.unitOutside_temp;
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
			value.innerHTML = self.TeslaJSON.Inside_temperature;
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
			if (self.TeslaJSON.Battery_heater) {
				value.innerHTML = self.translate("ON");
			} else {
				value.innerHTML = self.translate("OFF");
			}
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
			if (self.TeslaJSON.Is_preconditioning) {
				value.innerHTML = self.translate("ON");
			} else {
				value.innerHTML = self.translate("OFF");
			}
			value.className = "align-right TeslaLogger-value " + (tooOld ? "dimmed" : "bright");

			suffix = document.createElement("td");
			suffix.innerHTML = self.config.unitIs_preconditioning;
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
			value.innerHTML = self.TeslaJSON.Battery_level;
			value.className = "align-right TeslaLogger-value " + (tooOld ? "dimmed" : "bright");

			suffix = document.createElement("td");
			suffix.innerHTML = self.config.unitBattery_level;
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
			value.innerHTML = Math.round(self.TeslaJSON.Ideal_battery_range_km);
			value.className = "align-right TeslaLogger-value " + (tooOld ? "dimmed" : "bright");

			suffix = document.createElement("td");
			suffix.innerHTML = self.config.unitIdeal_battery_range_km;
			suffix.className = "align-left TeslaLogger-suffix";

			row.appendChild(label);
			row.appendChild(value);
			row.appendChild(suffix);

			table.appendChild(row);
		}

		if (self.config.displayEst_battery_range_km) {
			row = document.createElement("tr");

			label = document.createElement("td");
			label.innerHTML = self.translate("EST_BATTERY_RANGE_KM");
			label.className = "align-left TeslaLogger-label";

			value = document.createElement("td");
			value.innerHTML = self.TeslaJSON.Est_battery_range_km;
			value.className = "align-right TeslaLogger-value " + (tooOld ? "dimmed" : "bright");

			suffix = document.createElement("td");
			suffix.innerHTML = self.config.unitEst_battery_range_km;
			suffix.className = "align-left TeslaLogger-suffix";

			row.appendChild(label);
			row.appendChild(value);
			row.appendChild(suffix);

			table.appendChild(row);
		}

		if (self.config.displayPlugged_in) {
			row = document.createElement("tr");

			label = document.createElement("td");
			label.innerHTML = self.translate("PLUGGED_IN");
			label.className = "align-left TeslaLogger-label";

			value = document.createElement("td");
			if (self.TeslaJSON.Plugged_in) {
				value.innerHTML = self.translate("YES");
			} else {
				value.innerHTML = self.translate("NO");
			}
			value.className = "align-right TeslaLogger-value " + (tooOld ? "dimmed" : "bright");

			suffix = document.createElement("td");
			suffix.innerHTML = self.config.unitPlugged_in;
			suffix.className = "align-left TeslaLogger-suffix";

			row.appendChild(label);
			row.appendChild(value);
			row.appendChild(suffix);

			table.appendChild(row);
		}

		if (self.config.displayScheduled_charging_start_time) {
			row = document.createElement("tr");

			label = document.createElement("td");
			label.innerHTML = self.translate("SCHEDULED_CHARGING_START_TIME");
			label.className = "align-left TeslaLogger-label";

			value = document.createElement("td");
			value.innerHTML = self.TeslaJSON.Scheduled_charging_start_time;
			value.className = "align-right TeslaLogger-value " + (tooOld ? "dimmed" : "bright");

			suffix = document.createElement("td");
			suffix.innerHTML = self.config.unitScheduled_charging_start_time;
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
			value.innerHTML = self.TeslaJSON.Charger_voltage;
			value.className = "align-right TeslaLogger-value " + (tooOld ? "dimmed" : "bright");

			suffix = document.createElement("td");
			suffix.innerHTML = self.config.unitCharger_voltage;
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
			value.innerHTML = self.TeslaJSON.Charger_power;
			value.className = "align-right TeslaLogger-value " + (tooOld ? "dimmed" : "bright");

			suffix = document.createElement("td");
			suffix.innerHTML = self.config.unitCharger_power;
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
			value.innerHTML = self.TeslaJSON.Charger_phases;
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
			value.innerHTML = self.TeslaJSON.Charger_actual_current;
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
			value.innerHTML = self.TeslaJSON.Charge_energy_added;
			value.className = "align-right TeslaLogger-value " + (tooOld ? "dimmed" : "bright");

			suffix = document.createElement("td");
			suffix.innerHTML = self.config.unitCharge_energy_added;
			suffix.className = "align-left TeslaLogger-suffix";

			row.appendChild(label);
			row.appendChild(value);
			row.appendChild(suffix);

			table.appendChild(row);
		}

		if (self.config.displayTime_to_full_charge) {
			row = document.createElement("tr");

			label = document.createElement("td");
			label.innerHTML = self.translate("TIME_TO_FULL_CHARGE");
			label.className = "align-left TeslaLogger-label";

			value = document.createElement("td");
			value.innerHTML = self.TeslaJSON.Time_to_full_charge;
			value.className = "align-right TeslaLogger-value " + (tooOld ? "dimmed" : "bright");

			suffix = document.createElement("td");
			suffix.innerHTML = self.config.unitTime_to_full_charge;
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
			value.innerHTML = self.TeslaJSON.Trip_start;
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
			value.innerHTML = self.TeslaJSON.Trip_max_speed;
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
			value.innerHTML = self.TeslaJSON.Trip_max_power;
			value.className = "align-right TeslaLogger-value " + (tooOld ? "dimmed" : "bright");

			suffix = document.createElement("td");
			suffix.innerHTML = self.config.unitTrip_max_power;
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
			value.innerHTML = Math.round(self.TeslaJSON.Trip_kwh);
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
			value.innerHTML = Math.round(self.TeslaJSON.Trip_avg_kwh);
			value.className = "align-right TeslaLogger-value " + (tooOld ? "dimmed" : "bright");

			suffix = document.createElement("td");
			suffix.innerHTML = self.config.unitTrip_avg_kwh;
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
			value.innerHTML = self.TeslaJSON.Trip_duration_sec;
			value.className = "align-right TeslaLogger-value " + (tooOld ? "dimmed" : "bright");

			suffix = document.createElement("td");
			suffix.innerHTML = self.config.unitTrip_duration_sec;
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
			value.innerHTML = Math.round(self.TeslaJSON.Trip_distance);
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
			value.innerHTML = self.TeslaJSON.Ts;
			value.className = "align-right TeslaLogger-value " + (tooOld ? "dimmed" : "bright");

			suffix = document.createElement("td");
			suffix.innerHTML = self.config.unitTs;
			suffix.className = "align-left TeslaLogger-suffix";

			row.appendChild(label);
			row.appendChild(value);
			row.appendChild(suffix);

			table.appendChild(row);
		}

		if (self.config.displayLock) {
			row = document.createElement("tr");

			label = document.createElement("td");
			label.innerHTML = self.translate("LOCK");
			label.className = "align-left TeslaLogger-label";

			value = document.createElement("td");
			if (self.TeslaJSON.lock === false) {
				value.innerHTML = self.translate("OPEN");
			} else {
				value.innerHTML = self.translate("CLOSED");
			}
			value.className = "align-right TeslaLogger-value " + (tooOld ? "dimmed" : "bright");

			suffix = document.createElement("td");
			suffix.innerHTML = self.config.unitLock;
			suffix.className = "align-left TeslaLogger-suffix";

			row.appendChild(label);
			row.appendChild(value);
			row.appendChild(suffix);

			table.appendChild(row);
		}

		if (self.config.displayDoors_open) {
			row = document.createElement("tr");

			label = document.createElement("td");
			label.innerHTML = self.translate("DOORS_OPEN");
			label.className = "align-left TeslaLogger-label";

			value = document.createElement("td");
			if (self.TeslaJSON.Doors_open) {
				value.innerHTML = self.translate("OPEN");
			} else {
				value.innerHTML = self.translate("CLOSED");
			}
			value.className = "align-right TeslaLogger-value " + (tooOld ? "dimmed" : "bright");

			suffix = document.createElement("td");
			suffix.innerHTML = self.config.unitDoors_open;
			suffix.className = "align-left TeslaLogger-suffix";

			row.appendChild(label);
			row.appendChild(value);
			row.appendChild(suffix);

			table.appendChild(row);
		}

		if (self.config.displayWindows_open) {
			row = document.createElement("tr");

			label = document.createElement("td");
			label.innerHTML = self.translate("WINDOWS_OPEN");
			label.className = "align-left TeslaLogger-label";

			value = document.createElement("td");
			if (self.TeslaJSON.Windows_open) {
				value.innerHTML = self.translate("OPEN");
			} else {
				value.innerHTML = self.translate("CLOSED");
			}
			value.className = "align-right TeslaLogger-value " + (tooOld ? "dimmed" : "bright");

			suffix = document.createElement("td");
			suffix.innerHTML = self.config.unitWindows_open;
			suffix.className = "align-left TeslaLogger-suffix";

			row.appendChild(label);
			row.appendChild(value);
			row.appendChild(suffix);

			table.appendChild(row);
		}

		if (self.config.displayIs_user_present) {
			row = document.createElement("tr");

			label = document.createElement("td");
			label.innerHTML = self.translate("IS_USER_PRESENT");
			label.className = "align-left TeslaLogger-label";

			value = document.createElement("td");
			if (self.TeslaJSON.Is_user_present) {
				value.innerHTML = self.translate("PRESENT");
			} else {
				value.innerHTML = self.translate("AWAY");
			}
			value.className = "align-right TeslaLogger-value " + (tooOld ? "dimmed" : "bright");

			suffix = document.createElement("td");
			suffix.innerHTML = self.config.unitIs_user_present;
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
			if (self.TeslaJSON.Sentry_mode) {
				value.innerHTML = self.translate("ON");
			} else {
				value.innerHTML = self.translate("OFF");
			}
			value.className = "align-right TeslaLogger-value " + (tooOld ? "dimmed" : "bright");

			suffix = document.createElement("td");
			suffix.innerHTML = self.config.unitSentry_mode;
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
			value.innerHTML = self.TeslaJSON.Car_version;
			value.className = "align-right TeslaLogger-value " + (tooOld ? "dimmed" : "bright");

			suffix = document.createElement("td");
			suffix.innerHTML = self.config.unitCar_version;
			suffix.className = "align-left TeslaLogger-suffix";

			row.appendChild(label);
			row.appendChild(value);
			row.appendChild(suffix);

			table.appendChild(row);
		}

		if (self.config.displayUpdate_available) {
			row = document.createElement("tr");

			label = document.createElement("td");
			label.innerHTML = self.translate("UPDATE_AVAILABLE");
			label.className = "align-left TeslaLogger-label";

			value = document.createElement("td");
			if (self.TeslaJSON.Update_available) {
				value.innerHTML = self.translate("YES");
			} else {
				value.innerHTML = self.translate("NO");
			}
			value.className = "align-right TeslaLogger-value " + (tooOld ? "dimmed" : "bright");

			suffix = document.createElement("td");
			suffix.innerHTML = self.config.unitUpdate_available;
			suffix.className = "align-left TeslaLogger-suffix";

			row.appendChild(label);
			row.appendChild(value);
			row.appendChild(suffix);

			table.appendChild(row);
		}

		return table;
	},

	getDomGroupedLines: function () {
		self = this;

		var table;
		table = document.createElement("table");
		table.className = "small";

		var row;
		var symbolCell;
		var symbol;
		var value;
		var content;
		var contentDiv;

		var tooOld = self.isValueTooOld(self.config.maxAgeSeconds, self.TeslaJSON.TimeOfStatus);

		// --------------------------------------------------------
		// state and speed
		// --------------------------------------------------------

		if (self.config.displayState) {
			row = document.createElement("tr");

			symbolCell = document.createElement("td");
			symbolCell.className = "align-left TeslaLogger-label";

			symbol = document.createElement("i");
			symbol.className = "align-left fa fa-fw fa-toggle-off";

			symbolCell.appendChild(symbol);

			value = document.createElement("td");

			// falls driving == true ist auch immer online == True
			if (self.TeslaJSON.Charging) {
				value.innerHTML = self.translate("CHARGING");
			} else if (self.TeslaJSON.Driving) {
				content = self.translate("DRIVING")
				if (self.config.displaySpeed) {
					content = content + " " + self.translate("WITH") + " " + self.TeslaJSON.Speed + " " + self.config.unitSpeed;
				}
				value.innerHTML = content;
			} else if (self.TeslaJSON.Online) {
				value.innerHTML = self.translate("ONLINE");
			} else if (self.TeslaJSON.Sleeping) {
				value.innerHTML = self.translate("SLEEPING");
			} else {
				value.innerHTML = self.translate("UNDEFINED");
			}
			value.className = "align-left TeslaLogger-value ";

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
			symbol.className = "align-left fa fa-fw fa-battery-three-quarters";

			symbolCell.appendChild(symbol);


			value = document.createElement("td");

			content = self.TeslaJSON.Battery_level + " " + self.config.unitBattery_level;

			if (self.config.displayIdeal_battery_range_km) {
				content = content + ", " + Math.round(self.TeslaJSON.Ideal_battery_range_km) + " " + self.config.unitIdeal_battery_range_km;
			}

			if (self.config.displayCharge_limit_soc) {
				content = content + ", " + self.translate("MAX") + " " + self.TeslaJSON.Charge_limit_soc + " " + self.config.unitCharge_limit_soc;
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
			symbol.className = "align-left fa fa-fw fa-charging-station";

			symbolCell.appendChild(symbol);


			value = document.createElement("td");

			if (self.TeslaJSON.Charger_voltage == 0) {
				contentDiv = document.createElement("div");
				contentDiv.style.display = "inline";
				content = self.translate("NOTCHARGING");

				contentDiv.innerHTML = content;
				value.appendChild(contentDiv);

				if (self.config.displayPlugged_in && self.TeslaJSON.Plugged_in) {
					symbol = document.createElement('i');
					symbol.className = "align-left fa fa-fw fa-plug";
					symbol.style.marginLeft = "20px";
					value.appendChild(symbol);
				}

				if (self.config.displayScheduled_charging_start_time && self.TeslaJSON.Scheduled_charging_start_time != "") {
					contentDiv = document.createElement("div");
					contentDiv.style.display = "inline";
					content = self.TeslaJSON.Scheduled_charging_start_time + " " + self.config.unitScheduled_charging_start_time;
					contentDiv.innerHTML = content;
					symbol.style.marginLeft = "20px";
					value.appendChild(contentDiv);
				}
			} else {
				content = self.TeslaJSON.Charger_voltage + " " + self.config.unitCharger_voltage;

				if (self.config.displayCharger_phases) {
					content = content + ", " + self.TeslaJSON.Charger_phases + self.translate("PHASES");
				}

				if (self.config.displayCharger_actual_current) {
					content = content + ", " + self.TeslaJSON.Charger_actual_current + " " + self.config.unitCharger_actual_current;
				}

				if (self.config.displayCharge_energy_added) {
					content = content + ", + " + self.TeslaJSON.Charge_energy_added + " " + self.config.unitCharge_energy_added;
				}

				if (self.config.displayTime_to_full_charge) {
					content = content + ", " + self.TeslaJSON.Time_to_full_charge + " " + self.config.unitTime_to_full_charge;
				}
				value.innerHTML = content;
			}
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
			if (self.TeslaJSON.lock === false) {
				symbol.className = "align-left fa fa-fw fa-unlock";
			} else {
				symbol.className = "align-left fa fa-fw fa-lock";
			}
			symbolCell.appendChild(symbol);

			value = document.createElement("td");

			contentDiv = document.createElement("div");
			contentDiv.style.display = "inline";

			if (self.TeslaJSON.lock === false) {
				content = self.translate("OPEN");
			} else {
				content = self.translate("CLOSED");
			}

			contentDiv.innerHTML = content;
			value.appendChild(contentDiv);

			if (self.config.displaySentry_mode && self.TeslaJSON.Sentry_mode) {
				symbol = document.createElement('img');
				symbol.src = self.config.sentryImageURL;
				symbol.width = '18';
				symbol.style.display = "inline";
				symbol.style.marginLeft = "20px";
				value.appendChild(symbol);
			}

			if ((self.config.displayDoors_open && self.TeslaJSON.Doors_open)) {
				this.log("Door symbol");
				symbol = document.createElement('i');
				symbol.className = "align-left fa fa-fw fa-door-open";
				symbol.style.marginLeft = "20px";
				value.appendChild(symbol);
			}

			if (self.config.displayWindows_open && self.TeslaJSON.Windows_open) {
				this.log("Window symbol");
				symbol = document.createElement('i');
				symbol.className = "align-left fa fa-fw fa-window-maximize";
				symbol.style.marginLeft = "20px";
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

		if (self.config.displayOutside_temp || self.config.displayInside_temperature) {
			row = document.createElement("tr");

			symbolCell = document.createElement("td");
			symbolCell.className = "align-left TeslaLogger-label";

			symbol = document.createElement("i");
			symbol.className = "align-left fa fa-fw fa-thermometer-half";

			symbolCell.appendChild(symbol);

			value = document.createElement("td");

			contentDiv = document.createElement("div");
			contentDiv.style.display = "inline";
			content = self.TeslaJSON.Outside_temp + " " + self.config.unitOutside_temp + ", " + self.TeslaJSON.Inside_temperature + " " + self.config.unitInside_temperature;

			contentDiv.innerHTML = content;
			value.appendChild(contentDiv);
			
			if (self.config.displayIs_preconditioning && self.TeslaJSON.Is_preconditioning) {
				symbol = document.createElement("i");
				symbol.className = "align-left fa fa-fw fa-snowflake";
				symbol.style.color = (self.TeslaJSON.Is_preconditioning ? "red" : "grey");
				symbol.style.display = "inline";
				symbol.style.marginLeft = "20px";
				value.appendChild(symbol);
			}

			if (self.config.displayBattery_heater && self.TeslaJSON.Battery_heater) {
				symbol = document.createElement("i");
				symbol.className = "align-left fa fa-fw fa-car-battery";
				symbol.style.color = (self.TeslaJSON.Battery_heater ? "red" : "grey");
				symbol.style.display = "inline";
				symbol.style.marginLeft = "20px";
				value.appendChild(symbol);
			}

			value.className = "align-left TeslaLogger-value " + (tooOld ? "dimmed" : "bright");

			row.appendChild(symbolCell);
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
			symbol.className = "align-left fa fa-fw fa-suitcase";

			symbolCell.appendChild(symbol);


			value = document.createElement("td");

			content = Math.round(self.TeslaJSON.Trip_distance) + " " + self.config.unitTrip_distance;

			if (self.config.displayTrip_duration_sec) {
				content = content + ", " + Math.round(self.TeslaJSON.Trip_duration_sec / 60) + " " + self.translate("MINUTES");
			}

			if (self.config.displayTrip_max_speed) {
				content = content + ", " + self.translate("MAX") + " " + self.TeslaJSON.Trip_max_speed + " " + self.config.unitTrip_max_speed;
			}

			if (self.config.displayTrip_kwh) {
				content = content + ", " + Math.round(self.TeslaJSON.Trip_kwh) + " " + self.config.unitTrip_kwh;
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
			symbol.className = "align-left fa fa-fw fa-code-branch";

			symbolCell.appendChild(symbol);


			value = document.createElement("td");

			content = Math.round(self.TeslaJSON.OdometerCalc) + " " + self.config.unitOdometer;

			if (self.config.displayCar_version) {
				var versionStr;
				if (self.TeslaJSON.Car_version) {
					versionStr = self.TeslaJSON.Car_version;
				} else {
					versionStr = self.translate("UNKNOWN");
				}
				content = content + ", " + self.translate("VERSION") + " " + versionStr.substr(0, versionStr.indexOf(" "));
			}

			contentDiv = document.createElement("div");
			contentDiv.style.display = "inline";
			contentDiv.innerHTML = content;
			value.appendChild(contentDiv);

			if (self.config.displayUpdate_available && self.TeslaJSON.Update_available) {
				symbol = document.createElement('i');
				symbol.className = "align-left fa fa-fw fa-wrench";
				symbol.style.marginLeft = "20px";
				value.appendChild(symbol);
			}

			value.className = "align-left TeslaLogger-value " + (tooOld ? "dimmed" : "bright");

			row.appendChild(symbolCell);
			row.appendChild(value);

			table.appendChild(row);
		}




		return table;
	},

	getDomImage: function () {
		self = this;

		var table;
		table = document.createElement("table");
		table.className = "small";

		var row;
		var symbolCell;
		var symbol;
		var value;
		var content;
		var imgStr = "url(" + self.config.imageURL + ")"

		var tooOld = self.isValueTooOld(self.config.maxAgeSeconds, self.TeslaJSON.TimeOfStatus);

		table.style.width = "100%";
		table.style.height = "200px";
		table.style.backgroundImage = imgStr;
		table.style.backgroundPosition = "center center";
		table.style.backgroundRepeat = "no-repeat";
		table.style.backgroundSize = "cover";


		// --------------------------------------------------------
		// Km-Stand und Version
		// --------------------------------------------------------

		row = document.createElement("tr");
		row.style.width = "100%";

		symbolCell = document.createElement("td");
		symbolCell.className = "align-left TeslaLogger-label";
		symbol = document.createElement("i");
		symbol.className = "align-left fa fa-fw fa-code-branch";
		symbolCell.appendChild(symbol);

		valueLeft = document.createElement("td");
		valueLeft.className = "align-left TeslaLogger-valueLeft " + (tooOld ? "dimmed" : "bright");

		content = Math.round(self.TeslaJSON.OdometerCalc) + " " + self.config.unitOdometer;
		valueLeft.innerHTML = content;

		valueRight = document.createElement("td");
		valueRight.className = "align-right TeslaLogger-valueRight " + (tooOld ? "dimmed" : "bright");

		if (self.TeslaJSON.Car_version) {
			content = self.TeslaJSON.Car_version.substr(0, self.TeslaJSON.Car_version.indexOf(" "));
		} else {
			content = self.translate("UNKNOWN");
		}
		content = self.translate("VERSION") + " " + content;

		contentDiv = document.createElement("div");
		contentDiv.style.display = "inline";
		contentDiv.innerHTML = content;
		valueRight.appendChild(contentDiv);

		if (self.config.displayUpdate_available && self.TeslaJSON.Update_available) {
			symbol = document.createElement('i');
			symbol.className = "align-left fa fa-fw fa-wrench";
			symbol.style.marginLeft = "20px";
			valueRight.appendChild(symbol);
		}

		row.appendChild(symbolCell);
		row.appendChild(valueLeft);
		row.appendChild(valueRight);

		table.appendChild(row);

		// --------------------------------------------------------
		// battery level, lock, sentry mode
		// --------------------------------------------------------

		row = document.createElement("tr");
		row.style.width = "100%";

		symbolCell = document.createElement("td");
		symbolCell.className = "align-left TeslaLogger-label";
		symbol = document.createElement("i");
		symbol.className = "align-left fa fa-fw fa-battery-three-quarters";
		symbolCell.appendChild(symbol);

		valueLeft = document.createElement("td");
		valueLeft.className = "align-left TeslaLogger-valueLeft " + (tooOld ? "dimmed" : "bright");
		content = self.TeslaJSON.Battery_level + " " + self.config.unitBattery_level;
		valueLeft.innerHTML = content;

		valueRight = document.createElement("td");
		valueRight.className = "align-right TeslaLogger-valueRight " + (tooOld ? "dimmed" : "bright");

		symbol = document.createElement('img');
		symbol.src = self.config.sentryImageURL;
		symbol.width = '18';
		symbol.style.display = "inline";
		symbol.style.marginLeft = "20px";
		if (self.TeslaJSON.Sentry_mode === true) {
			valueRight.appendChild(symbol);
		}
		
		symbol = document.createElement("i");
		if (self.TeslaJSON.lock === false) {
			symbol.className = "align-left fa fa-fw fa-unlock";
			symbol.style.color = "red";
		} else {
			symbol.className = "align-left fa fa-fw fa-lock";
			symbol.style.color = "green";
		}
		valueRight.appendChild(symbol);


		row.appendChild(symbolCell);
		row.appendChild(valueLeft);
		row.appendChild(valueRight);

		table.appendChild(row);

		// --------------------------------------------------------
		// charging
		// --------------------------------------------------------

		row = document.createElement("tr");
		row.style.width = "100%";

		symbolCell = document.createElement("td");
		symbolCell.className = "align-left TeslaLogger-label";
		symbol = document.createElement("i");
		symbol.className = "align-left fa fa-fw fa-charging-station";
		symbolCell.appendChild(symbol);

		valueLeft = document.createElement("td");
		valueLeft.className = "align-left TeslaLogger-valueLeft " + (tooOld ? "dimmed" : "bright");
		content = self.TeslaJSON.Charger_actual_current + " " + self.config.unitCharger_actual_current;
		valueLeft.innerHTML = content;

		valueRight = document.createElement("td");
		valueRight.className = "align-right TeslaLogger-valueRight " + (tooOld ? "dimmed" : "bright");

		symbol = document.createElement("i");
		symbol.className = "align-left fa fa-fw fa-plug";
		symbol.style.color = (self.TeslaJSON.Plugged_in ? "green" : "grey");
		valueRight.appendChild(symbol);

		row.appendChild(symbolCell);
		row.appendChild(valueLeft);
		row.appendChild(valueRight);

		table.appendChild(row);

		// --------------------------------------------------------
		// temperatures
		// --------------------------------------------------------

		row = document.createElement("tr");
		row.style.width = "100%";

		symbolCell = document.createElement("td");
		symbolCell.className = "align-left TeslaLogger-label";
		symbol = document.createElement("i");
		symbol.className = "align-left fa fa-fw fa-thermometer-full";
		symbolCell.appendChild(symbol);

		valueLeft = document.createElement("td");
		valueLeft.className = "align-left TeslaLogger-valueLeft " + (tooOld ? "dimmed" : "bright");
		content = self.TeslaJSON.Inside_temperature + " " + self.config.unitInside_temperature;
		valueLeft.innerHTML = content;

		valueRight = document.createElement("td");
		valueRight.className = "align-right TeslaLogger-valueRight " + (tooOld ? "dimmed" : "bright");

		symbol = document.createElement("i");
		symbol.className = "align-left fa fa-fw fa-snowflake";
		symbol.style.color = (self.TeslaJSON.Is_preconditioning ? "red" : "grey");
		valueRight.appendChild(symbol);

		row.appendChild(symbolCell);
		row.appendChild(valueLeft);
		row.appendChild(valueRight);

		table.appendChild(row);

		// --------------------------------------------------------
		// temperatures
		// --------------------------------------------------------

		row = document.createElement("tr");
		row.style.width = "100%";

		symbolCell = document.createElement("td");
		symbolCell.className = "align-left TeslaLogger-label";
		symbol = document.createElement("i");
		symbol.className = "align-left fa fa-fw fa-thermometer-empty";
		symbolCell.appendChild(symbol);

		valueLeft = document.createElement("td");
		valueLeft.className = "align-left TeslaLogger-valueLeft " + (tooOld ? "dimmed" : "bright");
		content = self.TeslaJSON.Outside_temp + " " + self.config.unitOutside_temp;
		valueLeft.innerHTML = content;

		valueRight = document.createElement("td");
		valueRight.className = "align-right TeslaLogger-valueRight " + (tooOld ? "dimmed" : "bright");

		symbol = document.createElement("i");
		symbol.className = "align-left fa fa-fw fa-car-battery";
		symbol.style.color = (self.TeslaJSON.Battery_heater ? "red" : "grey");
		valueRight.appendChild(symbol);

		row.appendChild(symbolCell);
		row.appendChild(valueLeft);
		row.appendChild(valueRight);

		table.appendChild(row);

		// --------------------------------------------------------
		// trip
		// --------------------------------------------------------

		row = document.createElement("tr");
		row.style.width = "100%";

		symbolCell = document.createElement("td");
		symbolCell.className = "align-left TeslaLogger-label";
		symbol = document.createElement("i");
		symbol.className = "align-left fa fa-fw fa-suitcase";
		symbolCell.appendChild(symbol);

		valueLeft = document.createElement("td");
		valueLeft.className = "align-left TeslaLogger-valueLeft " + (tooOld ? "dimmed" : "bright");
		content = Math.round(self.TeslaJSON.Trip_distance) + " " + self.config.unitTrip_distance;
		// content = content + ", " + Math.round(self.TeslaJSON.Trip_duration_sec / 60) + " " + self.translate("MINUTES");
		// content = content + ", " + self.translate("MAX") + " " + self.TeslaJSON.Trip_max_speed + " " + self.config.unitTrip_max_speed;
		content = content + ", " + Math.round(self.TeslaJSON.Trip_kwh) + " " + self.config.unitTrip_kwh;
		valueLeft.innerHTML = content;

		valueRight = document.createElement("td");
		valueRight.className = "align-right TeslaLogger-valueRight " + (tooOld ? "dimmed" : "bright");

		symbol = document.createElement("i");
		symbol.className = "align-left fa fa-fw fa-user";
		symbol.style.color = (self.TeslaJSON.Is_user_present ? "green" : "grey");
		valueRight.appendChild(symbol);

		row.appendChild(symbolCell);
		row.appendChild(valueLeft);
		row.appendChild(valueRight);

		table.appendChild(row);


		return table;
	},


	isValueTooOld: function (maxAgeSeconds, updatedTime) {
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



	formatDateTime: function (secs) {
		this.log("Secs", secs);
		var epoch = new Date(0);
		epoch.setSeconds(parseInt(secs));
		this.log("Epoch", epoch);
		var date = epoch.toISOString();
		this.log("date", date);
		this.log("toLocaleTime", epoch.toLocaleTimeString());
		var dateStr = date.split('.')[0].split('T')[0]
		return dateStr.split('-')[2] + '.' + dateStr.split('-')[1] + ' ' + epoch.toLocaleTimeString().split(':')[1] + ":" + epoch.toLocaleTimeString().split(':')[2];
	},

	toDateTime: function (secs) {
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

	getColors: function (sub) {
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

	multiply: function (sub, value) {
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

	convertValue: function (sub) {
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
