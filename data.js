const data = [
	{
		name: "Sample Project", // project name
		features: [ // project's features
			{
				name: "Calculate user daily activity stats", // feature name
				desc: "Calculate activity stats for all users in a specific date", // feature description
				stages: [ // feature logic flow
					{
						desc: "Trigger by system timer or HTTP API" // stage description
					},
					{
						desc: "Read table aaa join bbb...",
						connection: "MySQL", // depened to other project
						direction: CONNECTION_DIRECTION.OUT.value // dependency direction
					},
					{
						desc: "If find any result",
						yesStages: [ // if - else branch
							{
								desc: "Save to table xxx...",
								connection: "MySQL",
								direction: CONNECTION_DIRECTION.OUT.value
							}
						],
						noStages: [
							{
								desc: "Send failed alert",
								connection: "Mail Server",
								direction: CONNECTION_DIRECTION.OUT.value
							}
						]
					}
				]
			},
			{
				name: "Get user activity stats",
				desc: "Get activity stats for a specific user",
				stages: [
					{
						desc: "Trigger by HTTP API"
					},
					{
						desc: "If found in Redis",
						connection: "Redis",
						direction: CONNECTION_DIRECTION.OUT.value,
						yesStages: [
							{
								nextStage: "e" // end the logic flow, or jump to another stage using stage description
							}
						],
						noStages: [
							{
								desc: "Read table xxx...",
								connection: "MySQL",
								direction: CONNECTION_DIRECTION.OUT.value,
								upstream: { // related upstream feature that produces the data
									component: "Sample Project", // the upstream feature's project name
									feature: "Calculate user daily activity stats" // the upstream feature's name
								}
							},
							{
								desc: "Cache result to Redis",
								connection: "Redis",
								direction: CONNECTION_DIRECTION.OUT.value
							}
						]
					}
				]
			}
		],
		endpoints: [ // project's endpoints
			{
				path: "GET /stats/user_activity", // endpoint path
				relatedFeature: "Get user activity stats" // which feature is related to this endpoint
			},
			{
				path: "POST /support/stats/user_activity",
				tag: ENDPOINT_TAG.SUPPORT, // the endpoint category, refer to js/constants.js
				relatedFeature: "Calculate user daily activity stats",
				remark: "Trigger user activity stats daily job by manual" // endpoint additional description
			},
			{
				path: "GET /_health",
				tag: ENDPOINT_TAG.DEVOPS,
				remark: "App heartbeat"
			}
		],
		settings: { // a key-value map to describe other config info of this project
			Swagger: "https://xxxxxx/swagger-ui/index.html",
			Authentication: "API key"
		}
	},
	{
		name: "MySQL",
		type: COMPONENT_TYPE.DATASOURCE // project type, refer to js/constants.js
	},
	{
		name: "Redis",
		type: COMPONENT_TYPE.DATASOURCE
	},
	{
		name: "Mail Server",
		type: COMPONENT_TYPE.OTHER_3P
	}
]