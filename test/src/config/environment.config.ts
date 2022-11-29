export default () => ({
	port: process.env.PORT,

	datadog: {
		apiKey: process.env.DATADOG_API_KEY,
		serviceName: process.env.DATADOG_SERVICE_NAME,
	},
});
