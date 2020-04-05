describe("resolveVersionType", () => {
	const { resolveVersionType } = require("../../src/utils/semver-utils");

	describe("given an empty commits array", () => {
		test("returns `patch`", () => {
			const versionType = resolveVersionType([]);
			expect(versionType).toBe("patch");
		});
	});

	describe("given non-semantic commits", () => {
		test("returns `patch`", () => {
			const versionType = resolveVersionType([
				{
					message: "Non-semantic commit 1"
				},
				{
					message: "Non-semantic commit 2"
				}
			]);
			expect(versionType).toBe("patch");
		});
	});

	describe("given a semantic commit with `feat:`", () => {
		test("returns `minor`", () => {
			const versionType = resolveVersionType([
				{
					message: "feat: Add new feature"
				}
			]);
			expect(versionType).toBe("minor");
		});
	});

	describe("given a commit, with `BREAKING CHANGE`", () => {
		test("returns `major`", () => {
			const versionType = resolveVersionType([
				{
					message:
						"feat: Add new feature\n\n" +
						"BREAKING CHANGE: Old backend no longer supported"
				}
			]);
			expect(versionType).toBe("major");
		});
	});
});

describe("needsVersion", () => {
	const { needsVersion } = require("../../src/utils/semver-utils");

	describe("given a forced push", () => {
		test("returns false", () => {
			const shouldVersion = needsVersion({
				forced: true
			});
			expect(shouldVersion).toBe(false);
		});
	});

	describe("given an empty commits array", () => {
		test("returns false", () => {
			const shouldVersion = needsVersion({
				forced: false,
				commits: []
			});
			expect(shouldVersion).toBe(false);
		});
	});

	describe("given commits including an npm version commit", () => {
		test("returns false", () => {
			const shouldVersion = needsVersion({
				forced: false,
				commits: [
					{ message: "feat: Add new feature" },
					{ message: "1.0.0" },
					{ message: "fix: Update broken links" }
				]
			});
			expect(shouldVersion).toBe(false);
		});
	});

	describe("given a set of non-versioned commits", () => {
		test("returns true", () => {
			const shouldVersion = needsVersion({
				forced: false,
				commits: [
					{ message: "feat: Add new feature" },
					{ message: "fix: Update broken links" }
				]
			});
			expect(shouldVersion).toBe(true);
		});
	});
});

describe("resolveAuthor", () => {
	const { resolveAuthor } = require("../../src/utils/semver-utils");

	describe("given a GitHub event with head_commit", () => {
		test("returns email and name of the author", () => {
			const { name, email } = resolveAuthor({
				head_commit: {
					author: {
						name: "Joe Bishop",
						email: "joe@example.com"
					}
				}
			});
			expect(name).toBe("Joe Bishop");
			expect(email).toBe("joe@example.com");
		});
	});
});
