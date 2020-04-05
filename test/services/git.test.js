// Child process needed to execute git commands
/* eslint-disable security/detect-child-process */

describe("git", () => {
	describe("setGitUser", () => {
		describe("given email and name", () => {
			test("calls `git config` with passed variables", async () => {
				const childProcess = require("child_process");
				jest.mock("child_process");
				childProcess.exec.mockImplementation((command, callback) => {
					callback(null, {
						stdout: "Mock exec " + command + " stdout",
						stderr: "Mock exec " + command + " stderr"
					});
				});
				const { setGitUser } = require("../../src/services/git");

				await setGitUser("joe@example.com", "Joe Bishop");
				expect(childProcess.exec).toHaveBeenCalledTimes(2);

				const commands = [
					childProcess.exec.mock.calls[0][0],
					childProcess.exec.mock.calls[1][0]
				];
				const hasName = commands.some(command =>
					command.match(/git config.+name.+"Joe Bishop"/)
				);
				expect(hasName).toBe(true);
				const hasEmail = commands.some(command =>
					command.match(/git config.+email.+"joe@example.com"/)
				);
				expect(hasEmail).toBe(true);
			});
		});
	});

	describe("createVersion", () => {
		describe("given `npm version` returns created tag successfully", () => {
			test("calls `npm version` and returns created version", async () => {
				const childProcess = require("child_process");
				jest.mock("child_process");
				childProcess.exec.mockImplementation((command, callback) => {
					callback(null, {
						stdout: ["Pre-version line", "v1.0.0", ""].join("\n"),
						stderr: ""
					});
				});
				const { createVersion } = require("../../src/services/git");

				const version = await createVersion();
				expect(childProcess.exec).toHaveBeenCalledTimes(1);
				expect(childProcess.exec.mock.calls[0][0]).toBe("npm version patch");
				expect(version).toBe("v1.0.0");
			});
		});
	});

	describe("pushHead", () => {
		test("calls `git push origin HEAD`", async () => {
			const childProcess = require("child_process");
			jest.mock("child_process");
			const { pushHead } = require("../../src/services/git");

			await pushHead();
			expect(childProcess.exec).toHaveBeenCalledTimes(1);
			expect(childProcess.exec.mock.calls[0][0]).toBe("git push origin HEAD");
		});
	});

	describe("pushTag", () => {
		test("calls `git push origin {tagName}`", async () => {
			const childProcess = require("child_process");
			jest.mock("child_process");
			const { pushTag } = require("../../src/services/git");

			await pushTag("v1.0.0");
			expect(childProcess.exec).toHaveBeenCalledTimes(1);
			expect(childProcess.exec.mock.calls[0][0]).toBe("git push origin v1.0.0");
		});
	});
});
