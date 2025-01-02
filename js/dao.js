const componentMapper = (() => {
	let _components = new Map();

	return {
		insert: (component) => {
			_components.set(component.name, {
				name: component.name,
				settings: component.settings,
				type: component.type || COMPONENT_TYPE.APP
			});
		},
		selectAllNames: () => {
			return _components.keys();
		},
		selectSettings: (componentKey) => {
			return _components.get(componentKey).settings;
		},
		selectTypeByKeys: (componentKeys) => {
			return componentKeys.map(k => {
				const c = _components.get(k);
				return [c?.name || k, c?.type || COMPONENT_TYPE.UNKNOWN];
			});
		}
	};
})();

const featureMapper = (() => {
	let _features = new Map();

	return {
		insert: (feature) => {
			_features.set(feature.name, feature);
		},
		selectByComponentKey: (componentKey) => {
			return Array.from(_features.values()).filter(f => componentKey == f.componentKey);
		},
		countByComponentKey: (componentKey) => {
			return featureMapper.selectByComponentKey(componentKey).length;
		},
		selectByFeatureKey: (featureKey) => {
			return _features.get(featureKey);
		}
	};
})();

const connectionMapper = (() => {
	let _connections = [];

	return {
		loopInsertAll: (componentKey, featureKey, stages) => {
			stages.forEach(s => {
				if(s.connection) {
					let newCon;
					if(s.direction == CONNECTION_DIRECTION.OUT.value) {
						newCon = {
							featureKey: featureKey,
							origin: componentKey,
							dest: s.connection
						};
					} else {
						newCon = {
							featureKey: featureKey,
							origin: s.connection,
							dest: componentKey
						};
					}


					if(! _connections.some(oldCon => oldCon.featureKey == newCon.featureKey
						&& oldCon.origin == newCon.origin
						&& oldCon.dest == newCon.dest)) {
						_connections.push(newCon);
					}
				}


				if(s.yesStages) {
					connectionMapper.loopInsertAll(componentKey, featureKey, s.yesStages);
				}
				if(s.noStages) {
					connectionMapper.loopInsertAll(componentKey, featureKey, s.noStages);
				}
			});
		},
		selectByOriginOrDest: (componentKey) => {
			return _connections.filter(con => con.origin == componentKey || con.dest == componentKey);
		},
		countByOriginOrDest: (componentKey) => {
			const rs = new Set(connectionMapper.selectByOriginOrDest(componentKey)
				.flatMap(con => [con.origin, con.dest])).size;
			return rs > 0 ? rs - 1 : rs;
		}
	};
})();

const endpointMapper = (() => {
	let _endpoints = [];

	return {
		insertAll: (componentKey, endpoints) => {
			endpoints.forEach(e => {
				_endpoints.push({
					componentKey: componentKey,
					path: e.path,
					tag: e.tag || ENDPOINT_TAG.FEATURE,
					featureKey: e.relatedFeature,
					remark: e.remark,
					todos: e.todos
				});
			});
		},
		selectByComponentKey: (componentKey) => {
			return _endpoints.filter(e => e.componentKey == componentKey);
		},
		selectByFeatureKeys: (featureKeys) => {
			return _endpoints.filter(e => featureKeys.includes(e.featureKey));
		},
		countByComponentKey: (componentKey) => {
			return endpointMapper.selectByComponentKey(componentKey).length;
		}
	}
})();


function saveDataToTables(data) {
	data.forEach(c => {
		componentMapper.insert(c);

		if(c.features) {
			c.features.forEach(f => {
				featureMapper.insert({
					componentKey: c.name,
					name: f.name,
					desc: f.desc,
					stages: f.stages,
					todos: f.todos
				});

				if(f.stages) {
					connectionMapper.loopInsertAll(c.name, f.name, f.stages);
				}
			});
		}

		if(c.endpoints) {
			endpointMapper.insertAll(c.name, c.endpoints);
		}
	});
}