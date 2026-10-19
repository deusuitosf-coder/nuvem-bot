import assert from "node:assert/strict";
import test from "node:test";
import { defenseHeaders } from "./site-defense.mjs";

test("published pages get the headers this app can actually set", () => {
  const headers = defenseHeaders({ https: true, csp: true });
  assert.equal(headers["x-content-type-options"], "nosniff");
  assert.match(headers["content-security-policy"], /object-src 'none'/);
  assert.match(headers["content-security-policy"], /script-src 'self' 'unsafe-inline' https:\/\/grok\.com/);
  assert.match(headers["content-security-policy"], /frame-ancestors 'self'/);
  assert.match(headers["content-security-policy"], /script-src-attr 'none'/);
  assert.match(headers["content-security-policy"], /base-uri 'none'/);
  assert.match(headers["content-security-policy"], /upgrade-insecure-requests/);
  assert.equal(headers["x-frame-options"], undefined);
  assert.match(headers["strict-transport-security"], /max-age=15552000/);
});

test("HTTP preview is not upgraded to an unavailable HTTPS listener", () => {
  assert.doesNotMatch(defenseHeaders({ https: false, csp: true })["content-security-policy"], /upgrade-insecure-requests/);
});

test("the local preview skips the policy that would break the page", () => {
  const headers = defenseHeaders({ https: false, csp: false });
  assert.equal(headers["content-security-policy"], undefined);
  assert.equal(headers["strict-transport-security"], undefined);
  assert.equal(headers["x-content-type-options"], "nosniff");
});
