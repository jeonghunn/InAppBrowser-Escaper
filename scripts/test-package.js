const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { dirname, join } = require('node:path');
const { runInNewContext } = require('node:vm');
const { name, peerDependencies } = require('../package.json');

const project = join(__dirname, '..');
const consumer = mkdtempSync(join(tmpdir(), 'inappescaper-package-'));
const node = process.execPath;
const npm = process.env.npm_execpath;
const tsc = require.resolve('typescript/bin/tsc');
const consumerModules = join(consumer, 'node_modules');

function runNpm(args, cwd) {
  execFileSync(node, [npm, ...args], { cwd, stdio: 'inherit' });
}

function runConsumer(source, moduleType) {
  execFileSync(node, ['--input-type=' + moduleType, '-e', source], {
    cwd: consumer,
    stdio: 'inherit',
  });
}

try {
  const packOutput = execFileSync(node, [npm, 'pack', '--json', '--pack-destination', consumer], {
    cwd: project,
    encoding: 'utf8',
  });
  const [{ filename }] = JSON.parse(packOutput);
  const tarball = join(consumer, filename);
  runNpm(['run', 'lint:package', '--', tarball], project);

  writeFileSync(join(consumer, 'package.json'), JSON.stringify({ private: true }));
  runNpm(['install', '--offline', '--ignore-scripts', '--no-audit', '--no-fund', tarball], consumer);

  for (const peer of Object.keys(peerDependencies)) {
    assert.ok(!existsSync(join(consumerModules, peer)), `Unexpected optional dependency: ${peer}`);
  }

  runConsumer(`
    import assert from 'node:assert/strict';
    import Escaper, { InAppBrowserDetector, InAppBrowserEscaper } from '${name}';
    assert.equal(Escaper, InAppBrowserEscaper);
    assert.equal(typeof Escaper.escape, 'function');
    assert.equal(typeof InAppBrowserDetector.analyze, 'function');
  `, 'module');
  runConsumer(`
    const assert = require('node:assert/strict');
    const { default: Escaper, InAppBrowserDetector, InAppBrowserEscaper } = require('${name}');
    assert.equal(Escaper, InAppBrowserEscaper);
    assert.equal(typeof Escaper.escape, 'function');
    assert.equal(typeof InAppBrowserDetector.analyze, 'function');
  `, 'commonjs');

  // Use the locked framework dependencies after testing the core-only install.
  for (const peer of ['react', '@types/react', '@angular/core', '@angular/common', '@angular/compiler', 'rxjs']) {
    const destination = join(consumerModules, peer);
    mkdirSync(dirname(destination), { recursive: true });
    symlinkSync(join(project, 'node_modules', peer), destination, 'junction');
  }
  runConsumer(`
    import assert from 'node:assert/strict';
    import { EscapeButton, useInAppBrowserEscaper } from '${name}/react';
    assert.equal(typeof EscapeButton, 'function');
    assert.equal(typeof useInAppBrowserEscaper, 'function');
  `, 'module');
  runConsumer(`
    const assert = require('node:assert/strict');
    const { EscapeButton, useInAppBrowserEscaper } = require('${name}/react');
    assert.equal(typeof EscapeButton, 'function');
    assert.equal(typeof useInAppBrowserEscaper, 'function');
  `, 'commonjs');

  // The raw Node consumer uses Angular's JIT compiler because it has no app build.
  runConsumer(`
    import assert from 'node:assert/strict';
    import '@angular/compiler';
    import { createNgModule, Injector, PLATFORM_ID } from '@angular/core';
    import { InAppBrowserEscaperModule, InAppBrowserEscaperService } from '${name}/angular';

    const injector = Injector.create({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });
    const module = createNgModule(InAppBrowserEscaperModule, injector);
    try {
      const service = module.injector.get(InAppBrowserEscaperService);
      assert.equal(service.escape(), false);
      assert.equal(service.getBrowserInfo(), null);
    } finally {
      module.destroy();
    }
  `, 'module');

  writeFileSync(join(consumer, 'consumer.mts'), `
    import Escaper, { type EscapeOptions } from '${name}';
    import { useInAppBrowserEscaper } from '${name}/react';
    const options: EscapeOptions = { showModal: false };
    const escape: typeof Escaper.escape = useInAppBrowserEscaper().escapeFromInApp;
    escape(options);
  `);
  writeFileSync(join(consumer, 'consumer.cts'), `
    import core = require('${name}');
    import react = require('${name}/react');
    const options: core.EscapeOptions = { showModal: false };
    const escape: typeof core.default.escape = react.useInAppBrowserEscaper().escapeFromInApp;
    escape(options);
  `);
  const typecheck = [tsc, '--noEmit', '--strict', '--target', 'es2020'];
  execFileSync(node, [...typecheck, '--module', 'nodenext', 'consumer.mts', 'consumer.cts'], {
    cwd: consumer,
    stdio: 'inherit',
  });
  execFileSync(node, [...typecheck, '--module', 'esnext', '--moduleResolution', 'bundler', 'consumer.mts'], {
    cwd: consumer,
    stdio: 'inherit',
  });

  const bundle = join(consumerModules, name, 'dist/browser/inappbrowserescaper.js');
  const window = {};
  runInNewContext(readFileSync(bundle, 'utf8'), { window });
  assert.equal(typeof window.InAppBrowserEscaper.InAppBrowserEscaper.escape, 'function');
  assert.equal(typeof window.InAppBrowserEscaper.InAppBrowserDetector.analyze, 'function');

  console.log('Packed core, React, Angular, declarations, and browser bundle passed.');
} finally {
  rmSync(consumer, { recursive: true, force: true });
}
