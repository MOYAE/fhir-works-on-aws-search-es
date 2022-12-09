"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsyncRefreshCache = void 0;
/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */
/**
 * Periodically calls an async fn and keeps its latest response value cached.
 */
// eslint-disable-next-line import/prefer-default-export
class AsyncRefreshCache {
    /**
     * @param loadFn - async function to be called periodically
     * @param period - wait time in seconds before calling `loadFn` again
     */
    constructor(loadFn, period = 3000) {
        this.values = loadFn();
        this.interval = setInterval(() => {
            this.values = loadFn();
        }, period);
    }
    async get() {
        return this.values;
    }
    stop() {
        clearInterval(this.interval);
    }
}
exports.AsyncRefreshCache = AsyncRefreshCache;
//# sourceMappingURL=AsyncRefreshCache.js.map