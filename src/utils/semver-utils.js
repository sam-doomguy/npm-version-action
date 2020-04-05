const logger = require("./logger");

/**
 * Resolves version type required for the specified commits based on Semantic Versions standard.
 * If any commit has "BREAKING CHANGE" in it, return "major"
 * If any commit starts with "feat:", return "minor"
 * Otherwise return "patch"
 *
 * If a commit message starts with "feat:", the version
 * @param {*[]} commits Array of GitHub commits
 * @return {string} Version type: patch, minor, or major
 */
const resolveVersionType = commits => {
	const hasBreakingChange = commits.some(commit => commit.message.includes("BREAKING CHANGE"));
	if (hasBreakingChange) {
		return "major";
	}
	const hasFeature = commits.some(commit => commit.message.startsWith("feat:"));
	if (hasFeature) {
		return "minor";
	}
	return "patch";
};

/**
 * Determines whether the specified set of commits require a new version.
 * Following cases do not need a new version:
 * - Any of the commits begin with a semver (X.X.X), returns false.
 * - Push was forced
 * - There is no commit
 *
 * @param {*} gitHubEvent GitHub push event
 * @param {*[]} gitHubEvent.commits Array of GitHub commits
 * @param {boolean} gitHubEvent.forced Whether the push was forced
 * @return {boolean} true if the specified commits need versioning, false otherwise
 */
const needsVersion = gitHubEvent => {
	const { forced, commits } = gitHubEvent;
	if (forced) {
		logger.debug("Push was forced");
		return false;
	}
	if (!Array.isArray(commits) || commits.length === 0) {
		logger.debug("No commit was detected");
		return false;
	}
	const versionPattern = /^\d+\.\d+\.\d+(\s|$)/;
	const hasVersionCommit = commits.some(commit => versionPattern.test(commit.message));
	if (hasVersionCommit) {
		logger.debug("Version commit detected");
	}
	return !hasVersionCommit;
};

/**
 * Determines whether the specified set of commits require a version.
 * If any of the commits begin with a semver (X.X.X), returns false.
 *
 * @param {*} gitHubEvent GitHub push event
 * @param {*} gitHubEvent.head_commit Head commit of the push
 * @param {{email:string, name:string}} gitHubEvent.head_commit.author Author of the head commit
 * @return {{email:string, name:string}}
 */
const resolveAuthor = gitHubEvent => {
	const { email, name } = gitHubEvent.head_commit.author;
	return { email, name };
};

module.exports = {
	resolveVersionType,
	needsVersion,
	resolveAuthor
};
