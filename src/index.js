const core = require("@actions/core");
const github = require("@actions/github");
const logger = require("./utils/logger");

(async () => {
	try {
		core.setOutput("version", "v0.0.0");
		logger.info("The event payload %s", JSON.stringify(github.context.payload, null, 2));
	} catch (error) {
		core.setFailed(error.message);
	}
})();
