const tsJestPreset = require('ts-jest/jest-preset');
const puppeteerPreset = require('jest-puppeteer/jest-preset');

module.exports = {
  ...tsJestPreset,
  ...puppeteerPreset,
  testEnvironment: 'jest-environment-puppeteer',
  roots: ['<rootDir>/src'],
};
