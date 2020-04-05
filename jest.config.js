module.exports = {
	clearMocks: true,
	testPathIgnorePatterns: ["node_modules", "template"],
	coveragePathIgnorePatterns: ["<rootDir>/test/mocks"],
	coverageReporters: ["json", "lcov", "json-summary", "text"],
	coverageThreshold: {
		global: {
			statements: 85,
			branches: 60,
			functions: 85,
			lines: 90
		}
	}
};
