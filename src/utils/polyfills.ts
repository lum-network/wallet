// # for TypeScript
(BigInt.prototype as any).toJSON = function () {
    return this.toString();
};

export {};
