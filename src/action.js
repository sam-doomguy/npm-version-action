const core = require("@actions/core");
const github = require("@actions/github");
const logger = require("./utils/logger");
const { resolveVersionType, needsVersion } = require("./utils/semver-utils");
const { createVersion, pushHead, pushTag } = require("./services/git");

const main = async () => {
	try {
		logger.debug("Event payload: %o", github.context.payload);
		const { commits } = github.context.payload;
		logger.info("Got %d commits", commits.length);
		const shouldVersion = needsVersion(github.context.payload);
		if (!shouldVersion) {
			logger.info("Changes contain a version commit or were force-pushed");
			logger.info("Skipping automatic versioning");
			return;
		}
		const versionType = resolveVersionType(commits);
		logger.info("Resolved version type: %s", versionType);
		logger.info("Creating a new version...");
		const version = await createVersion(versionType);
		logger.info("Created version: %s", version);
		core.setOutput("version", version);
		logger.info("Pushing changes to remote...");
		await pushHead();
		await pushTag(version);
		logger.info("Action completed successfully");
	} catch (error) {
		logger.error("Error %o", error);
		core.setFailed(error.message);
	}
};

module.exports = main;
