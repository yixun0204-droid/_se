#!/usr/bin/env node
import { run } from '../src/run.js';

const code = await run(process.argv.slice(2));
process.exitCode = code;
