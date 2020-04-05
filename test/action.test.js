describe("action", () => {
	describe("given `needsVersion` returns false", () => {
		test("stops execution with no output", async () => {
			const core = require("@actions/core");
			jest.mock("@actions/core");
			const semverUtils = require("../src/utils/semver-utils");
			jest.mock("../src/utils/semver-utils");
			semverUtils.needsVersion.mockReturnValue(false);
			const gitService = require("../src/services/git");
			jest.mock("../src/services/git");

			const action = require("../src/action");

			await action();
			expect(semverUtils.needsVersion).toHaveBeenCalled();
			expect(semverUtils.resolveVersionType).not.toHaveBeenCalled();
			expect(gitService.setGitUser).not.toHaveBeenCalled();
			expect(gitService.createVersion).not.toHaveBeenCalled();
			expect(gitService.pushHead).not.toHaveBeenCalled();
			expect(gitService.pushTag).not.toHaveBeenCalled();
			expect(core.setOutput).not.toHaveBeenCalled();
		});
	});

	describe("given `needsVersion` returns true", () => {
		test("versions the repo and pushes the tag", async () => {
			const core = require("@actions/core");
			jest.mock("@actions/core");
			const semverUtils = require("../src/utils/semver-utils");
			jest.mock("../src/utils/semver-utils");
			semverUtils.needsVersion.mockReturnValue(true);
			semverUtils.resolveVersionType.mockReturnValue("minor");
			semverUtils.resolveAuthor.mockReturnValue({
				name: "Joe Bishop",
				email: "joe@example.com"
			});

			const gitService = require("../src/services/git");
			jest.mock("../src/services/git");
			gitService.createVersion.mockResolvedValue("v1.1.0");

			const action = require("../src/action");

			await action();
			expect(semverUtils.needsVersion).toHaveBeenCalled();
			expect(semverUtils.resolveVersionType).toHaveBeenCalled();
			expect(semverUtils.resolveAuthor).toHaveBeenCalled();
			expect(gitService.setGitUser).toHaveBeenCalledWith("joe@example.com", "Joe Bishop");
			expect(gitService.createVersion).toHaveBeenCalledWith("minor");
			expect(gitService.pushHead).toHaveBeenCalled();
			expect(gitService.pushTag).toHaveBeenCalledWith("v1.1.0");
			expect(core.setOutput).toHaveBeenCalledWith("version", "v1.1.0");
		});
	});

	describe("given `needsVersion` throws an error", () => {
		test("failure message is set according to error message", async () => {
			const core = require("@actions/core");
			jest.mock("@actions/core");
			const semverUtils = require("../src/utils/semver-utils");
			jest.mock("../src/utils/semver-utils");
			semverUtils.needsVersion.mockImplementation(() => {
				throw new Error("Error Message");
			});

			const action = require("../src/action");

			await action();
			expect(core.setOutput).not.toHaveBeenCalled();
			expect(core.setFailed).toHaveBeenCalledWith("Error Message");
		});
	});
});
