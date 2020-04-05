const core = require("@actions/core");
const github = require("@actions/github");
const logger = require("./utils/logger");
const { resolveVersionType, needsVersion, resolveAuthor } = require("./utils/semver-utils");
const { createVersion, pushHead, pushTag, setGitUser } = require("./services/git");

const main = async () => {
	try {
		const event = github.context.payload;
		logger.debug("Event payload: %o", event);
		const { commits } = event;
		logger.info("Got %d commits", (commits || []).length);
		const shouldVersion = needsVersion(event);
		if (!shouldVersion) {
			logger.info("Changes contain no commits, a version commit, or were force-pushed");
			logger.info("Skipping automatic versioning");
			return;
		}
		const versionType = resolveVersionType(commits);
		logger.info("Resolved version type: %s", versionType);
		const { email, name } = resolveAuthor(event);
		logger.info("Setting git user %s <%s>...", name, email);
		await setGitUser(email, name);
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
